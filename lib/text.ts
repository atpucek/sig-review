/**
 * Shared text tokenizer for rendering post copy in platform mockups.
 * Produces an array of segments so each platform can color them per brand.
 */

export type Segment =
  | { kind: "text"; value: string }
  | { kind: "hashtag"; value: string }
  | { kind: "mention"; value: string }
  | { kind: "url"; value: string }
  | { kind: "break" };

const HASHTAG_RE = /#[A-Za-z0-9_]+/;
const MENTION_RE = /@[A-Za-z0-9_.-]+/;
const URL_RE = /https?:\/\/[^\s]+/;

export function tokenize(copy: string): Segment[] {
  const out: Segment[] = [];
  if (!copy) return out;

  for (const line of copy.split("\n")) {
    let remaining = line;
    while (remaining.length > 0) {
      const hash = HASHTAG_RE.exec(remaining);
      const mention = MENTION_RE.exec(remaining);
      const url = URL_RE.exec(remaining);

      const candidates = [
        hash && { ...hash, kind: "hashtag" as const },
        mention && { ...mention, kind: "mention" as const },
        url && { ...url, kind: "url" as const },
      ].filter(Boolean) as { index: number; 0: string; kind: Segment["kind"] }[];

      if (candidates.length === 0) {
        out.push({ kind: "text", value: remaining });
        break;
      }

      candidates.sort((a, b) => a.index - b.index);
      const first = candidates[0];
      if (first.index > 0) {
        out.push({ kind: "text", value: remaining.slice(0, first.index) });
      }
      out.push({ kind: first.kind, value: first[0] } as Segment);
      remaining = remaining.slice(first.index + first[0].length);
    }
    out.push({ kind: "break" });
  }

  // Remove trailing break
  if (out.length && out[out.length - 1].kind === "break") {
    out.pop();
  }
  return out;
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function relativeTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = Date.now();
  const diff = Math.round((now - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
