import { promises as fs } from "fs";
import path from "path";
import type { Preview, PreviewSummary } from "./types";

/**
 * Storage adapter.
 *
 * On Vercel (production): uses Vercel KV when KV_REST_API_URL + KV_REST_API_TOKEN
 * env vars are present.
 *
 * Locally (dev) or when KV is not configured: falls back to a JSON file at
 * .data/previews.json in the project root.
 */

const hasKv =
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
const onVercel = !!process.env.VERCEL;

function requireKvMessage(): never {
  throw new Error(
    "Preview storage is not configured. Provision Vercel KV (Redis) in the Vercel dashboard — that automatically sets KV_REST_API_URL and KV_REST_API_TOKEN — then redeploy."
  );
}

// --- Vercel KV adapter ---

async function kvClient() {
  const mod = await import("@vercel/kv");
  return mod.kv;
}

const KV_INDEX_KEY = "previews:index";
const kvKey = (id: string) => `preview:${id}`;

async function kvList(): Promise<PreviewSummary[]> {
  const kv = await kvClient();
  const index = (await kv.get<PreviewSummary[]>(KV_INDEX_KEY)) || [];
  return index;
}

async function kvGet(id: string): Promise<Preview | null> {
  const kv = await kvClient();
  const p = await kv.get<Preview>(kvKey(id));
  return p || null;
}

async function kvSave(preview: Preview): Promise<void> {
  const kv = await kvClient();
  await kv.set(kvKey(preview.id), preview);
  const index = (await kv.get<PreviewSummary[]>(KV_INDEX_KEY)) || [];
  const summary = toSummary(preview);
  const next = index.filter((x) => x.id !== preview.id);
  next.unshift(summary);
  await kv.set(KV_INDEX_KEY, next);
}

async function kvDelete(id: string): Promise<void> {
  const kv = await kvClient();
  await kv.del(kvKey(id));
  const index = (await kv.get<PreviewSummary[]>(KV_INDEX_KEY)) || [];
  const next = index.filter((x) => x.id !== id);
  await kv.set(KV_INDEX_KEY, next);
}

// --- Local file adapter (dev fallback) ---

const LOCAL_DIR = path.join(process.cwd(), ".data");
const LOCAL_FILE = path.join(LOCAL_DIR, "previews.json");

type LocalShape = { previews: Record<string, Preview> };

async function readLocal(): Promise<LocalShape> {
  try {
    const buf = await fs.readFile(LOCAL_FILE, "utf-8");
    const parsed = JSON.parse(buf);
    if (!parsed || typeof parsed !== "object" || !parsed.previews) {
      return { previews: {} };
    }
    return parsed as LocalShape;
  } catch {
    return { previews: {} };
  }
}

async function writeLocal(data: LocalShape): Promise<void> {
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function localList(): Promise<PreviewSummary[]> {
  const data = await readLocal();
  return Object.values(data.previews)
    .map(toSummary)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function localGet(id: string): Promise<Preview | null> {
  const data = await readLocal();
  return data.previews[id] || null;
}

async function localSave(preview: Preview): Promise<void> {
  const data = await readLocal();
  data.previews[preview.id] = preview;
  await writeLocal(data);
}

async function localDelete(id: string): Promise<void> {
  const data = await readLocal();
  delete data.previews[id];
  await writeLocal(data);
}

// --- Public API ---

function toSummary(p: Preview): PreviewSummary {
  return {
    id: p.id,
    title: p.title,
    campaign: p.campaign,
    subCampaign: p.subCampaign,
    preparedBy: p.preparedBy,
    postCount: p.posts.length,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function listPreviews(): Promise<PreviewSummary[]> {
  if (hasKv) return kvList();
  if (onVercel) requireKvMessage();
  return localList();
}

export async function getPreview(id: string): Promise<Preview | null> {
  if (hasKv) return kvGet(id);
  if (onVercel) requireKvMessage();
  return localGet(id);
}

export async function savePreview(preview: Preview): Promise<void> {
  if (hasKv) return kvSave(preview);
  if (onVercel) requireKvMessage();
  return localSave(preview);
}

export async function deletePreview(id: string): Promise<void> {
  if (hasKv) return kvDelete(id);
  if (onVercel) requireKvMessage();
  return localDelete(id);
}
