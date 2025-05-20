# Username Management

## Create Username

This guide explains how to create a new username.

Username issuance is regulated by Namespace Rules defined on the desired Namespace.

If you're creating a username under the Global Lens Namespace (i.e., `lens/*`), the only restrictions are:

- Allowed characters: `a-z`, `0-9`, `-`, and `_`
- Minimum length: 5 characters
- Must start with a letter or a number

The length of a username is limited to a maximum of 26 characters on any namespace.

To create a new username, follow these steps.

**You MUST be authenticated as the Account Owner or Account Manager of the Account that you intend to be the initial owner of the new username.**

### 1. Verify Availability

First, verify if the desired username is available.

#### TypeScript
```typescript
import { canCreateUsername } from "@lens-protocol/client/actions";
import { client } from "./client";

const result = await canCreateUsername(sessionClient, {
  localName: "wagmi",
});

if (result.isErr()) {
  return console.error(result.error);
}

result.value; // CanCreateUsernameResult
```

The `CanCreateUsernameResult` tells you if the logged-in Account satisfy the Namespace Rules for creating a username, and if the desired username is available.

##### Check CanCreateUsernameResult
```typescript
switch (data.__typename) {
  case "NamespaceOperationValidationPassed":
    // Creating a username is allowed
    break;

  case "NamespaceOperationValidationFailed":
    // Creating a username is not allowed
    console.log(data.reason);
    break;

  case "NamespaceOperationValidationUnknown":
    // Validation outcome is unknown
    break;

  case "UsernameTaken":
    // The desired username is not available
    break;
}
```

Where:

- **NamespaceOperationValidationPassed**: The logged-in Account can create a username under the desired Namespace.
- **NamespaceOperationValidationFailed**: Reposting is not allowed. The `reason` field explains why, and `unsatisfiedRules` lists the unmet requirements.
- **NamespaceOperationValidationUnknown**: The Namespace has one or more unknown rules requiring ad-hoc verification. The `extraChecksRequired` field provides the addresses and configurations of these rules.
- **UsernameTaken**: The desired username is not available.

Treat the `NamespaceOperationValidationUnknown` as failed unless you intend to support the specific rules. See Namespace Rules for more information.

To learn more about how to use Namespace Rules, see the Namespace Rules guide.

### 2. Create the Username

Next, if available, create the username.

#### TypeScript
```typescript
import { createUsername } from "@lens-protocol/client/actions";

const result = await createUsername(sessionClient, {
  username: {
    localName: "wagmi",
  },
});
```

### 3. Handle Result

#### TypeScript with viem
```typescript
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await createUsername(sessionClient, {
  username: {
    localName: "wagmi",
  },
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

That's it—you have successfully created a new username.

## Fetch Usernames

This guide will help you with fetching Usernames from Lens API.

### Fetch a Username

#### TypeScript
```typescript
import { fetchUsername } from "@lens-protocol/client/actions";
import { client } from "./client";

