# SNS Notifications

This guide will help you set up real-time push notification using Amazon SNS.

Lens utilizes Amazon Simple Notification Service (SNS) to push notification events, enabling easy integration for third-party providers. This service broadcasts data from the chain to your server based on the filters you apply when setting up the subscription.

## Before you get started

Before setting up any subscriptions, you will need to have a webhook endpoint deployed and publicly accessible. This endpoint will be used to confirm the subscription and subsequently receive the notifications from Amazon SNS, so it should be able to handle POST requests and have a high uptime. It is highly recommended to serve this endpoint over a secure HTTPS connection, but both HTTP and HTTPS are supported. Once you have this set up, you can proceed to the next step.

You can find examples below on how to create simple webhook using Express.js in TypeScript.

```typescript
import bodyParser from "body-parser";
import express from "express";
import fetch from "node-fetch";

const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/lens/notifications", async (req, res) => {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  const data = Buffer.concat(buffers).toString();
  // example https://docs.aws.amazon.com/connect/latest/adminguide/sns-payload.html
  const payload = JSON.parse(data);

  // if you already done the handshake you will get a Notification type
  // example below: https://docs.aws.amazon.com/sns/latest/dg/sns-message-and-json-formats.html
  // {
  //   "Type" : "Notification",
  //   "MessageId" : "22b80b92-fdea-4c2c-8f9d-bdfb0c7bf324",
  //   "TopicArn" : "arn:aws:sns:us-west-2:123456789012:MyTopic",
  //   "Subject" : "My First Message",
  //   "Message" : "Hello world!",
  //   "Timestamp" : "2012-05-02T00:54:06.655Z",
  //   "SignatureVersion" : "1",
  //   "Signature" : "EXAMPLEw6JRN…",
  //   "SigningCertURL" : "https://sns.us-west-2.amazonaws.com/SimpleNotificationService-f3ecfb7224c7233fe7bb5f59f96de52f.pem",
  //   "UnsubscribeURL" : "https://sns.us-west-2.amazonaws.com/?Action=Unsubscribe SubscriptionArn=arn:aws:sns:us-west-2:123456789012:MyTopic:c9135db0-26c4-47ec-8998-413945fb5a96"
  // }
  if (payload.Type === "Notification") {
    console.log("SNS message is a notification ", payload);
    console.log("------------------------------------------------------");
    console.log("------------------------------------------------------");
    console.log("------------------------------------------------------");
    res.sendStatus(200);
    return;
  }

  // only need to do this the first time this is doing an handshake with the sns client
  // example below: https://docs.aws.amazon.com/sns/latest/dg/sns-message-and-json-formats.html
  // {
  //   "Type" : "SubscriptionConfirmation",
  //   "MessageId" : "165545c9-2a5c-472c-8df2-7ff2be2b3b1b",
  //   "Token" : "2336412f37…",
  //   "TopicArn" : "arn:aws:sns:us-west-2:123456789012:MyTopic",
  //   "Message" : "You have chosen to subscribe to the topic arn:aws:sns:us-west-2:123456789012:MyTopic.\nTo confirm the subscription, visit the SubscribeURL included in this message.",
  //   "SubscribeURL" : "https://sns.us-west-2.amazonaws.com/?Action=ConfirmSubscription&TopicArn=arn:aws:sns:us-west-2:123456789012:MyTopic&Token=2336412f37…",
  //   "Timestamp" : "2012-04-26T20:45:04.751Z",
  //   "SignatureVersion" : "1",
  //   "Signature" : "EXAMPLEpH+DcEwjAPg8O9mY8dReBSwksfg2S7WKQcikcNKWLQjwu6A4VbeS0QHVCkhRS7fUQvi2egU3N858fiTDN6bkkOxYDVrY0Ad8L10Hs3zH81mtnPk5uvvolIC1CXGu43obcgFxeL3khZl8IKvO61GWB6jI9b5+gLPoBc1Q=",
  //   "SigningCertURL" : "https://sns.us-west-2.amazonaws.com/SimpleNotificationService-f3ecfb7224c7233fe7bb5f59f96de52f.pem"
  // }
  if (payload.Type === "SubscriptionConfirmation") {
    const url = payload.SubscribeURL;
    const response = await fetch(url);
    if (response.status === 200) {
      console.log("Subscription confirmed");
      console.log("------------------------------------------------------");
      console.log("------------------------------------------------------");
      console.log("------------------------------------------------------");
      res.sendStatus(200);
      return;
    } else {
      console.error("Subscription failed");
      res.sendStatus(500);
      return;
    }
  }

  console.log("Received message from SNS", payload);

  // if it gets this far it is a unsubscribe request
  // {
  //   "Type" : "UnsubscribeConfirmation",
  //   "MessageId" : "47138184-6831-46b8-8f7c-afc488602d7d",
  //   "Token" : "2336412f37…",
  //   "TopicArn" : "arn:aws:sns:us-west-2:123456789012:MyTopic",
  //   "Message" : "You have chosen to deactivate subscription arn:aws:sns:us-west-2:123456789012:MyTopic:2bcfbf39-05c3-41de-beaa-fcfcc21c8f55.\nTo cancel this operation and restore the subscription, visit the SubscribeURL included in this message.",
  //   "SubscribeURL" : "https://sns.us-west-2.amazonaws.com/?Action=ConfirmSubscription&TopicArn=arn:aws:sns:us-west-2:123456789012:MyTopic&Token=2336412f37fb6…",
  //   "Timestamp" : "2012-04-26T20:06:41.581Z",
  //   "SignatureVersion" : "1",
  //   "Signature" : "EXAMPLEHXgJm…",
  //   "SigningCertURL" : "https://sns.us-west-2.amazonaws.com/SimpleNotificationService-f3ecfb7224c7233fe7bb5f59f96de52f.pem"
  // }
});

app.listen(port, () =>
  console.log("SNS notification listening on port " + port + "!")
);
```

