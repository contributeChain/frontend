# Transaction Lifecycle

This guide will help you manage the lifecycle of Lens transactions.

## Tiered Transaction Model

The Lens API's approach to write operations prioritizes user convenience through a tiered transaction model. This model spans from signless transactions to options requiring user signatures and gas fees, offering the best possible experience based on the individual user's circumstances.

There are three classes of operations in this model:

- **Social Operations**: These operations can be done by a Manager on behalf of the Account owner.
- **Restricted Operations**: These operations require the Account owner's signature due to their nature.
- **Management Operations**: These operations could be funded by the server if the user is eligible. These are used to facilitate management operations such as creating new Apps, creating Custom Graphs, etc.

The Lens API adapts its operation results based on user eligibility, ensuring users can proceed with the best available options, from the smoothest experience to necessary fallbacks.

### Social Operations

The tiered transaction model for Social Operations is as follows:

#### 1. Signless Sponsored Transaction - Best UX

**Description**: Automatically signed and sent by the Lens API, with gas fees sponsored.

**Requirements**: Available when the user enabled the signless experience, the user is eligible for sponsorship, and the operation is deemed secure for signless execution.

#### 2. Sponsored Transaction Request

**Description**: Requires the user to sign and send a gasless transaction request, powered by ZKsync EIP-712.

**Requirements**: Available if the user is eligible for sponsorship but lacks signless support.

#### 3. Self-Funded Transaction Request - Fallback

**Description**: Requires user signature and gas payment, following a standard EIP-1559 transaction request.

**Requirements**: Used when neither signless nor sponsored transactions are available.

### Restricted Operations

The tiered transaction model for Restricted Operations is as follows:

#### 1. Sponsored Transaction Request - Best UX

**Description**: Requires the user to sign and send a gasless transaction request, powered by ZKsync EIP-712.

**Requirements**: Available when the user is eligible for sponsorship.

#### 2. Self-Funded Transaction Request - Fallback

**Description**: Requires user signature and gas payment, following a standard EIP-1559 transaction request.

**Requirements**: Used when the user is not eligible for sponsorship.

### Management Operations

The tiered transaction model for Management Operations is as follows:

#### 1. Signless Sponsored Transaction - Best UX

**Description**: Automatically signed and sent by the Lens API, with gas fees sponsored.

**Requirements**: Available when the user is eligible for sponsorship and the operation is deemed secure for signless execution.

#### 2. Sponsored Transaction Request

**Description**: Requires the user to sign and send a gasless transaction request, powered by ZKsync EIP-712.

**Requirements**: Available when the user is eligible for sponsorship but the operation requires an explicit signature of the primitive's owner or an admin.

#### 3. Self-Funded Transaction Request - Fallback

**Description**: Requires user signature and gas payment, following a standard EIP-1559 transaction request.

**Requirements**: Used when the server deems the user as not eligible for sponsorship.

## Operation Results

The tiered transaction model results is modelled as a union type with the possible outcomes for each operation type.

In the examples below the terms Operation Result and Operation Response are used as placeholders for the actual operation at hand (e.g., `PostResult` and `PostResponse`, `FollowResult` and `FollowResponse`).

```typescript
type OperationResult =
  | OperationResponse
  | SponsoredTransactionRequest
  | SelfFundedTransactionRequest
  | TransactionWillFail;
```

The union could include additional failure scenarios specific to the operation.

Where:

- `OperationResponse`: Indicates that the transaction was successfully sent and returns the transaction hash for further monitoring.
- `SponsoredTransactionRequest`: Requests the user to sign and send the transaction, with gas fees covered.
- `SelfFundedTransactionRequest`: Requests the user to sign and send the transaction, with the user covering gas fees.
- `TransactionWillFail`: This is an omnipresent entry that, if returned, indicates that the transaction will fail with a specific reason.

