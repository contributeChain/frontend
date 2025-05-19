# Notifications

This guide covers everything you need to know about working with notifications in Lens.

## Notification Types

Lens provides several types of notifications to keep users informed about interactions with their content:

1. **Comment Notification**: When someone comments on your post.
2. **Mirror Notification**: When someone mirrors your post.
3. **Quote Notification**: When someone quotes your post.
4. **Reaction Notification**: When someone reacts to your post.
5. **Follow Notification**: When someone follows your account.
6. **Mention Notification**: When someone mentions you in a post.
7. **Act Notification**: When someone performs an action related to your content.

## Fetch Notifications

To fetch notifications for the authenticated user, follow these steps.

You MUST be authenticated to fetch notifications.

### Get All Notifications

Use the paginated `fetchNotifications` action to fetch all notifications for the authenticated user.

```ts
import { fetchNotifications } from "@lens-protocol/client/actions";

// …

const result = await fetchNotifications(sessionClient);

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Notification>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### Filter Notifications

You can filter notifications by type using the `where` parameter.

```ts
import { fetchNotifications, NotificationType } from "@lens-protocol/client/actions";

// …

const result = await fetchNotifications(sessionClient, {
  where: {
    types: [NotificationType.COMMENT, NotificationType.MENTION],
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Notification>
const { items, pageInfo } = result.value;
```

### Notification Structure

Notifications have a rich structure that includes the following information:

- Notification type
- Related content (post, comment, etc.)
- Actor (the user who triggered the notification)
- Timestamp

Here's an example of how to handle different notification types:

```ts
import { fetchNotifications, NotificationType } from "@lens-protocol/client/actions";

// …

const result = await fetchNotifications(sessionClient);

if (result.isErr()) {
  return console.error(result.error);
}

const { items } = result.value;

// Process each notification based on its type
items.forEach((notification) => {
  switch (notification.__typename) {
    case "CommentNotification":
      console.log(`${notification.comment.by.handle} commented on your post`);
      break;
    case "MirrorNotification":
      console.log(`${notification.mirror.by.handle} mirrored your post`);
      break;
    case "QuoteNotification":
      console.log(`${notification.quote.by.handle} quoted your post`);
      break;
    case "ReactionNotification":
      console.log(`${notification.reaction.by.handle} reacted to your post`);
      break;
    case "FollowNotification":
      console.log(`${notification.follow.by.handle} followed you`);
      break;
    case "MentionNotification":
      console.log(`${notification.mention.by.handle} mentioned you`);
      break;
    case "ActNotification":
      console.log(`${notification.act.by.handle} acted on your content`);
      break;
  }
});
```

## Notification Subscriptions

To receive real-time notifications, you can use the `notificationSubscription` to subscribe to new notifications.

```ts
import { notificationSubscription } from "@lens-protocol/client/subscriptions";

// …

const { unsubscribe } = notificationSubscription(sessionClient, {
  onData: (notification) => {
    console.log("New notification:", notification);
  },
  onError: (error) => {
    console.error("Error in notification subscription:", error);
  },
});

// Later, when you want to stop receiving notifications
unsubscribe();
```

## Notification Settings

Users can customize which notifications they receive through notification settings.

### Update Notification Settings

To update notification settings, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to update notification settings.

```ts
import { updateNotificationSettings } from "@lens-protocol/client/actions";

// …

const result = await updateNotificationSettings(sessionClient, {
  comments: true,
  mirrors: true,
  quotes: true,
  reactions: true,
  follows: true,
  mentions: true,
  acts: true,
});

if (result.isErr()) {
  return console.error(result.error);
}
```

### Get Notification Settings

To get the current notification settings for the authenticated user, follow these steps.

You MUST be authenticated to get notification settings.

```ts
import { fetchNotificationSettings } from "@lens-protocol/client/actions";

// …

const result = await fetchNotificationSettings(sessionClient);

if (result.isErr()) {
  return console.error(result.error);
}

const settings = result.value;
console.log("Notification settings:", settings);
```

## Mark Notifications as Read

To mark notifications as read, follow these steps.

You MUST be authenticated to mark notifications as read.

### Mark All Notifications as Read

```ts
import { markAllNotificationsAsRead } from "@lens-protocol/client/actions";

// …

const result = await markAllNotificationsAsRead(sessionClient);

if (result.isErr()) {
  return console.error(result.error);
}
```

### Mark Specific Notifications as Read

```ts
import { markNotificationsAsRead } from "@lens-protocol/client/actions";

// …

const result = await markNotificationsAsRead(sessionClient, {
  ids: ["notification-1", "notification-2"],
});

if (result.isErr()) {
  return console.error(result.error);
}
```

## Push Notifications

Lens supports push notifications to deliver notifications to users even when they're not actively using your app.

### Register for Push Notifications

To register a device for push notifications, follow these steps.

You MUST be authenticated to register for push notifications.

```ts
import { registerPushNotifications } from "@lens-protocol/client/actions";

// …

const result = await registerPushNotifications(sessionClient, {
  deviceToken: "device-token-from-fcm-or-apns",
  platform: "ios", // or "android"
});

if (result.isErr()) {
  return console.error(result.error);
}
```

### Unregister from Push Notifications

To unregister a device from push notifications, follow these steps.

You MUST be authenticated to unregister from push notifications.

```ts
import { unregisterPushNotifications } from "@lens-protocol/client/actions";

// …

const result = await unregisterPushNotifications(sessionClient, {
  deviceToken: "device-token-from-fcm-or-apns",
});

if (result.isErr()) {
  return console.error(result.error);
}
```

## Notification Counts

To get the count of unread notifications, follow these steps.

You MUST be authenticated to get notification counts.

```ts
import { fetchNotificationCount } from "@lens-protocol/client/actions";

// …

const result = await fetchNotificationCount(sessionClient);

if (result.isErr()) {
  return console.error(result.error);
}

const count = result.value;
console.log("Unread notifications:", count);
```

## Notification Preferences

Users can set preferences for how they receive notifications from specific accounts.

### Set Notification Preferences

To set notification preferences for a specific account, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to set notification preferences.

```ts
import { evmAddress } from "@lens-protocol/client";
import { setNotificationPreferences } from "@lens-protocol/client/actions";

// …

const result = await setNotificationPreferences(sessionClient, {
  account: evmAddress("0x1234…"),
  enabled: true,
});

if (result.isErr()) {
  return console.error(result.error);
}
```

### Get Notification Preferences

To get notification preferences for specific accounts, follow these steps.

You MUST be authenticated to get notification preferences.

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchNotificationPreferences } from "@lens-protocol/client/actions";

// …

const result = await fetchNotificationPreferences(sessionClient, {
  accounts: [evmAddress("0x1234…"), evmAddress("0x5678…")],
});

if (result.isErr()) {
  return console.error(result.error);
}

const preferences = result.value;
console.log("Notification preferences:", preferences);
```

## Handling Notification Payloads

When receiving push notifications, you'll need to handle the payload to display the notification to the user.

### Parse Notification Payload

```ts
// Example push notification payload
const payload = {
  type: "COMMENT",
  postId: "0x01-0x01",
  commentId: "0x01-0x02",
  actor: "0x1234…",
  timestamp: "2023-01-01T00:00:00Z",
};

// Parse the payload based on the notification type
function parseNotificationPayload(payload) {
  switch (payload.type) {
    case "COMMENT":
      return {
        title: "New Comment",
        body: `Someone commented on your post`,
        data: {
          postId: payload.postId,
          commentId: payload.commentId,
        },
      };
    case "MIRROR":
      return {
        title: "New Mirror",
        body: `Someone mirrored your post`,
        data: {
          postId: payload.postId,
          mirrorId: payload.mirrorId,
        },
      };
    // Handle other notification types similarly
    default:
      return {
        title: "New Notification",
        body: "You have a new notification",
        data: payload,
      };
  }
}

const notification = parseNotificationPayload(payload);
console.log(notification);
```

## Best Practices

Here are some best practices for working with notifications:

1. **Batch Updates**: Fetch notifications periodically rather than on every user action to reduce API calls.
2. **Pagination**: Use pagination to load notifications incrementally, especially for users with many notifications.
3. **Real-time Updates**: Use notification subscriptions for real-time updates to provide a responsive user experience.
4. **User Preferences**: Respect user notification preferences and provide easy ways to customize them.
5. **Error Handling**: Implement proper error handling for notification-related operations to ensure a smooth user experience. 