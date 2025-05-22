import {
  evmAddress,
  mainnet,
  never,
  PublicClient,
  SessionClient,
  testnet,
  uri,
} from "@lens-protocol/client";
import {
  handleOperationWith,
  signMessageWith,
} from "@lens-protocol/client/viem";
import {
  createAccountWithUsername,
  setAccountMetadata,
} from "@lens-protocol/client/actions";
import {
  getLensAppAddress,
  DEFAULT_NETWORK,
  NetworkEnvironment,
} from "@/config/contracts";
import { privateKeyToAccount } from "viem/accounts";
import { account, MetadataAttributeType } from "@lens-protocol/metadata";

export const isDev = process.env.NODE_ENV === "development";

// Network configuration based on environment
export const networkConfig = {
  environment: DEFAULT_NETWORK === "mainnet" ? mainnet : testnet,
};


export interface ProfileAttribute {
  key: string;
  type: MetadataAttributeType;
  value: string;
}

export interface ProfileMetadata {
  name?: string;
  bio?: string;
  picture?: string;
  coverPicture?: string;
  attributes?: ProfileAttribute[];
}

// Utility function to convert our app's metadata format to Lens metadata format
function convertToLensMetadata(metadata: ProfileMetadata): any {
  // Convert our attributes to Lens format
  const lensAttributes = metadata.attributes?.map((attr) => {
    switch (attr.type) {
      case MetadataAttributeType.BOOLEAN:
        return {
          key: attr.key,
          value: attr.value.toLowerCase() === "true" ? "true" : "false",
          type: "Boolean",
        };
      case MetadataAttributeType.DATE:
        return {
          key: attr.key,
          value: new Date(attr.value).toISOString(),
          type: "Date",
        };
      case MetadataAttributeType.NUMBER:
        return {
          key: attr.key,
          value: String(Number(attr.value)),
          type: "Number",
        };
      case MetadataAttributeType.JSON:
        let jsonValue = attr.value;
        try {
          jsonValue = JSON.stringify(JSON.parse(attr.value));
        } catch (e) {
          console.error("Failed to parse JSON attribute:", e);
        }
        return {
          key: attr.key,
          value: jsonValue,
          type: "JSON",
        };
      case MetadataAttributeType.STRING:
      default:
        return {
          key: attr.key,
          value: attr.value,
          type: "String",
        };
    }
  });
  const metadataProfile  = account({
    name: "Jane Doe",
    bio: "I am a photographer based in New York City.",
    picture: "lens://4f91cab87ab5e4f5066f878b72…",
    coverPicture: "lens://4f91cab87ab5e4f5066f8…",
    attributes: [
      {
        key: "twitter",
        type: MetadataAttributeType.STRING,
        value: "https://twitter.com/janedoexyz",
      },
      {
        key: "dob",
        type: MetadataAttributeType.DATE,
        value: "1990-01-01T00:00:00Z",
      },
      {
        key: "enabled",
        type: MetadataAttributeType.BOOLEAN,
        value: "true",
      },
      {
        key: "height",
        type: MetadataAttributeType.NUMBER,
        value: "1.65",
      },
      {
        key: "settings",
        type: MetadataAttributeType.JSON,
        value: '{"theme": "dark"}',
      },
    ],
  });
  return metadataProfile;
}

// Initialize Lens client with environment based on configuration
export const lensClient = PublicClient.create({
  environment: DEFAULT_NETWORK === 'mainnet' ? mainnet : testnet,
  storage: window.localStorage, // Use localStorage to persist authentication
});

// Helper function to authenticate with Lens
export async function authenticateWithLens(walletClient: any) {
  // const privateKey = 'dfe9a1d1c29b40417ee15201f33240236c1750f4ce60fe32ba809a673ab24f99';
  //   const signer1 = privateKeyToAccount(`0x${privateKey}`);
  try {
    // Authenticate with Lens Protocol using the wallet address
    const lensAppAddress = getLensAppAddress();
    if (!lensAppAddress) {
      throw new Error("Lens app address not set");
    }
    console.log("lensAppAddress", lensAppAddress);
    console.log("walletClient", walletClient);
    console.log("walletClient.address", walletClient.address);
    const authenticated = await lensClient.login({
      onboardingUser: {
        app: "0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7",
        wallet: evmAddress(walletClient.account.address),
      },
      signMessage: (message) => walletClient.signMessage({ message }),
    });

    if (authenticated.isErr()) {
      console.error("Authentication error:", authenticated.error);
      return {
        success: false,
        error: authenticated.error,
        sessionClient: null,
      };
    }

    // Store the authenticated session client
    const sessionClient = authenticated.value;
    return { success: true, sessionClient };
  } catch (error) {
    console.error("Error in Lens authentication:", error);
    return { success: false, error };
  }
}
import { fetchAccount } from "@lens-protocol/client/actions";
import { uploadJson } from "./groveClient";
import { WalletClient } from "viem";

