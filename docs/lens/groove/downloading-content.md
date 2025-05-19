# Downloading Content

This guide will walk you through retrieving content from Grove.

All uploaded contents are publicly readable. Privacy-settings will be implemented in the future.

## Direct Download

Given a gateway URL (`https://api.grove.storage/af5225b…`), you can simply use it to download the file.

### Link Example

```html
<a href="https://api.grove.storage/af5225b…">Download</a>
```

### Image Example

```html
<img src="https://api.grove.storage/af5225b…" alt="Image from Grove" />
```

## Resolving Lens URIs

Given a `lens://af5225b…` URI, you can resolve its content to a URL.

### TypeScript

Use the `resolve` method to get the URL:

```typescript
import { StorageClient } from "@lens-chain/storage-client";

const storageClient = StorageClient.create();
const url = storageClient.resolve("lens://af5225b…");
// url: https://api.grove.storage/af5225b…
```

### Other Languages

For other languages, you can simply replace the `lens://` protocol with `https://api.grove.storage/`:

```javascript
// JavaScript
function resolve(lensUri) {
  return lensUri.replace('lens://', 'https://api.grove.storage/');
}

const url = resolve('lens://af5225b…');
// url: https://api.grove.storage/af5225b…
```

## Retrieving Partial Content

The Grove API supports HTTP range requests to retrieve only partial contents of a file.

For example, this command will download only the first 1024 bytes of a file:

```bash
curl -H 'Content-Range: bytes=0-1023' \
  'https://api.grove.storage/af5225b6262e03be6bfacf31aa416ea5e00ebb05e802d0573222a92f8d0677f5'
```

If the file is a video, you can use the link directly inside the `<video>` HTML tag:

```html
<video width="640" height="480">
  <source src="https://api.grove.storage/af5225b…" type="video/mp4" />
</video>
```

When you move the slider of the video player, the browser will send the appropriate range requests to the Grove API, allowing the video to resume from that point without downloading the entire file.

## Working with Folders

If you've uploaded content as a folder, you can access the folder's index file to discover its contents:

```typescript
// Assuming you have a folder URI: lens://folder123
const folderUrl = storageClient.resolve("lens://folder123");
const response = await fetch(folderUrl);
const folderContents = await response.json();

// folderContents might look like:
// {
//   name: "My Folder",
//   files: [
//     { uri: "lens://file1", gatewayUrl: "https://api.grove.storage/file1", ... },
//     { uri: "lens://file2", gatewayUrl: "https://api.grove.storage/file2", ... },
//   ]
// }

// You can then access individual files
const firstFileUrl = folderContents.files[0].gatewayUrl;
```

## Downloading Files in Node.js

If you're working with a Node.js environment, you might want to download files to the local file system:

```typescript
import { StorageClient } from "@lens-chain/storage-client";
import fs from "fs";
import https from "https";

const storageClient = StorageClient.create();

async function downloadFile(lensUri, outputPath) {
  const url = storageClient.resolve(lensUri);
  
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Handle redirects if needed
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      // Check for successful response
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      // Write to file
      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);
      
      fileStream.on("finish", () => {
        fileStream.close();
        resolve();
      });
      
      fileStream.on("error", (err) => {
        fs.unlink(outputPath, () => {}); // Delete the file on error
        reject(err);
      });
    }).on("error", reject);
  });
}

// Usage
downloadFile("lens://af5225b…", "./downloaded-file.jpg")
  .then(() => console.log("Download complete"))
  .catch((err) => console.error("Download failed:", err));
```

## Error Handling

When downloading content, you might encounter various HTTP status codes:

- `200 OK`: The content was found and is being returned.
- `404 Not Found`: The content was not found. This could be due to an incorrect URI or the content was deleted.
- `500 Internal Server Error`: Something went wrong on the server side. Try again later.

Always implement proper error handling in your applications to provide a good user experience:

```typescript
try {
  const url = storageClient.resolve("lens://af5225b…");
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.blob();
  // Process the downloaded data
} catch (error) {
  console.error("Download failed:", error);
  // Show appropriate error message to the user
}
```

