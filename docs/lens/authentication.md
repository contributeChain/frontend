# Authentication

This guide will help you understand how to handle authentication in Lens.

The Lens API uses authentication roles to define different levels of access and interaction:

- **Account Owner**: An end-user who owns a Lens Account.
- **Account Manager**: An end-user managing a Lens Account, either their own or one they have been delegated. See the Account Managers guide for more information.
- **Onboarding User**: A end-user without a Lens Account, limited to features related to onboarding, such as creating an account.
- **Builder**: A developer role used to authenticate and access configuration and management features.

## Log In to Lens

End-user roles such as Account Owner, Account Manager, or Onboarding User require the EVM address of the App they want to connect to in order to log in to Lens. In contrast, the Builder role does not require an App address for authentication.

For quick experimentation with Lens, a test App has been deployed on each network:

- Lens Mainnet: `0x8A5Cc31180c37078e1EbA2A23c861Acf351a97cE`
- Lens Testnet: `0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7`

You can learn how to create your own App in the Apps guide.

We'll use viem's Local Account in our example, but you can use a `WalletClient` instance from the wagmi hook or an ethers.js Signer.

Chose the adapter for the library of your choice:

```ts
// viem
import { signMessageWith } from "@lens-protocol/client/viem";
```

And, use the `PublicClient` instance you created earlier to log in and acquire a `SessionClient` instance.

### Onboarding User

```ts
// client.ts
import { client } from "./client";
import { signer } from "./signer";

const authenticated = await client.login({
  onboardingUser: {
    app: "0x5678…",
    wallet: signer.address,
  },
  signMessage: signMessageWith(signer),
});

if (authenticated.isErr()) {
  return console.error(authenticated.error);
}

// SessionClient: { ... }
const sessionClient = authenticated.value;
```

### Account Owner

```ts
// client.ts
import { client } from "./client";
import { evmAddress } from "@lens-protocol/client";
import { signer } from "./signer";

const authenticated = await client.login({
  accountOwner: {
    address: evmAddress("0x1234…"),
    app: "0x5678…",
  },
  signMessage: signMessageWith(signer),
});

if (authenticated.isErr()) {
  return console.error(authenticated.error);
}

// SessionClient: { ... }
const sessionClient = authenticated.value;
```

### Account Manager

```ts
// client.ts
import { client } from "./client";
import { evmAddress } from "@lens-protocol/client";
import { signer } from "./signer";

const authenticated = await client.login({
  accountManager: {
    managing: evmAddress("0x1234…"),
    app: "0x5678…",
  },
  signMessage: signMessageWith(signer),
});

if (authenticated.isErr()) {
  return console.error(authenticated.error);
}

// SessionClient: { ... }
const sessionClient = authenticated.value;
```

### Builder

```ts
// client.ts
import { client } from "./client";
import { signer } from "./signer";

const authenticated = await client.login({
  builder: {
    wallet: signer.address,
  },
  signMessage: signMessageWith(signer),
});

if (authenticated.isErr()) {
  return console.error(authenticated.error);
}

// SessionClient: { ... }
const sessionClient = authenticated.value;
```

Use the `SessionClient` to interact with `@lens-protocol/client/actions` that require authentication.

The `@lens-protocol/client/actions` that require authentication are explicitly labelled by the type of client they accept as first argument.

## List Available Accounts

Often, when you are about to log in with an Account, you may want to list the available Accounts for the user's wallet.

Use the paginated `fetchAccountsAvailable` action to list the Accounts available for the given wallet address.

```ts
// client.ts
import { evmAddress } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchAccountsAvailable(client, {
  managedBy: evmAddress("0x1234…"),
  includeOwned: true,
});
```

Continue with the Pagination guide for more information on how to handle paginated results.

See the Account Manager guide for more information on how to manage accounts.

## Manage Sessions

Once you have successfully authenticated, you can manage your authenticated sessions by:

- Keeping your session alive
- Getting details about the current session
- Listing all authenticated sessions

### Keep Alive

#### Resume Session

By default, the `PublicClient` uses in-memory storage for the storing the authenticated session, which is lost when the current thread closes, like when refreshing a page in a browser. To keep the session persistent, supply a long-term storage solution to the `PublicClient` config.

In a browser, for instance, you could use the Web Storage API like `window.localStorage`:

```ts
// client.ts
import { PublicClient, mainnet } from "@lens-protocol/client";

const const client = PublicClient.create({
  environment: mainnet,
  storage: window.localStorage,
});
```

Then resume an authenticated `SessionClient` from long-term storage like so:

```ts
// Resume Session
import { client } from "./client";

const resumed = await client.resumeSession();

if (resumed.isErr()) {
  return console.error(resumed.error);
}

// SessionClient: { ... }
const sessionClient = resumed.value;
```

The `SessionClient` instance is now ready to be used for authenticated requests.

### Get Current Session

Use the `currentSession` action to get details about the current session.

```ts
import { currentSession } from "@lens-protocol/client/actions";

const result = await currentSession(sessionClient);

if (result.isErr()) {
  return console.error(result.error);
}

// AuthenticatedSession: { authenticationId: UUID, app: EvmAddress, ... }
const session = result.value;
```

### List Authenticated Sessions

Use the `fetchAuthenticatedSessions` action to get a paginated list of all authenticated sessions.

```ts
import { fetchAuthenticatedSessions } from "@lens-protocol/client/actions";

const result = await fetchAuthenticatedSessions(sessionClient);

if (result.isErr()) {
  return console.error(result.error);
}

// Array<AuthenticatedSession>: [{ authenticationId: UUID, app: EvmAddress, ... }, ... ]
const sessions = result.value.items;
```