The above are simple demonstrations, any production-ready webhook should include handling for incoming messages as well as errors.

## Subscribing to SNS Topics

Once you have the webhook endpoint deployed and accessible, you can now subscribe to Lens SNS notification topics via the Lens API.

The example below demonstrates how to create a subscription to the `PostCreated` and `AccountCreated` events using GraphQL. For the mutation to succeed, you need to be authenticated on Lens with a `Builder` role.

You can notice that the `postCreated` topic has two optional fields: `feed` and `app`. These fields, if supplied in the request, will configure the SNS subscription to filter the notifications to only those that are originating from a specific feed or app. There are more options available for filtering notifications, which can be found in the reference further down in this article.

To highlight the contrast, the `accountCreated` topic does not have any optional filters which means you will receive notifications for all accounts created on Lens.

### GraphQL Mutation

```graphql
mutation CreateSnsSubscriptions {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook", # Replace with your own webhook endpoint
      topics: [{
        postCreated: {
          feed: ["0x0101010101010101010101010101010101010101"],
          app: ["0x0101010101010101010101010101010101010101"],
        },
        accountCreated: {}
        }
      ]
    }
  )
}
```

A successful call to this mutation will return a list of subscriptions that were created as seen in the Response tab above. For each subscription, you will receive a POST request to the webhook URL you supplied, which will initiate a handshake with Amazon SNS to confirm the subscription. An example of this message is shown above in SNS Confirmation Message, you need to visit the URL that was provided in the `SubscribeURL` field of the response and confirm the subscription. From that point on, you will start receiving notifications for the topics you subscribed to.

## Filtering

Every subscription topic offers a number of filtering attributes which you can use to fine-grain the notifications you receive. For example, you can filter the notifications to only those that are originating from a specific graph, app or a given account. More details on the filtering attributes for each topic can be found in the reference further down in this article.

## Getting your SNS subscriptions

To get a list of your subscriptions, you can use the following query on the Lens API. First, authenticate with the builder role. Then, perform the query and the endpoint will return a list of all subscriptions linked to your account. You can optionally filter the subscriptions by the app they are linked to.