const result = await fetchUsername(client, {
  username: {
    localName: "alice",
    // namespace: evmAddress("0x1234…"), - optional for custom namespaces
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// { ID: string, value: string, linkedTo: evmAddress, owner: evmAddress, ... }
const username = result.value;
```

### List Usernames

#### TypeScript
```typescript
import { fetchUsernames } from "@lens-protocol/client/actions";
import { client } from "./client";

const result = await fetchUsernames(client, {
  filter: {
    localNameQuery: "tom",
    // namespace: evmAddress("0x1234…"), - optional for custom namespaces
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Username>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## Assigning Usernames

This guide explains how to assign and unassign a username to an Account on Lens.

### Assign a Username

To assign a Username to the logged-in Account, follow these steps.

**You MUST be authenticated as Account Owner or Account Manager of the Account you want to assign a Username to.**

#### 1. Fetch Owned Usernames

First, list all usernames owned by the logged-in Account.

##### TypeScript
```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchUsernames } from "@lens-protocol/client/actions";
import { client } from "./client";

const result = await fetchUsernames(sessionClient, {
  filter: { owned: evmAddress("0x1234…") },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Username>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

#### 2. Check Rules

Next, inspect the `username.operations.canAssign` field of the desired Username to determine whether the logged-in Account is allowed to assign the given Username. Some username namespaces may have restrictions on who can assign a Username.

```typescript
switch (username.operations.canAssign.__typename) {
  case "NamespaceOperationValidationPassed":
    // Assignment is allowed
    break;

  case "NamespaceOperationValidationFailed":
    // Assignment is not allowed
    console.log(username.operations.canAssign.reason);
    break;

  case "NamespaceOperationValidationUnknown":
    // Validation outcome is unknown
    break;
}
```

Where:

- **NamespaceOperationValidationPassed**: The logged-in Account is allowed to assign the given Username.
- **NamespaceOperationValidationFailed**: Assignment is not allowed. The `reason` field explains why, and `unsatisfiedRules` lists the unmet requirements.
- **NamespaceOperationValidationUnknown**: The Namespace has one or more unknown rules requiring ad-hoc verification. The `extraChecksRequired` field provides the addresses and configurations of these rules.

Treat the `NamespaceOperationValidationUnknown` as failed unless you intend to support the specific rules. See Namespace Rules for more information.

#### 3. Assign the Username

Next, if allowed, assign the desired Username to the Account.

##### TypeScript
```typescript
import { assignUsernameToAccount } from "@lens-protocol/client/actions";

const result = await assignUsernameToAccount(sessionClient, {
  username: {
    localName: "wagmi",
  },
});
```

#### 4. Handle Result

##### TypeScript with viem
```typescript
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await assignUsernameToAccount(sessionClient, {
  username: {
    localName: "wagmi",
  },
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### Unassign a Username

To unassign a Username from the logged-in Account, follow these steps.

**You MUST be authenticated as Account Owner or Account Manager of the Account that owns the Username you want to unassign.**

#### 1. Check Rules

First, inspect the `username.operations.canUnassign` field of the desired Username to determine whether the logged-in Account is allowed to unassign the given Username. Some username namespaces may have restrictions on who can unassign a Username.

```typescript
switch (username.operations.canUnassign.__typename) {
  case "NamespaceOperationValidationPassed":
    // Unassignment is allowed
    break;

  case "NamespaceOperationValidationFailed":
    // Unassignment is not allowed
    console.log(username.operations.canUnassign.reason);
    break;

  case "NamespaceOperationValidationUnknown":
    // Validation outcome is unknown
    break;
}
```

Where:

- **NamespaceOperationValidationPassed**: The logged-in Account is allowed to unassign the given Username.
- **NamespaceOperationValidationFailed**: Unassignment is not allowed. The `reason` field explains why, and `unsatisfiedRules` lists the unmet requirements.
- **NamespaceOperationValidationUnknown**: The Namespace has one or more unknown rules requiring ad-hoc verification. The `extraChecksRequired` field provides the addresses and configurations of these rules.

Treat the `NamespaceOperationValidationUnknown` as failed unless you intend to support the specific rules. See Namespace Rules for more information.

#### 2. Unassign Current Username

Next, if allowed, unassign the Username.

##### TypeScript
```typescript
import { unassignUsernameFromAccount } from "@lens-protocol/client/actions";

const result = await unassignUsernameFromAccount(sessionClient);
```

#### 3. Handle Result

##### TypeScript with viem
```typescript
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await unassignUsernameFromAccount(sessionClient).andThen(
  handleOperationWith(walletClient)
);
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

## Custom Username Namespaces

This guide explains custom Username Namespace and how to create and manage them.

As mentioned in the Username concept page, there are two Namespace groups:

- The Global Namespace: The familiar `lens/*` namespace.
- Custom Namespace: App or group-specific namespaces that can govern issuance, monetization, and more by means of Username Rules.

### Create a Custom Namespace

To create a custom Namespace, follow these steps.

**You MUST be authenticated as Builder to create a custom Namespace.**

#### 1. Create Namespace Metadata

First, construct a Namespace Metadata object with the necessary content.

##### TS/JS
```typescript
import { namespace } from "@lens-protocol/metadata";

const metadata = namespace({
  description: "A collection of usernames",
  collection: {
    name: "Lens Usernames",
    description: "The official lens/ usernames",
  },
});
```

Since usernames are ERC-721 tokens, you can also specify EIP-7572 contract-level metadata which makes it easier to trade and display usernames in wallets and marketplaces.

#### 2. Upload Namespace Metadata

Next, upload the Namespace Metadata object to a public URI.

```typescript
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);

console.log(uri); // e.g., lens://4f91ca…
```

This example uses Grove storage to host the Metadata object. See the Lens Metadata Standards guide for more information on hosting Metadata objects.

#### 3. Deploy Namespace Contract

Next, deploy a Lens Namespace smart contract.

##### TypeScript
```typescript
import { evmAddress, uri } from "@lens-protocol/client";
import { createFeed } from "@lens-protocol/client/actions";

const result = await createUsernameNamespace(sessionClient, {
  symbol: "FOO",
  namespace: "foo", // foo/<localName>
  metadataUri: uri("lens://4f91ca…"),
  rules: {
    required: [
      {
        usernameLengthRule: {
          maxLength: 10,
          minLength: 3,
        },
      },
    ],
  },
});
```

To learn more about how to use Username Rules, see the Username Rules guide.

#### 4. Handle Result

##### TypeScript with viem
```typescript
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await createUsernameNamespace(sessionClient, {
  symbol: "FOO",
  namespace: "foo",
  metadataUri: uri("lens://4f91ca…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

#### 5. Fetch New Namespace

##### TypeScript
```typescript
import { fetchNamespace } from "@lens-protocol/client/actions";

// …

const result = await createUsernameNamespace(sessionClient, {
  symbol: "FOO",
  namespace: "foo",
  metadataUri: uri("lens://4f91ca…"),
})
  .andThen(handleOperationWith(walletClientOrSigner))
  .andThen(sessionClient.waitForTransaction)
  .andThen((txHash) => fetchNamespace(sessionClient, { txHash }));

if (result.isErr()) {
  return console.error(result.error);
}

// namespace: UsernameNamespace | null
const namespace = result.value;
```

That's it—you now know how to create and manage Custom Username Namespaces, allowing to build app- or group-specific namespaces.

### Fetch a Namespace

#### TypeScript
```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchNamespace } from "@lens-protocol/client/actions";
import { client } from "./client";

const result = await fetchNamespace(client, {
  namespace: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

const namespace = result.value;
```

### Search Namespaces

#### TypeScript
```typescript
import { fetchNamespaces } from "@lens-protocol/client/actions";
import { client } from "./client";

const result = await fetchNamespaces(client, {
  filter: {
    searchBy: "name",
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<UsernameNamespace>
const { items, pageInfo } = result.value;
```

Continue with the Pagination guide for more information on how to handle paginated results.

### Access Control

The Namespace contract supports two roles: Owner and Administrator.

Administrators can:

- Update the Namespace Metadata
- Update the Namespace Rules
- Update the Namespace Extra Data

The Owner can do everything the administrators can do, plus transfer ownership of the Namespace to another address.

See the Team Management guide for more information on how to manage these roles.

## Reserved Usernames

This guide explains how to reserve usernames in your custom Namespace.

Namespaces configured with the `UsernameReservedNamespaceRule` allow the Namespace owner or admins to reserve a specific set of usernames. This rule is applied by default to every new Namespace create through the Lens API.

### List Reserved Usernames

#### TypeScript
```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchNamespaceReservedUsernames } from "@lens-protocol/client/actions";
import { client } from "./client";

const result = await fetchNamespaceReservedUsernames(client, {
  namespace: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<{ ruleId: RuleId, namespace: EvmAddress, localName: string }>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### Update Reserved Usernames

To update the reserved usernames of a Namespace, you can either release or reserve usernames.

**You MUST be authenticated as Builder and be either the owner or an admin of the Namespace you intend to configure reserved usernames for.**

#### TypeScript
```typescript
import { evmAddress } from "@lens-protocol/client";
import { updateReservedUsernames } from "@lens-protocol/client/actions";

const result = await updateReservedUsernames(sessionClient, {
  namespace: evmAddress("0x1234…"),
  toRelease: ["alice", "bob"],
  toReserve: ["charlie", "dave"],
});
```

And, handle the result using the adapter for the library of your choice:

##### TypeScript with viem
```typescript
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await updateReservedUsernames(sessionClient, {
  namespace: evmAddress("0x1234…"),
  toRelease: ["alice", "bob"],
  toReserve: ["charlie", "dave"],
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

## Namespace Rules

This guide explains how to use username Namespace Rules and how to implement custom ones.

Namespace Rules allow administrators to add requirements or constraints that will be applied when a Username in a given Namespace is created or assigned to an Account.

Lens provides three built-in Group rules:

- `UsernamePricePerLengthNamespaceRule` - Requires an ERC-20 payment to create a Username.
- `TokenGatedNamespaceRule` - Requires an account to hold a certain token to create a Username.
- `UsernameLengthNamespaceRule` - Restricts the length of Usernames.

For the `UsernamePricePerLengthNamespaceRule`, a 1.5% Lens treasury fee is deducted from the payment before the remaining amount is transferred to the designated recipient.

To keep usernames web-friendly across the ecosystem, the Namespace primitive enforces a maximum length of 255 characters.

Two additional built-in rules are also applied by default to every new Namespace:

- `UsernameReservedNamespaceRule` - This rule allows the Namespace owner or admins to reserve a specific set of usernames. See Reserved Usernames for more information.
- `UsernameSimpleCharsetNamespaceRule` - This rule limits valid characters to `a-z`, `0-9`, `-`, and `_`, ensuring consistency. Usernames cannot begin with `-` or `_`.

### Using Namespace Rules

As part of creating Custom Namespaces, you can pass a `rules` object that defines the `required` rules and/or an `anyOf` set, where satisfying any one rule allows the Username creation or assignment to succeed. These rules can be built-in or custom.

This section presumes you are familiar with the process of creating a Namespace on Lens.

#### Username Price per Length Namespace Rule

This rule can be applied to a Username namespace to require an ERC-20 payment based on the length of the Username being created.

##### TypeScript
```typescript
import { bigDecimal, evmAddress } from "@lens-protocol/client";
import { createUsernameNamespace } from "@lens-protocol/client/actions";

const result = await createUsernameNamespace(sessionClient, {
  symbol: "FOO",
  namespace: "foo",
  rules: {
    required: [
      {
        usernamePricePerLengthRule: {
          cost: {
            currency: evmAddress("0x5678…"),
            value: bigDecimal('0.5'), // Token value in its main unit
          },
          recipient: evmAddress("0x1234…"),
          costOverrides: [
            {
              amount: bigDecimal('5'),
              length: 1,
            },
            {
              amount: bigDecimal('4'),
              length: 2,
            },
            {
              amount: bigDecimal('3'),
              length: 3,
            },
            {
              amount: bigDecimal('2'),
              length: 4,
            }
          ]
        }
      }
    ],
  }
});
```

#### Token Gated Namespace Rule

This rule requires holding a certain balance of a token (fungible or non-fungible) to create a Username.

Configuration includes the token address, the token standard (ERC-20, ERC-721, or ERC-1155), and the required token amount. For ERC-1155 tokens, an additional token type ID is required.

##### TypeScript
```typescript
import { bigDecimal, evmAddress, } from "@lens-protocol/client";
import { createUsernameNamespace } from "@lens-protocol/client/actions";

const result = await createUsernameNamespace(sessionClient, {
  symbol: "FOO",
  namespace: "foo",
  rules: {
    required: [
      {
        tokenGatedRule: {
          token: {
            currency: evmAddress("0x1234…"),
            standard: TokenStandard.Erc721,
            value: bigDecimal("1"),
          },
        },
      }
    ],
  }
});
```

#### Username Length Namespace Rule

This rule can restricts the minimum and/or maximum length of Usernames.

##### TypeScript
```typescript
import { bigDecimal, evmAddress } from "@lens-protocol/client";
import { createUsernameNamespace } from "@lens-protocol/client/actions";

const result = await createUsernameNamespace(sessionClient, {
  symbol: "FOO",
  namespace: "foo",
  rules: {
    required: [
      {
        usernameLengthRule: {
          minLength: 3,
          maxLength: 10,
        },
      },
    ],
  },
});
```

#### Custom Namespace Rule

You can also use custom rules by specifying the rule contract address, when it applies, and the configuration parameters as key-value pairs.

##### TypeScript
```typescript
import {
  blockchainData,
  evmAddress,
  NamespaceRuleExecuteOn,
} from "@lens-protocol/client";
import { createUsernameNamespace } from "@lens-protocol/client/actions";

const result = await createUsernameNamespace(sessionClient, {
  symbol: "FOO",
  namespace: "foo",
  rules: {
    required: [
      {
        unknownRule: {
          address: evmAddress("0x1234…"),
          executeOn: [
            NamespaceRuleExecuteOn.Creating,
            NamespaceRuleExecuteOn.Assigning,
          ],
          params: [
            {
              raw: {
                // 32 bytes key (e.g., keccak(name))
                key: blockchainData("0xac5f04…"),
                // an ABI encoded value
                value: blockchainData("0x00"),
              },
            },
          ],
        },
      },
    ],
  },
});
```

### Update a Namespace Rules

To update a Namespace rules configuration, follow these steps.

**You MUST be authenticated as Builder and be either the owner or an admin of the Namespace you intend to configure.**

#### 1. Identify Current Rules

First, inspect the `namespace.rules` field to know the current rules configuration.

##### TypeScript
```typescript
type NamespaceRules = {
  required: NamespaceRule;
  anyOf: NamespaceRule;
};
```

Keep note of the Rule IDs you might want to remove.

#### 2. Update the Rules Configuration

Next, update the rules configuration of the Namespace as follows.

##### TypeScript
```typescript
import { bigDecimal, evmAddress } from "@lens-protocol/client";
import { updateNamespaceRules } from "@lens-protocol/client/actions";

const result = await updateNamespaceRules(sessionClient, {
  namespace: namespace.address,
  toAdd: {
    required: [
      {
        tokenGatedRule: {
          token: {
            standard: TokenStandard.Erc20,
            currency: evmAddress("0x5678…"),
            value: bigDecimal("1.5"), // Token value in its main unit
          },
        },
      },
    ],
  },
});
```

#### 3. Handle Result

##### TypeScript with viem
```typescript
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await updateNamespaceRules(sessionClient, {
  namespace: evmAddress("0x1234…"),
  // …
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### Building a Namespace Rule

Let's illustrate the process with an example. We will build a custom Namespace Rule that requires Usernames to be created only if their length has an specific parity, for example, all usernames must have an even length.

To build a custom Namespace Rule, you must implement the following `INamespaceRule` interface:

```solidity
import {KeyValue} from "contracts/core/types/Types.sol";

interface INamespaceRule {
    function configure(bytes32 configSalt, KeyValue[] calldata ruleParams) external;

    function processCreation(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        string calldata username,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external;

    function processRemoval(
        bytes32 configSalt,
        address originalMsgSender,
        string calldata username,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external;

    function processAssigning(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        string calldata username,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external;

    function processUnassigning(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        string calldata username,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external;
}
```

Each function of this interface must assume to be invoked by the Namespace contract. In other words, assume the `msg.sender` will be the Namespace contract.

A Lens dependency package with all relevant interfaces will be available soon.

#### 1. Implement the Configure Function

First, implement the `configure` function. This function has the purpose of initializing any required state for the rule to work properly.

It receives two parameters, a 32-byte configuration salt (`configSalt`), and an array of custom parameters as key-value pairs (`ruleParams`).

The `configSalt` is there to allow the same rule contract to be used many times, with different configurations, for the same Namespace. So, for a given Namespace Rule implementation, the pair (Namespace Address, Configuration Salt) should identify a rule configuration.

The `configure` function can be called multiple times by the same Namespace passing the same configuration salt in order to update that rule configuration (i.e. reconfigure it).

The `ruleParams` is an array of key-value pairs that can be used to pass any custom configuration parameters to the rule. Each key is `bytes32`, we put the hash of the parameter name there, and each value is `bytes`, we set the ABI-encoded parameter value there. Given that `ruleParams` is an array, this allows the rule to define which parameters are optional and which are required, acting accordingly when any of them are not present.

In our example, we only need to decode a boolean parameter, which will indicate if the rule will enforce Usernames to have an even or an odd length. Let's define a storage mapping to store this configuration:

```solidity
contract UsernameParityLengthNamespaceRule is INamespaceRule {
    mapping(address namespace => mapping(bytes32 configSalt => bool mustBeEven)) internal _mustBeEvenLength;
}
```

The configuration is stored in the mapping using the Namespace contract address (`msg.sender`) and the configuration salt as keys. With this setup, the same rule can be used by different Namespaces, as well as be used by the same Namespace many times.

Now let's code the `configure` function itself, decoding the boolean parameter and storing it in the mapping:

```solidity
contract UsernameParityLengthNamespaceRule is INamespaceRule {
    mapping(address namespace => mapping(bytes32 configSalt => bool mustBeEven)) internal _mustBeEvenLength;

    function configure(bytes32 configSalt, KeyValue[] calldata ruleParams) external override {
        bool mustBeEven = true; // We set `true` as default value
        for (uint256 i = 0; i < ruleParams.length; i++) {
            if (ruleParams[i].key == keccak256("lens.param.mustBeEven")) {
                mustBeEven = abi.decode(ruleParams[i].value, (bool));
                break;
            }
        }
        _mustBeEvenLength[msg.sender][configSalt] = mustBeEven;
    }
}
```

We treated the `mustBeEven` parameter as optional, defaulting to `true` (even length) when not present.

#### 2. Implement the Process Creation function

Next, implement the `processCreation` function. This function is invoked by the Namespace contract every time a username is being created, so then our custom logic can be applied to shape under which conditions this operation can succeed.

The function receives the configuration salt (`configSalt`), the address that is trying to create the Username (`originalMsgSender`), the `account` who will own the created Username, the `username` being created, an array of key-value pairs with the custom parameters passed to the Namespace (`primitiveParams`), and an array of key-value pairs in case the rule requires additional parameters to work (`ruleParams`).

The function must revert if the requirements imposed by the rule are not met.

```solidity
contract UsernameParityLengthNamespaceRule is INamespaceRule {
    mapping(address namespace => mapping(bytes32 configSalt => bool mustBeEven)) internal _mustBeEvenLength;

    // ...

    function processCreation(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        string calldata username,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external view override {
        // Retrieve the rule configuration
        bool mustBeEven = _mustBeEvenLength[msg.sender][configSalt];

        // Get the length of the username being created
        uint256 usernameLength = bytes(username).length;

        // Check if the length is even (otherwise it is odd)
        bool isEvenLength = usernameLength % 2 == 0;

        // Require the parity of the username being created to match
        // the parity required by the rule
        require(isEvenLength == mustBeEven);
    }

    // ...
}
```

#### 3. Implement the Process Removal function

Next, implement the `processRemoval` function. This function is invoked by the Namespace contract every time a username is being removed.

The function receives the configuration salt (`configSalt`), the address that is trying to remove the Username (`originalMsgSender`), the `username` being removed, an array of key-value pairs with the custom parameters passed to the Namespace (`primitiveParams`), and an array of key-value pairs in case the rule requires additional parameters to work (`ruleParams`).

The function must revert if the requirements imposed by the rule are not met. In our example, the parity rule does not apply to removal, so we revert with `NotImplemented`. This is good practice in case the rule is accidentally enabled for this selector.

```solidity
contract UsernameParityLengthNamespaceRule is INamespaceRule {

    // ...

    function processRemoval(
        bytes32 configSalt,
        address originalMsgSender,
        string calldata username,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external pure override {
        revert Errors.NotImplemented();
    }

    // ...
}
```

#### 4. Implement the Process Assigning function

Next, implement the `processAssigning` function. This function is invoked by the Namespace contract every time a username is being assigned to an account.

The function receives the configuration salt (`configSalt`), the address that is trying to assign the Username (`originalMsgSender`), the `account` who the username will be assigned to, the `username` being assigned, an array of key-value pairs with the custom parameters passed to the Namespace (`primitiveParams`), and an array of key-value pairs in case the rule requires additional parameters to work (`ruleParams`).

The function must revert if the requirements imposed by the rule are not met. Similar to removal, our parity rule does not apply to the assignment operation, so we revert with `NotImplemented`.

```solidity
contract UsernameParityLengthNamespaceRule is INamespaceRule {

    // ...

    function processAssigning(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        string calldata username,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external pure override {
        revert Errors.NotImplemented();
    }

    // ...
}
```

#### 5. Implement the Process Unassigning function

Finally, implement the `processUnassigning` function. This function is invoked by the Namespace contract every time a username is being unassigned from an account.

The function receives the configuration salt (`configSalt`), the address that is trying to unassign the Username (`originalMsgSender`), the `account` who the username will be unassigned from, the `username` being unassigned, an array of key-value pairs with the custom parameters passed to the Namespace (`primitiveParams`), and an array of key-value pairs in case the rule requires additional parameters to work (`ruleParams`).

The function must revert if the requirements imposed by the rule are not met. Again, our parity rule does not apply to the unassigning process, so we revert with `NotImplemented`.

```solidity
contract UsernameParityLengthNamespaceRule is INamespaceRule {

    // ...

    function processUnassigning(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        string calldata username,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external pure override {
        revert Errors.NotImplemented();
    }
}
```

Now the `UsernameParityLengthNamespaceRule` is ready to be applied to any Namespace. See the full code below:

```solidity
contract UsernameParityLengthNamespaceRule is INamespaceRule {

    mapping(address => mapping(bytes32 => bool)) internal _mustBeEvenLength;

    function configure(bytes32 configSalt, KeyValue[] calldata ruleParams) external override {
        bool mustBeEven = true; // We set `true` as default value
        for (uint256 i = 0; i < ruleParams.length; i++) {
            if (ruleParams[i].key == keccak256("lens.param.mustBeEven")) {
                mustBeEven = abi.decode(ruleParams[i].value, (bool));
                break;
            }
        }
        _mustBeEvenLength[msg.sender][configSalt] = mustBeEven;
    }

    function processCreation(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        string calldata username,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external view override {
        // Retrieve the rule configuration
        bool mustBeEven = _mustBeEvenLength[msg.sender][configSalt];

        // Get the length of the username being created
        uint256 usernameLength = bytes(username).length;

        // Check if the length is even (otherwise it is odd)
        bool isEvenLength = usernameLength % 2 == 0;

        // Require the parity of the username being created to match
        // the parity required by the rule
        require(isEvenLength == mustBeEven);
    }

    function processRemoval(
        bytes32 configSalt,
        address originalMsgSender,
        string calldata username,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external pure override {
        revert Errors.NotImplemented();
    }

    function processAssigning(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        string calldata username,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external pure override {
        revert Errors.NotImplemented();
    }

    function processUnassigning(
        bytes32 configSalt,
        address originalMsgSender,
        address account,
        string calldata username,
        KeyValue[] calldata primitiveParams,
        KeyValue[] calldata ruleParams
    ) external pure override {
        revert Errors.NotImplemented();
    }
}
```

Stay tuned for API integration of rules and more guides!



```