```typescript
type SponsoredTransactionRequest = {
  reason: string;
  sponsoredReason: string;
  raw: Eip712TransactionRequest;
};

type Eip712TransactionRequest = {
  type: string;
  to: string;
  from: string;
  nonce: number;
  gasLimit: string;
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
  data: string;
  value: string;
  chainId: number;
  customData?: {
    gasPerPubdata?: string;
    factoryDeps?: string[];
    customSignature?: string;
    paymasterParams?: {
      paymaster: string;
      paymasterInput: string;
    };
  };
};
```

Both `SponsoredTransactionRequest` and `SelfFundedTransactionRequest` types include:

- `reason` - a user-friendly message indicating the reason for the fallback, if any.
- an enum reason field - a dev-friendly enum indicating the reason for the fallback, if any:
  - `sponsoredReason`: `SIGNLESS_DISABLED`, `SIGNLESS_FAILED`
  - `selfFundedReason`: `NOT_SPONSORED`, `CANNOT_SPONSOR`
- `raw` - the transaction request details to be signed and sent by the user.

## Wallet Adapters

### Manual

Given a signer from the Ethereum wallet library of your choice:

```typescript
// viem.ts
import "viem/window";

import { chains } from "@lens-chain/sdk/viem";
import { type Address, createWalletClient, custom } from "viem";

// hoist account
const [address] = (await window.ethereum!.request({
  method: "eth_requestAccounts",
})) as [Address];

export const walletClient = createWalletClient({
  account: address,
  chain: chains.testnet,
  transport: custom(window.ethereum!),
});
```

Use one of the provided adapters to handle the operation results with the signer.

```typescript
// viem
import { uri } from "@lens-protocol/client";
import { post } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await post(sessionClient, {
  contentUri: uri("lens://…"),
}).andThen(handleOperationWith(walletClient));
```

## Transaction Monitoring

At this point, whether you received an Operation Response or you sent a transaction request via the user's wallet (`SponsoredTransactionRequest` or `SelfFundedTransactionRequest`), you should have a transaction hash.

Chain the `sessionClient.waitForTransaction` method to monitor the transaction's until it's fully mined and indexed.

```typescript
// viem
const result = await post(sessionClient, { contentUri: uri("lens://…") })
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isOk()) {
  console.log("Transaction indexed:", result.value); // "0x1234…"
} else {
  console.error("Transaction failed:", result.error);
}
```

If you are more familiar with a Promise-based approach, you can use the `waitForTransaction` method directly:

```typescript
// viem
const result = await post(sessionClient, { contentUri: uri("lens://…") });

if (result.isErr()) {
  return console.error("Transaction failed:", result.error);
}

switch (result.value.__typename) {
  case "PostResponse":
    await sessionClient.waitForTransaction(result.value.hash);
    break;

  case "SponsoredTransactionRequest":
    const hash = await sendEip712Transaction(walletClient, {
      data: result.value.raw.data,
      gas: BigInt(result.value.raw.gasLimit),
      maxFeePerGas: BigInt(result.value.raw.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(result.value.raw.maxPriorityFeePerGas),
      nonce: result.value.raw.nonce,
      paymaster: result.value.raw.customData.paymasterParams?.paymaster,
      paymasterInput:
        result.value.raw.customData.paymasterParams?.paymasterInput,
      to: result.value.raw.to,
      value: BigInt(result.value.raw.value),
    });
    break;

  case "SelfFundedTransactionRequest":
    const hash = await sendTransaction(walletClient, {
      data: result.value.raw.data,
      gas: BigInt(result.value.raw.gasLimit),
      maxFeePerGas: BigInt(result.value.raw.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(result.value.raw.maxPriorityFeePerGas),
      nonce: result.value.raw.nonce,
      to: result.value.raw.to,
      type: "eip1559",
      value: BigInt(result.value.raw.value),
    });
    break;

  default:
    console.error("Failed to post due to:", result.value.reason);
}
```

# API Migration

This guide will walk you through the necessary steps to upgrade to the latest versions of the API.

This guide assumes familiarity with Lens Protocol v2 and the Lens API v2.

## Changed API Calls