### GraphQL Query

```graphql
query GetSnsSubscriptions {
  getSnsSubscriptions(request: {
    app: "0x0101010101010101010101010101010101010101"
  }) {
    items {
      id
      account
      webhook
      topic
      topicArn
      attributes
    }
 }
}
```

## Deleting a Subscription

To delete a subscription, you can use the following mutation on the Lens API. First, authenticate with the builder role. Then, perform the mutation and the endpoint will delete the subscription from your account.

### GraphQL Mutation

```graphql
mutation DeleteSnsSubscription {
  deleteSnsSubscription(request: {
    id: "d0a6e0c0-e6e3-4b8a-9293-14b58392e3e3"
  })
}
```

## SNS Topics

Below is list of all the events fired by Lens, alongside their filtering attributes. For every SNS topic, you will find a working example of how to create a subscription to it, as well as the filtering attributes that can be applied on creation and the payload that will be sent to your webhook.

### Account

These are all the events that tract any Account-related activity.

#### AccountActionExecuted

Fires when an action is executed on an Account.

##### GraphQL Setup Example

```graphql
mutation CreateAccountActionExecutedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        accountActionExecuted: {
          # Optional, filter events by account
          # account: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by action
          # action: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by action type enum
          # actionType: ["TIPPING", "UNKNOWN"]
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by executing account
          # executingAccount: ["0x0101010101010101010101010101010101010101"],
        }
      }]
    }
  )
}
```

#### AccountCreated

Fires when a new Account is created.

##### GraphQL Setup Example

```graphql
mutation CreateAccountCreatedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        accountCreated: {
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by graph
          # graph: ["0x0101010101010101010101010101010101010101"],
        }
      }]
    }
  )
}
```

#### AccountFollowed

Fires when an Account gets followed.

##### GraphQL Setup Example

```graphql
mutation CreateAccountFollowedNotification {
  createSnsSubscriptions(
    request: {
       webhook: "https://example.com/webhook",
       topics: [{
          accountFollowed: {
            # Optional, filter events by app
            # app: ["0x0101010101010101010101010101010101010101"],
            # Optional, filter events by graph
            # graph: ["0x0101010101010101010101010101010101010102"],
            # Optional, filter events by follower
            # follower: "0x0101010101010101010101010101010101010103",
            # Optional, filter events by followedAccount
            # followedAccount: "0x0101010101010101010101010101010101010104",
          }
        }]
      }
    )
  }
```

#### Account Unfollowed

Fires when an Account stops following another Account.

##### GraphQL Setup Example

```graphql
mutation CreateAccountUnfollowedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        accountUnfollowed: {
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by graph
          # graph: ["0x0101010101010101010101010101010101010102"],
          # Optional, filter events by account unfollowing
          # unfollower: ["0x0101010101010101010101010101010101010103"],
          # Optional, filter events by unfollowed account
          # unfollowedAccount: ["0x0101010101010101010101010101010101010104"]
        }
      }]
    }
  )
}
```

#### AccountBlocked

Fires when an Account blocks another Account.

##### GraphQL Setup Example

```graphql
mutation CreateAccountBlockedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        accountBlocked: {
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by graph
          # graph: ["0x0101010101010101010101010101010101010102"],
        }
      }]
    }
  )
}
```

#### AccountUnblocked

Fires when an Account unblocks another Account.

##### GraphQL Setup Example

```graphql
mutation CreateAccountUnblockedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        accountUnblocked: {
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by graph
          # graph: ["0x0101010101010101010101010101010101010102"],
        }
      }]
    }
  )
}
```

#### AccountUsernameCreated

Fires when a username is created in a namespace.

##### GraphQL Setup Example

```graphql
mutation CreateAccountUsernameCreatedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        accountUsernameCreated: {
          # Optional, filter events by namespace
          # namespace: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by account
          # account: ["0x0101010101010101010101010101010101010101"]
        }
      }]
    }
  )
}
```

#### AccountUsernameAssigned

