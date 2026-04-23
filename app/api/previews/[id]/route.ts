import { NextRequest } from "next/server";
import { deletePreview, getPreview } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const preview = await getPreview(id);
  if (!preview) {
    return Response.json({ error: "Preview not found" }, { status: 404 });
  }
  return Response.json({ preview });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deletePreview(id);
  return Response.json({ ok: true });
}