This guide below will list old Lens v2 GraphQL queries and mutations mapped to the new Lens v3 ones. As GraphQL is a type system we will not describe if the request object has changed as you can easily see this on the GraphQL playground. Note we have not integrated actions and rules yet in the API and indexer so they are missing from here for now.

### Queries

#### Restructured

Only listing changes from v2 to v3 and not any new queries.

- `challenge` > now a mutation
- `verify` > use RSA keys to verify
- `approvedAuthentications` > `authenticatedSessions`
- `currentSession` > `currentSession`
- `ownedHandles` > `usernames`
- `handleToAddress` > `account`
- `feed` > `timeline`
- `feedHighlights` > `timelineHighlights`
- `mutualFollowers` > `followersYouKnow`
- `followStatusBulk` > `followStatus`
- `profiles` > `accountsBulk`
- `profile` > `account`
- `profileInterestsOptions` > it will be moved to metadata
- `whoHaveBlocked` > `accountsBlocked`
- `lastLoggedInProfile` > `lastLoggedInAccount`
- `profileManagers` > `accountManagers`
- `profilesManaged` > `accountsAvailable`
- `profileRecommendations` > `mlAccountRecommendations`
- `searchProfiles` > `accounts`
- `publications` > `posts` and `postReferences`
- `publication` > `post`
- `publicationsTags` > `postTags`
- `publicationBookmarks` > `postBookmarks`
- `whoReactedPublication` > `postReactions`
- `didReactOnPublication` > `postReactionsStatus`
- `explorePublications` > `mlPostsExplore`
- `validatePublicationMetadata` > `debugMetadata`
- `forYou` > `mlPostsForYou`
- `searchPublications` > `posts`
- `userRateLimit` > `me` (under `SponsorshipAllowance`)
- `lensTransactionStatus` > `transactionStatus`
- `whoActedOnPublication` > `whoExecutedActionOnPost`
- `supportedOpenActionModules` > `postActionContracts`
- `supportedFollowModules` > Not complete yet
- `moduleMetadata` > it's inlined in the relevant GQL notes (e.g. `UnknownAction.metadata`)

#### Deprecated

- approvedModuleAllowanceAmount
- canClaim
- claimableProfiles
- claimableStatus
- claimableTokens
- claimTokens
- defaultProfile
- exploreProfiles
- followRevenues
- generateLensAPIRelayAddress
- generateModuleCurrencyApprovalData
- invitedProfiles
- latestPaidActions
- lensAPIOwnedEOAs
- lensProtocolVersion
- momokaSubmitters
- momokaSummary
- momokaTransaction
- momokaTransactions
- mutualNftCollections
- mutualPoaps
- nftCollectionOwners
- nftCollections
- nftGalleries
- nfts
- poapEvent
- poapHolders
- poaps
- popularNftCollections
- profileActionHistory
- profileAlreadyInvited
- relayQueues
- revenueFromPublication
- revenueFromPublications
- setDefaultProfile
- txIdToTxHash
- userSigNonces

### Mutations

#### Restructured

Only listing changes from v2 to v3 and not any new mutations.

