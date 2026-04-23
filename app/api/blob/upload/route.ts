import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest } from "next/server";

/**
 * Direct browser-to-blob upload handler for videos (bypasses the 4.5MB
 * serverless function body limit). The client calls `upload()` from
 * `@vercel/blob/client` and this route signs the upload.
 *
 * Requires BLOB_READ_WRITE_TOKEN (auto-set by Vercel when Blob is provisioned).
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      {
        error:
          "Video uploads require Vercel Blob. Provision Blob storage in the Vercel dashboard and redeploy.",
      },
      { status: 501 }
    );
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Limit to video mime types and 200MB
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/quicktime",
            "video/webm",
            "video/x-m4v",
          ],
          maximumSizeInBytes: 200 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async () => {
        // Nothing to do — the Preview JSON stores the returned URL.
      },
    });
    return Response.json(jsonResponse);
  } catch (e) {
    return Response.json(
      { error: (e as Error).message || "Upload failed" },
      { status: 400 }
    );
  }
}
