
/**
 * This script corrects the metadata of S3 objects, specifically renaming the `originalname` key to `original-name`.
 * Make sure to migrate your data first from your old storage service (e.g. GCS) to a S3-compatible service,
 * I recommend using Cloudflare R2 migration tool for this purpose. If you already have a staging environment,
 * create a ".env.staging" file and fill out the S3 credentials and bucket information.
 * 
 * To use this script, you can run it with `bun run ./scripts/utils/db/correctMetadataS3.ts`.
 * If you need to pass a different environment file, you can use the `--env-file=` option.
*/

import { AwsClient } from "aws4fetch";

// Setup
const client = new AwsClient({
  service: "s3",
  region: "auto",
  accessKeyId: process.env.S3_ACCESS,
  secretAccessKey: process.env.S3_SECRET,
});

const ENDPOINT = process.env.S3_ENDPOINT;
const BUCKET = process.env.S3_BUCKET_AVATARFILES;
const PREFIX = "avatars/";

// Helpers
function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`));
  return match ? match[1] : null;
}

function extractAll(xml: string, tag: string): string[] {
  const matches = [...xml.matchAll(new RegExp(`<${tag}>(.*?)</${tag}>`, "g"))];
  return matches.map((m) => m[1]);
}

async function listObjects(continuationToken?: string) {
  const url = new URL(`${ENDPOINT}/${BUCKET}`);
  url.searchParams.set("list-type", "2");
  url.searchParams.set("prefix", PREFIX);
  if (continuationToken) {
    url.searchParams.set("continuation-token", continuationToken);
  }

  const res = await client.fetch(url.toString());
  const xml = await res.text();

  if (!res.ok) throw new Error(`ListObjectsV2 failed: ${xml}`);

  return {
    keys: extractAll(xml, "Key"),
    nextToken: extractTag(xml, "NextContinuationToken"),
    isTruncated: extractTag(xml, "IsTruncated") === "true",
  };
}

async function headObject(key: string) {
  const url = `${ENDPOINT}/${BUCKET}/${encodeURIComponent(key)}`;
  const res = await client.fetch(url, { method: "HEAD" });
  if (!res.ok) throw new Error(`HeadObject failed for ${key}: ${res.status}`);

  const meta: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    if (key.startsWith("x-amz-meta-")) {
      meta[key.replace("x-amz-meta-", "")] = value;
    }
  });

  return {
    metadata: meta,
    contentType: res.headers.get("content-type") ?? "application/octet-stream",
  };
}

async function copyObjectWithNewMetadata(
  key: string,
  metadata: Record<string, string>,
  contentType: string
) {
  const url = `${ENDPOINT}/${BUCKET}/${encodeURIComponent(key)}`;
  const headers: Record<string, string> = {
    "x-amz-copy-source": `/${BUCKET}/${encodeURIComponent(key)}`,
    "x-amz-metadata-directive": "REPLACE",
    "content-type": contentType,
  };

  for (const [k, v] of Object.entries(metadata)) {
    headers[`x-amz-meta-${k}`] = v;
  }

  const res = await client.fetch(url, { method: "PUT", headers });
  if (!res.ok) {
    throw new Error(`CopyObject failed for ${key}: ${await res.text()}`);
  }
}

// Main execution
(async function() {
  let continuationToken: string | undefined;
  let total = 0;
  let fixed = 0;

  do {
    const { keys, nextToken } = await listObjects(continuationToken);
    const BATCH_SIZE = 10;
    for (let i = 0; i < keys.length; i += BATCH_SIZE) {
      const batch = keys.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (key) => {
          total++;
          const { metadata, contentType } = await headObject(key);
          if (!("originalname" in metadata)) return;

          const newMeta = { ...metadata };
          newMeta["original-name"] = newMeta["originalname"];
          delete newMeta["originalname"];

          await copyObjectWithNewMetadata(key, newMeta, contentType);
          fixed++;
          console.log(`Fixed: ${key}`);
        })
      );
    }

    continuationToken = nextToken ?? undefined;
  } while (continuationToken);

  console.log(`Done. Scanned ${total}, fixed ${fixed}.`);
})();