- `walletAuthenticationToProfileAuthentication` > `switchAccount`
- `linkHandleToProfile` > `assignUsernameToAccount`
- `unlinkHandleFromProfile` > `unassignUsernameFromAccount`
- `createLinkHandleToProfileTypedData` > `assignUsernameToAccount`
- `createUnlinkHandleFromProfileTypedData` > `unassignUsernameFromAccount`
- `createFollowTypedData` > `follow`
- `createUnfollowTypedData` > `unfollow`
- `setFollowModule` > `setAccountFollowRule`
- `createSetFollowModuleTypedData` > `setAccountFollowRule`
- `postOnMomoka` > `post`
- `commentOnMomoka` > `post`
- `quoteOnMomoka` > `post`
- `mirrorOnMomoka` > `post`
- `createMomokaQuoteTypedData` > `post`
- `createMomokaPostTypedData` > `post`
- `createMomokaCommentTypedData` > `post`
- `createMomokaMirrorTypedData` > `post`
- `addProfileInterests` > `setAccountMetadata`
- `removeProfileInterests` > `setAccountMetadata`
- `dismissRecommendedProfiles` > `mlDismissRecommendedAccounts`
- `reportProfile` > `reportAccount`
- `peerToPeerRecommend` > `recommendAccount`
- `peerToPeerUnrecommend` > `undoRecommendedAccount`
- `hideManagedProfile` > `hideManagedAccount`
- `unhideManagedProfile` > `unhideManagedAccount`
- `setProfileMetadata` > `setAccountMetadata`
- `createOnchainSetProfileMetadataTypedData` > `setAccountMetadata`
- `createChangeProfileManagersTypedData` > `addAccountManager`, `removeAccountManager` and `updateAccountManager`
- `createBlockProfilesTypedData` > `block`
- `createUnblockProfilesTypedData` > `unblock`
- `hidePublication` > `deletePost`
- `hideComment` > `hideReply`
- `unhideComment` > `unhideReply`
- `addPublicationNotInterested` > `mlAddPostNotInterested`
- `undoPublicationNotInterested` > `mlUndoPostNotInterested`
- `addPublicationBookmark` > `bookmarkPost`
- `removePublicationBookmark` > `undoBookmarkPost`
- `removeReaction` > `undoReaction`
- `reportPublication` > `reportPost`
- `postOnchain` > `post`
- `commentOnchain` > `post`
- `quoteOnchain` > `post`
- `mirrorOnchain` > `post`
- `refreshPublicationMetadata` > `editPost`
- `createOnchainPostTypedData` > `post`
- `createOnchainCommentTypedData` > `post`
- `createOnchainQuoteTypedData` > `post`
- `createOnchainMirrorTypedData` > `post`
- `actOnOpenAction` > Not complete yet
- `createActOnOpenActionTypedData` > Not complete yet

#### Deprecated

- `broadcastOnMomoka` > use `post` for everything
- broadcastOnchain
- legacyCollect
- createLegacyCollectTypedData
- createNftGallery
- updateNftGalleryInfo
- updateNftGalleryOrder
- updateNftGalleryItems
- deleteNftGallery
- nftOwnershipChallenge
- claimProfileWithHandle
- invite
- idKitPhoneVerifyWebhook

## Processes

- Typed data does not exist anymore its handled all in the mutation response union
- Momoka does not exist anymore
- Tx Id does not exist anymore

## Seamless Authentication Rollover

In order to provide a seamless transition for users, we have implemented a new authentication mechanism that allows you to refresh tokens from Refresh Token issued by the Lens API v2.

You can call the `legacyRolloverRefresh` mutation to acquire new authentication tokens.

```graphql
mutation {
  legacyRolloverRefresh(request: { refreshToken: "<legacy-refresh-token>" }) {
    ... on AuthenticationTokens {
      accessToken
      refreshToken
      idToken
    }

    ... on ForbiddenError {
      reason
    }
  }
}
```

The provided Refresh Token must still be valid. Since they last for 7 days from the time they are issued, this rollover mechanism is a short-term solution to allow for a seamless transition. If you think that most of your app's users will have their Refresh Token expired by the time they try to log-in into your Lens v3 app, you probably can omit this integration and just force users to re-authenticate.

## New Features

Explore the Lens v3 documentation for all the new features.

# Database Migration

This guide will help you navigate schema changes and table updates from Lens v2 to v3.

The Lens V3 schema has been changed on reflection from all our learning on the past protocols. If you were using Public Big Query this will show you want the names of the tables where and what they are now. This guide will only highlight V2 tables any new ones you can look on the Public Big Query. Note we have not integrated actions and rules yet in the API and indexer so they are missing from here for now.

## Key differences

You will see on the schema a more less strict primary key and foreign key structure, with Lens V3 we optimised for speed and indexing blockchain data can be a lot faster if you process things concurrently.

Database size has been optimised so we are storing binary format for all the hex values which makes each value 2x less in size alongside makes queries faster.

