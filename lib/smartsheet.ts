/**
 * Smartsheet helpers (server-side only).
 *
 * The Smartsheet API is CORS-blocked in the browser, so all calls must go
 * through /api/smartsheet/* route handlers. These helpers run in those routes.
 */

export const SHEETS = {
  marketingCalendar: "6962924103880580", // campaign overview
  organicSocial: "5981019476807556", // post details (copy, creative, date, status)
  paidSocial: "2380929671581572", // ad details
} as const;

type SsCol = { id: number; title: string };
type SsCell = {
  columnId: number;
  displayValue?: string;
  value?: string | number | boolean;
};
type SsRow = { id: number; cells: SsCell[]; permalink?: string };
type SsSheet = {
  name: string;
  columns: SsCol[];
  rows: SsRow[];
  totalRowCount?: number;
};

export async function fetchSheet(
  token: string,
  sheetId: string
): Promise<SsSheet> {
  const resp = await fetch(`https://api.smartsheet.com/2.0/sheets/${sheetId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!resp.ok) {
    let msg = `Smartsheet HTTP ${resp.status}`;
    try {
      const e = await resp.json();
      msg = e.message || e.errorCode || msg;
    } catch {}
    throw new Error(msg);
  }
  return (await resp.json()) as SsSheet;
}

export function findColId(
  cols: SsCol[],
  patterns: string[]
): string | null {
  const exact = cols.find((col) =>
    patterns.some((p) => col.title.toLowerCase() === p)
  );
  if (exact) return String(exact.id);
  const c = cols.find((col) =>
    patterns.some((p) => col.title.toLowerCase().includes(p))
  );
  return c ? String(c.id) : null;
}

export function cellByColId(
  cells: SsCell[],
  colId: string | null
): string | null {
  if (!colId) return null;
  const cell = cells.find((c) => String(c.columnId) === colId);
  if (!cell) return null;
  return (
    cell.displayValue ||
    (cell.value != null ? String(cell.value) : null)
  );
}

export function isImageUrl(s: string | null): boolean {
  if (!s) return false;
  return (
    /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i.test(s) ||
    /drive\.google\.|amazonaws\.com|cloudinary|imgur|smartsheet/i.test(s)
  );
}

export function getToken(request: Request): string | null {
  // Prefer server-side env var (keeps token out of the client bundle)
  const envToken = process.env.SMARTSHEET_API_TOKEN;
  if (envToken && envToken.trim()) return envToken.trim();
  const auth = request.headers.get("authorization");
  if (!auth) return null;
  return auth.replace(/^Bearer\s+/i, "").trim() || null;
}