Fires when a username is assigned to an account.

##### GraphQL Setup Example

```graphql
mutation CreateAccountUsernameAssignedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        accountUsernameAssigned: {
          # Optional, filter events by namespace
          # namespace: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by account
          # account: ["0x0101010101010101010101010101010101010101"]
        }
      }]
    }
  )
}
```

#### AccountUsernameUnassigned

Fires when a username is unassigned from an account.

##### GraphQL Setup Example

```graphql
mutation CreateAccountUsernameUnassignedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        accountUsernameUnassigned: {
          # Optional, filter events by namespace
          # namespace: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by previous account
          # previous_account: ["0x0101010101010101010101010101010101010102"]
        }
      }]
    }
  )
}
```

#### AccountManagerAdded

Fires when an account is added as a manager to another account.

##### GraphQL Setup Example

```graphql
mutation CreateAccountManagerAddedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        accountManagerAdded: {
          # Optional, filter events by managed account
          # managed_account: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by manager address
          # manager: ["0x0101010101010101010101010101010101010101"]
        }
      }]
    }
  )
}
```

#### AccountManagerRemoved

Fires when an account is removed as a manager from another account.

##### GraphQL Setup Example

```graphql
mutation CreateAccountManagerRemovedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        accountManagerRemoved: {
          # Optional, filter events by managed account
          # managed_account: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by manager address
          # manager: ["0x0101010101010101010101010101010101010101"]
        }
      }]
    }
  )
}
```

#### AccountManagerUpdated

Fires when an account's manager permissions are updated.

##### GraphQL Setup Example

```graphql
mutation CreateAccountManagerUpdatedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        accountManagerUpdated: {
          # Optional, filter events by managed account
          # managed_account: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by manager address
          # manager: ["0x0101010101010101010101010101010101010101"]
        }
      }]
    }
  )
}
```

#### AccountOwnershipTransferred

This notification fires when ownership of an account is transferred to a new owner.

##### GraphQL Setup Example

```graphql
mutation CreateAccountOwnershipTransferredNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        accountOwnershipTransferred: {
          # Optional, filter events by account
          # account: ["0x0101010101010101010101010101010101010101"]
        }
      }]
    }
  )
}
```

#### AccountReported

This notification fires when an account is reported by another user.

##### GraphQL Setup Example

```graphql
mutation CreateAccountReportedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        accountReported: {
          # Optional, filter events by reported account
          # reported_account: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by reporter
          # reporter: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"],
        }
      }]
    }
  )
}
```

#### AccountMentioned

This notification fires when an account is mentioned in a post.

##### GraphQL Setup Example

```graphql
mutation CreateAccountMentionedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        accountMentioned: {
          # Optional, filter events by author
          # author: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by feed
          # feed: "0x0101010101010101010101010101010101010101",
          # Optional, filter events by mentioned account
          # mentioned_account: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by mentioned username
          # mentioned_username: ["alice"],
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"],
        }
      }]
    }
  )
}
```

### Post

All the events related to posts.

#### PostActionExecuted

This notification fires every time a post action is executed.

##### GraphQL Setup Example

```graphql
mutation CreatePostActionExecutedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        postActionExecuted: {
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by post id
          # postId: ["0101010101010101010101010101010101010101"],
          # Optional, filter events by action
          # action: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by action type enum
          # actionType: ["TIPPING", "SIMPLE_COLLECT", "UNKNOWN"]
          # Optional, filter events by executing account
          # executingAccount: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by receiving account
          # receivingAccount: ["0x0101010101010101010101010101010101010101"],
        }
      }]
    }
  )
}
```

#### PostCollected

This notification fires every time a post is collected.

##### GraphQL Setup Example

```graphql
mutation CreatePostCollectedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        postCollected: {
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by collector
          # collector: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by post author
          # postAuthor: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by post id
          # postId: ["0101010101010101010101010101010101010101"],
        }
      }]
    }
  )
}
```

#### PostCreated

This notification fires every time a new Post gets indexed.

##### GraphQL Setup Example