See the Pagination guide for more information on how to handle paginated results.

## Log Out

You MUST be authenticated as Account Owner or Account Manager to make this request.

Use the `client.logout` method to revoke any authenticated session and clear any client state.

```ts
const result = await client.logout();
```

## Get Last Logged-In Account

A simple way to fetch a user's last Lens account login, helping returning users quickly identify and access their previous account before authentication is required.

Use the `lastLoggedInAccount` action to get the last logged-in account.

```ts
import { evmAddress } from "@lens-protocol/client";
import { lastLoggedInAccount } from "@lens-protocol/client/actions";

const result = await lastLoggedInAccount(anyClient, {
  address: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}
```

## Authentication Tokens

Lens API uses JSON Web Tokens (JWT) as format for Token-Based authentication.

On successful authentication, Lens API issues three tokens:

- Access Token
- ID Token
- Refresh Token

Lens JWTs are signed with the RS256 algorithm and can be verified using JSON Web Key Sets (JWKS) from the `/.well-known/jwks.json` endpoint on the corresponding Lens API environment:

- Mainnet: `https://api.lens.xyz/.well-known/jwks.json`
- Testnet: `https://api.testnet.lens.xyz/.well-known/jwks.json`

Signing keys could be rotated at any time. Make sure to cache the JWKS and update it periodically.

### Access Token

Access Tokens are used to authenticate a user's identity when making requests to the Lens API.

The Access Token is required in the `Authorization` or `x-access-token` header for all authenticated requests to the Lens API.

```
Authorization: Bearer <access-token>
# or
x-access-token: <access-token>
```

DO NOT share the Access Token with anyone. Keep it secure and confidential. If you are looking to identify a user's request on a backend service, use the ID Token instead.

Lens Access Tokens are valid for 10 minutes from the time of issuance.

### Refresh Token

A Refresh Token is a credential artifact used to obtain a new authentication tokens triplet without user interaction. This allows for a shorter Access Token lifetime for security purposes without involving the user when the access token expires. You can request new authentication tokens until the refresh token is added to a denylist or expires.

DO NOT share the Refresh Token with anyone. Keep it secure and confidential, possibly on the client-side only. If you are looking to perform an operation in behalf of an Account, use the Account Manager feature instead.

Lens Refresh Tokens are valid for 7 days from the time of issuance.

### ID Token

The ID Token is used to verify the user's identity on consumer's side. It contains a set of claims about the user and is signed by the Lens API.

Lens ID Tokens are valid for 10 minutes from the time of issuance, same as the Access Token.

You can use the ID Token to verify the user's identity on a backend service like described in the Consume Lens ID Tokens section.

## Consume Lens ID Tokens

As briefly mentioned earlier, Lens ID Tokens can be used to verify's user identity on a backend service.

Lens ID Tokens are issued with the following claims:

| Claim | Description |
| ----- | ----------- |
| sub | Subject - the `signedBy` address used to sign the Authentication Challenge. This could be the Account or an Account Manager for it. Example: `0xC47Cccc2bf4CF2635a817C01c6A6d965045b06e6`. |	
| iss | Issuer - the Lens API endpoint that issued the token. Typically: `https://api.lens.xyz`. |	
| aud | Audience - the Lens App address that the token is intended for. Example: `0x00004747f7a56EE7Af7237220c960a7D06232626`. |	
| iat | Issued At - the timestamp when the token was issued. |
| exp | Expiration - the timestamp indicating when the token will expire. This can be used to determine if the token is still valid. |
| sid | Session ID - the unique identifier of the session that the token was issued for. |
| act | Optional claim that allows the token to act on behalf of another Account. This is useful for Account Managers to specify the Account address they can act on behalf of. |
| tag:lens.dev,2024:sponsored | Custom claim that indicates the authenticated session is enabled for sponsored transactions. |
| tag:lens.dev,2024:role | Custom claim that indicates the role of the authenticated session. Possible values are `ACCOUNT_OWNER`, `ACCOUNT_MANAGER`, `ONBOARDING_USER`, and `BUILDER`. |	

A typical use case is to use Lens issued ID Token to verify the legitimacy of user's request before issuing your app specific credentials. Below is an example of a Next.js middleware that demonstrates how to verify a Lens ID Token using the popular jose library:

```ts
// middleware.ts
import { NextResponse } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

// Get JWKS URI from environment variables
const jwksUri = process.env.NEXT_PUBLIC_JWKS_URI;
const JWKS = createRemoteJWKSet(new URL(jwksUri));

export async function middleware(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: "Authorization token missing" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Verify the JWT using the JWKS
    const { payload } = await jwtVerify(token, JWKS);

    // Optionally, attach the payload to the request
    req.user = payload;

    // Proceed to the API route
    return NextResponse.next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return new NextResponse(
      JSON.stringify({ error: "Invalid or expired token" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
```

The example works under the following assumptions:

- The Lens ID Token is passed in the `Authorization` header as a Bearer token (e.g., `Authorization: Bearer <ID Token>`).
- The JWKS URI is available in the `NEXT_PUBLIC_JWKS_URI` environment variable.
- Your API routes are located under the `/api` path.

Adapt it to your specific use case as needed.

You can now use the `req.user` object in your API routes to access the user's identity.

```ts
// Example API Route
export default function handler(req, res) {
  // The JWT payload will be available as req.user if the token is valid
  if (req.user) {
    return res.status(200).json({ message: "Success", user: req.user });
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
``` 