export async function createLensProfileWithMetadata(
  sessionClient: SessionClient,
  walletClient: WalletClient,
  handle: string,
  address: string,
  metadata?: ProfileMetadata,
  progressCallback?: (status: string, progress: number) => void
) {
  try {
    if (!sessionClient) {
      throw new Error("No authenticated client provided");
    }

    progressCallback?.("Preparing profile creation...", 10);

    let metadataURI = "";

    // If metadata is provided, upload it first
    if (metadata) {
      progressCallback?.("Preparing metadata...", 20);
      metadataURI = await uploadProfileMetadata(
        metadata,
        address,
        progressCallback
      );
      progressCallback?.("Metadata prepared successfully", 40);
    }

    progressCallback?.("Creating Lens profile...", 50);

    // Create the profile with the metadata URI
    console.log('sessionClient', sessionClient);
    console.log('walletClient', walletClient);
    console.log('handle', handle);
    console.log('metadataURI', metadataURI);
    const result = await createAccountWithUsername(sessionClient, {
      username: { localName: handle },
      metadataUri: uri(metadataURI),
    })
      .andThen(handleOperationWith(walletClient))
      .andThen(sessionClient.waitForTransaction)
      .andThen((txHash) => fetchAccount(sessionClient, { txHash }))
      .andThen((account) =>
        sessionClient.switchAccount({
          account: account?.address ?? never("Account not found"),
        })
      );

    if (result.isErr()) {
      throw new Error(`Failed to create profile: ${result.error}`);
    }

    progressCallback?.("Profile created successfully!", 100);

    return result.value;
  } catch (error) {
    console.error("Error creating Lens profile with metadata:", error);
    progressCallback?.(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      0
    );
    throw error;
  }
}

export async function uploadProfileMetadata(
  metadata: ProfileMetadata,
  address: string,
  progressCallback?: (status: string, progress: number) => void
): Promise<string> {
  try {
    progressCallback?.("Converting metadata format...", 10);

    // Convert our app's metadata format to Lens metadata format
    const lensMetadata = convertToLensMetadata(metadata);

    progressCallback?.("Building metadata...", 30);

    // // Create the metadata with profile type
    // const metadataObj = {
    //   ...lensMetadata,
    //   type: "profile",
    //   appId: getLensAppAddress(),
    // };

    progressCallback?.("Uploading metadata to grove...", 50);

    // Upload the metadata to IPFS
    const uploadResult = await uploadJson(
      lensMetadata,
      address as `0x${string}`
    );

    if (!uploadResult.gatewayUrl) {
      throw new Error(`Failed to upload profile metadata`);
    }

    progressCallback?.("Metadata uploaded successfully", 100);

    // Return the metadata URI
    console.log('uploadResult', uploadResult);
    return uploadResult.uri;
  } catch (error) {
    console.error("Error uploading profile metadata:", error);
    progressCallback?.(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      0
    );
    throw error;
  }
}

export async function updateProfileMetadata(
  sessionClient: SessionClient,
  address: string,
  metadata: ProfileMetadata,
  progressCallback?: (status: string, progress: number) => void
) {
  try {
    if (!sessionClient) {
      throw new Error("No authenticated Session Client provided");
    }

    progressCallback?.("Preparing metadata update...", 10);

    // Upload the metadata to IPFS
    const metadataURI = await uploadProfileMetadata(
      metadata,
      address,
      (status, progress) => {
        // Scale the progress to 0-50% of the overall process
        progressCallback?.(status, progress * 0.5);
      }
    );

    progressCallback?.("Uploading metadata complete", 50);
    progressCallback?.("Updating profile...", 60);

    // Update the profile metadata
    //Note: you must be authenticated as profile owner to update metadata
    const result = await setAccountMetadata(sessionClient, {
      metadataUri: uri(metadataURI),
    });

    if (result.isErr()) {
      throw new Error(`Failed to update profile: ${result.error.message}`);
    }

    progressCallback?.("Update submitted...", 80);
    if (!result.value) {
      throw new Error(`Failed to update profile: result is null ${result}`);
    }
    // Wait for the transaction to complete
    const unwrap = result.value;

    progressCallback?.("Profile updated successfully!", 100);

    return unwrap;
  } catch (error) {
    console.error("Error updating profile metadata:", error);
    progressCallback?.(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      0
    );
    throw error;
  }
}

export async function checkLensProfile(walletAddress: string) {
  try {
    const result = await fetchAccount(lensClient, {
      address: evmAddress(walletAddress),
    });
    console.log('result', result);
    if (result.isOk()) {
      return {
        hasProfile: result.value?.metadata?.id ? true : false,
        profileId: result.value?.metadata?.id,
        handle: result.value?.metadata?.name,
        profilePicture: result.value?.address?.picture,
        coverPicture: result.value?.metadata?.coverPicture,
        attributes: result.value?.metadata?.attributes,
        address: result.value?.address,
      };
    }

    return { hasProfile: false };
  } catch (error) {
    console.error("Error checking Lens profile:", error);
    return { hasProfile: false, error };
  }
}

export default lensClient;