## Moved Tables

Note the new tables may also have different columns.

- `app_stats.profile` > `app.account_post_summary`
- `app_stats.profile_reacted` > `app.account_reacted_summary`
- `app_stats.profile_reaction` > `app.account_reaction_summary`
- `app_stats.publication` > `app.post_summary`
- `app_stats.publication_reaction` > `app.post_reaction_summary`
- `app_stats.publication_tag` > `app.post_tag_summary`
- `curation.profile` > `curation.account`
- `curation.profile_tag` > `curation.account_tag`
- `enabled.currency` > `currencies.record`
- `global_stats.profile` > `account.post_summary`
- `global_stats.profile_follower` > `account.follower_summary`
- `global_stats.profile_reacted` > `account.reacted_summary`
- `global_stats.profile_reaction` > `account.reaction_summary`
- `global_stats.publication` > `post.summary`
- `global_stats.publication_reaction` > `post.reaction_summary`
- `global_stats.publication_tag` > `post.tag_summary`
- `machine_learning.for_you_global_feed` > `ml.for_you_global_timeline`
- `machine_learning.popularity_trending_feed` > `ml.popularity_trending_timeline`
- `machine_learning.profile_boosting` > `ml.account_boosting`
- `machine_learning.quality_profiles` > `ml.account_score`
- `machine_learning.reply_ranking` > `ml.reply_ranking`
- `namespace.handle` > `username.record`
- `namespace.record` > `username.namespace_record`
- `namespace.handle_link` > `account.username_assigned`
- `notification.record` > `account.notification`
- `personalisation.bookmarked_publication` > `account.bookmarked_post`
- `personalisation.not_interested_publication` > `account.not_interested_post`
- `personalisation.wtf_recommendation_dismissed` > `ml.who_to_follow_dismissed`
- `personalisation.wtf_recommendation_dismissed` > `ml.who_to_follow_dismissed`
- `profile.follow_module` > `account.follow_rule`
- `profile.last_logged_in` > `account.last_logged_in`
- `profile.follower` > `account.follower`
- `profile.ownership_history` > `account.record_owner_history`
- `profile.peer_to_peer_recommendation` > `account.peer_to_peer_recommendation`
- `publication.mention` > `post.mention`
- `profile.record` > `account.record`
- `profile.reported` > `account.reported`
- `publication.hashtag` > `post.hashtag`
- `publication.open_action_module` > `post.action`
- `publication.open_action_module_acted_record` > `account.acted`
- `publication.metadata` > `post.metadata`
- `publication.open_action_module_collect_nft` > `post.action` column `collect_nft_address`
- `publication.open_action_module_multirecipient` > `post.action` column `recipients`
- `publication.reaction` > `post.reaction`
- `publication.reaction_type` > `post.reaction_type`
- `publication.record` > `post.record`
- `publication.reported` > `post.reported`
- `publication.tag` > `post.tag`
- `profile.blocked` > `account.blocked`
- `profile.manager` > `account.manager`
- `profile.metadata` > `account.metadata`
- `profile.metadata_failed` > `metadata.failed`
- `profile.metadata_pending` > `metadata.pending`
- `publication.failed` > `metadata.failed`
- `publication.pending` > `metadata.pending`
- `publication.type` > `post.type`
- `enabled.follow_module` > Not completed yet
- `enable.reference_module` > Not completed yet
- `enabled.open_action_module` > Not completed yet
- `profile.follow_module_record` > Not completed yet
- `publication.reference_module` > Not completed yet
- `publication.referrer` > Not completed yet
- `publication.open_action_module_acted_record_referrer` > Not completed yet

## Deprecated Tables

These tables have been killed

