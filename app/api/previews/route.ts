import { NextRequest } from "next/server";
import { listPreviews, savePreview } from "@/lib/storage";
import type { Preview } from "@/lib/types";

export async function GET() {
  const previews = await listPreviews();
  return Response.json({ previews });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<Preview>;

    if (!body.title || !body.posts) {
      return Response.json(
        { error: "Missing required fields: title, posts" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const id = body.id || generateId();

    const preview: Preview = {
      id,
      title: body.title,
      campaign: body.campaign || "",
      subCampaign: body.subCampaign || "",
      preparedBy: body.preparedBy || "Alyssa Pucek",
      posts: body.posts,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    await savePreview(preview);
    return Response.json({ preview });
  } catch (e) {
    return Response.json(
      { error: (e as Error).message || "Failed to save preview" },
      { status: 500 }
    );
  }
}

function generateId(): string {
  // URL-safe short-ish UUID-like id
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