```graphql
mutation CreatePostCreatedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        postCreated: {
          # Optional, filter events by feed
          # feed: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by parent post
          # parent_post: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by post types
          # postTypes: ["COMMENT"],
          # Optional, filter events by author
          # author: ["0x0101010101010101010101010101010101010101"]
        }
      }]
    }
  )
}
```

#### PostEdited

This notification fires when a post is edited.

##### GraphQL Setup Example

```graphql
mutation CreatePostEditedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        postEdited: {
          # Optional, filter events by feed
          # feed: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by parent post
          # parent_post: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by post types
          # postTypes: ["COMMENT"],
          # Optional, filter events by author
          # author: ["0x0101010101010101010101010101010101010101"]
        }
      }]
    }
  )
}
```

#### PostDeleted

This notification fires when a post is deleted.

##### GraphQL Setup Example

```graphql
mutation CreatePostDeletedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        postDeleted: {
          # Optional, filter events by feed
          # feed: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by parent post
          # parent_post: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by post types
          # postTypes: ["COMMENT"],
          # Optional, filter events by author
          # author: ["0x0101010101010101010101010101010101010101"]
        }
      }]
    }
  )
}
```

#### PostReactionAdded

This notification fires when a reaction is added to a post.

##### GraphQL Setup Example

```graphql
mutation CreatePostReactionAddedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        postReactionAdded: {
          # Optional, filter events by post id
          # post_id: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by reacting account
          # reacting_account: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by reaction type
          # reaction_type: ["UPVOTE"],
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"]
        }
      }]
    }
  )
}
```

#### PostReactionRemoved

This notification fires when a reaction is removed from a post.

##### GraphQL Setup Example

```graphql
mutation CreatePostReactionRemovedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        postReactionRemoved: {
          # Optional, filter events by post id
          # post_id: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by reacting account
          # reacting_account: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by reaction type
          # reaction_type: ["UPVOTE"],
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"]
        }
      }]
    }
  )
}
```

#### PostReported

This notification fires when a post is reported.

##### GraphQL Setup Example

```graphql
mutation CreatePostReportedNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        postReported: {
          # Optional, filter events by author
          # author: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by reporter
          # reporter: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by feed
          # feed: ["0x0101010101010101010101010101010101010101"],
          # Optional, filter events by app
          # app: ["0x0101010101010101010101010101010101010101"]
        }
      }]
    }
  )
}
```

### Metadata

All the events related to metadata snapshots, supports metadata snapshots of all Lens primitives.

#### MetadataSnapshotSuccess

This notification fires when a metadata snapshot is successfully created.

##### GraphQL Setup Example

```graphql
mutation CreateMetadataSnapshotSuccessNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        metadataSnapshotSuccess: {
          # Optional, filter events by source
          # source: ["post_01"],
        }
      }]
    }
  )
}
```

#### MetadataSnapshotError

This notification fires when there's an error creating a metadata snapshot.

##### GraphQL Setup Example

```graphql
mutation CreateMetadataSnapshotErrorNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        metadataSnapshotError: {
          # Optional, filter events by source
          # source: ["post_01"],
        }
      }]
    }
  )
}
```

### Media

All the events related to media snapshots, these include images, audio and video coming from Posts as well as metadata from all primitives.

#### MediaSnapshotSuccess

This notification fires when a media snapshot is successfully created.

##### GraphQL Setup Example

```graphql
mutation CreateMediaSnapshotSuccessNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        mediaSnapshotSuccess: {
          # Optional, filter events by source
          # source: ["post_01020304"],
        }
      }]
    }
  )
}
```

#### MediaSnapshotError

This notification fires when there's an error creating a media snapshot.

##### GraphQL Setup Example

```graphql
mutation CreateMediaSnapshotErrorNotification {
  createSnsSubscriptions(
    request: {
      webhook: "https://example.com/webhook",
      topics: [{
        mediaSnapshotError: {
          # Optional, filter events by source
          # source: ["post_01020304"],
        }
      }]
    }
  )
}
```