- app.onboarding_access
- app.onboarding_handle
- app.onboarding_profile
- app.profile_revenue
- app.profile_revenue
- app.profile_revenue_record
- app.public_key
- app.publication_revenue
- app.publication_revenue_open_action
- app.publication_revenue_record
- app_stats.hashtag
- app_stats.mention
- app_stats.mention_handle
- app_stats.profile_open_action
- app_stats.publication_content_warning
- app_stats.publication_locale
- app_stats.publication_main_content_focus
- app_stats.publication_open_action
- app_stats.publication_tagged
- curation.profile_interest
- enabled.currency_history
- enabled.follow_module_history
- enabled.open_action_module_history
- enable.profile_creator
- enable.profile_creator_history
- enable.reference_module_history
- ens
- fiat
- global_stats.hashtag
- global_stats.mention
- global_stats.mention_handle
- global_stats.profile_manager
- global_stats.profile_open_action
- global_stats.publication_content_warning
- global_stats.publication_locale
- global_stats.publication_main_content_focus
- global_stats.publication_open_action
- global_stats.publication_tagged
- machine_learning.profile_boosting_history
- machine_learning.proof_of_human
- media.livepeer_mapping
- momoka.*
- namespace.handle_guardian
- namespace.handle_guardian_history
- namespace.handle_history
- namespace.handle_link_history
- nft.*
- notification.type
- personalisation.bookmarked_publication_history
- personalisation.not_interested_publication_history
- poap.*
- profile.action_history
- profile.blocked_history
- profile.default
- profile.follow_module_history
- profile.follow_nft
- profile.follower_history
- profile.gallery
- profile.gallery_history
- profile.guardian
- profile.guardian_history
- profile.interest
- profile.interest_history
- profile.manager_active_config_number
- profile.manager_active_config_number_history
- profile.manager_all_config
- profile.manager_all_config_history
- profile.metadata_history
- profile.nft_picture
- profile.nft_picture_history
- profile.revenue
- profile.revenue_record
- profile.unfollow_audit_log
- proof_of_humanity.*
- protocol.*
- publication.hashtag_history
- publication.id
- publication.mention_history
- publication.metadata_history
- publication.open_action_module_collect_nft_ownership
- publication.open_action_module_collect_nft_ownership_history
- publication.open_action_module_history
- publication.reaction_history
- publication.reference_module_history
- publication.revenue
- publication.revenue_open_action
- publication.revenue_record
- publication.secured_metadata_id_executed
- publication.tag_history
- sybil_dot_org.*
- worldcoin.*

# Migration Plan From Lens V2

This guide will walk you through how data will be migrated from Lens v2 on Polygon to Lens v3.

Lens V2 is currently live on Polygon and we will be migrating all the data for Lens V3 onto Lens Chain. We want to apply the migration on the initial creation of Lens Chain mainnet and in turn make it automatic and seamless as possible for everyone. Below we walk through all the data we will migrate and how we are going to approach it please note that these migration plans are still work in progress and can change as we get feedback from people.

## Profiles > Accounts

Lens V2 Profiles which are now called accounts on Lens V3 will be migrated automatically, the big difference between Profiles and Accounts is that Profiles are an NFT and accounts on Lens V3 are a smart wallet. The flow of the migration will be this:

### 1. The Profile is owned by an EOA

If the Profile is owned by an EOA then we will deploy a new Account and give ownership to that EOA.

### 2. The Profile is owned by a Safe

If the Safe has a 1/1 signer and that signer is EOA we will deploy a new Safe and assign the same 1/1 signer up, we will then deploy a new Account and give ownership to that Account to the Safe.

### 3. The Profile is owned by an unknown Contract

If this is the case we will mint the Account on your behalf and have way via the Lens API you can claim it by signing if possible, if not possible we can work with you to prove ownership then change ownership of the Account over to you.

## Handles > Usernames

Lens V2 Handles which are now called Usernames on Lens V3 will be migrated automatically. We will follow a similar process for how we will go about migrating Profiles onto Lens V3. Usernames can have many namespaces so all of the below will happen on the lens namespace.

### 1. The Handle is owned by an EOA

If the Handle is owned by an EOA then we will deploy a new Account and give ownership to that EOA. If that EOA has deployed an Account we will send the username to the Account smart wallet.

### 2. The Handle is owned by a Safe

