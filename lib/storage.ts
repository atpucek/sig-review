import { promises as fs } from "fs";
import path from "path";
import type { Preview, PreviewSummary } from "./types";

/**
 * Storage adapter.
 *
 * Production (Vercel): connects to whatever Redis env the project has.
 * Accepts either:
 *   - REDIS_URL (TCP connection string, e.g. from Redis Marketplace) — primary
 *   - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (REST, Upstash)
 *   - KV_REST_API_URL + KV_REST_API_TOKEN (legacy Vercel KV naming)
 *
 * Local dev without any of the above: writes to .data/previews.json.
 */

const REDIS_URL = process.env.REDIS_URL || "";
const REST_URL =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  "";
const REST_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  "";

const hasTcpRedis = !!REDIS_URL;
const hasRestRedis = !!REST_URL && !!REST_TOKEN;
const hasRedis = hasTcpRedis || hasRestRedis;
const onVercel = !!process.env.VERCEL;

function notConfigured(): never {
  throw new Error(
    "Preview storage is not configured. Connect a Redis store in the Vercel dashboard (Storage tab) and redeploy."
  );
}

const INDEX_KEY = "previews:index";
const itemKey = (id: string) => `preview:${id}`;

// --- TCP Redis via ioredis ---

type RedisLike = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<unknown>;
  del(key: string): Promise<unknown>;
};

let redisSingleton: RedisLike | null = null;

async function tcpClient(): Promise<RedisLike> {
  if (redisSingleton) return redisSingleton;
  const { default: Redis } = await import("ioredis");
  const client = new Redis(REDIS_URL, {
    // Serverless: lazy-connect to avoid blocking cold starts
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    enableReadyCheck: false,
  });
  redisSingleton = {
    get: (k) => client.get(k),
    set: (k, v) => client.set(k, v),
    del: (k) => client.del(k),
  };
  return redisSingleton;
}

// --- REST Redis via @vercel/kv (Upstash) ---

async function restClient(): Promise<RedisLike> {
  const mod = await import("@vercel/kv");
  const kv = mod.createClient({ url: REST_URL, token: REST_TOKEN });
  return {
    get: async (k) => {
      const v = await kv.get<string>(k);
      return v ?? null;
    },
    set: async (k, v) => {
      await kv.set(k, v);
    },
    del: async (k) => {
      await kv.del(k);
    },
  };
}

async function client(): Promise<RedisLike> {
  if (hasTcpRedis) return tcpClient();
  if (hasRestRedis) return restClient();
  notConfigured();
}

// --- Unified Redis-backed operations ---

async function redisList(): Promise<PreviewSummary[]> {
  const c = await client();
  const raw = await c.get(INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PreviewSummary[];
  } catch {
    return [];
  }
}

async function redisGet(id: string): Promise<Preview | null> {
  const c = await client();
  const raw = await c.get(itemKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Preview;
  } catch {
    return null;
  }
}

async function redisSave(preview: Preview): Promise<void> {
  const c = await client();
  await c.set(itemKey(preview.id), JSON.stringify(preview));
  const index = await redisList();
  const summary = toSummary(preview);
  const next = index.filter((x) => x.id !== preview.id);
  next.unshift(summary);
  await c.set(INDEX_KEY, JSON.stringify(next));
}

async function redisDelete(id: string): Promise<void> {
  const c = await client();
  await c.del(itemKey(id));
  const index = await redisList();
  const next = index.filter((x) => x.id !== id);
  await c.set(INDEX_KEY, JSON.stringify(next));
}

// --- Local file fallback (dev only) ---

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
  if (hasRedis) return redisList();
  if (onVercel) notConfigured();
  return localList();
}

export async function getPreview(id: string): Promise<Preview | null> {
  if (hasRedis) return redisGet(id);
  if (onVercel) notConfigured();
  return localGet(id);
}

export async function savePreview(preview: Preview): Promise<void> {
  if (hasRedis) return redisSave(preview);
  if (onVercel) notConfigured();
  return localSave(preview);
}

export async function deletePreview(id: string): Promise<void> {
  if (hasRedis) return redisDelete(id);
  if (onVercel) notConfigured();
  return localDelete(id);
}