If the Safe has a 1/1 signer and that signer is EOA we will deploy a new Safe and assign the same 1/1 signer up, we will then mint the username and give ownership to that username to the Safe. If the Safe has already been deployed when migrating the Account we will send the username to the Account smart wallet.

### 3. The Handle is owned by an unknown Contract

If this is the case we will mint the Username on your behalf and have way via the Lens API you can claim it by signing if possible, if not possible we can work with you to prove ownership then send the Username over to you.

## Profiles Linked To Handles > Username Linked To Accounts

On Lens V2 Profiles were also linked to Handles we will automatically apply this link if exists.

## Profile Managers > Account Managers

On Lens V2 we had Profile managers which could do stuff onbehalf of the Profile, in Lens V3 we have Account Managers which can control aspects on the Account. We also have Lens API Profile managers who enabled signless for the user.

### 1. The Profile manager is owned by Lens API

In this case we will generate a new Lens API dispatcher so you can still do signless on Lens V3. With Lens V3 dispatchers are now 1 of 1 this means each dispatcher is not shared with anyone else but you.

### 2. The Profile manager is an EOA

We will assign this EOA as Account manager

### 3. The Profile manager is a Contract or Safe

If the current Profile manager is a contract or a safe we will not assign it and will need to be added again.

## Blocked Profiles > Blocked Accounts

Any Profiles you blocked on Lens V2 will be applied to Lens V3.

## Follow connections

On Lens V3 we now have multiple graphs so we will migrate all the follows on Lens V2 and apply them on the global graph automatically.

## Profile Follow Modules > Follow Rules

On Lens V2 you could set paid to follow if that is the case we will enable that follow rule on your account but it will be applied as GHO and be the exchange rate at the time of migration.

## Publications > Posts

On Lens V3 we now have multiple feeds so we will migrate all the publications to posts on the global feed.

## Post/Account Metadata Storage

We will honour the metadata it is stored on and advise people to look at the storage nodes for future uploads.

## Publication Actions > Post Actions

We will not auto set any Post Actions for the Account, the Lens V3 supports editing Posts so if you want to enable that action on Lens V3 you can edit and set it up. This includes collect actions.

## Collects

Collects are NFTs which live on within the network itself in this case Polygon so we will not be deploying any collections from Lens V2.

## Centralised Data

All centralised data like reactions, reports, recommendations will be migrated.

## ML trainned algos

All machine learning modals will be migrated and supported on Lens V3.

# Future of Lens V2

After the launch of Lens Chain and the migration of Lens V2 data onto Lens V3 we will slowly start deprecating Lens V2 protocol infrastructure support for the protocol which we run including The Lens API. Below is a list of actions we will do, timelines of us deprecating this is open, we want to support the apps migrating over and one of the main reasons we have done a dev preview first.

## Gas Sponsorship

As the Lens API pays for most the gas costs for the users on behalf of the apps we firstly will bring this limit down slowly to 0. This includes Momoka publications which we will slowly also bring down the amount of limits people can post using it. The slow down of the gas paying will start instantly on mainnet launch.

## Lens API and Indexers

The Lens API and indexers powers most of the applications built in Lens in some way, on launch of Lens Chain we will decrease the server sizes for the API which in turn will mean it will be slower then it is now for queries. Over time we will completely turn this off.

## Public Big Query

The Lens indexers publishes all the indexed data to public big query to allow anyone to query it. This will be supported until we turn off the Lens API and indexers.

## SNS

SNS powers some apps by doing push notifications when events are indexed. This will be supported until we turn off the Lens API and indexers.

## Direct DB access

If you have a read replica of the Lens DB this will also be scaled down on launch of Lens Chain and revoked access after a short period of time. We can work with the apps to work out the timescale which makes sense for them.

## General Bug Fixing / Support

On launch of the mainnet for Lens Chain with Lens V3 we will not maintain or support bugs and give developer support on the old protocol, we will also not add any new features. The only way we will react is if the bug is a critical and users funds/identities are at risk.


```