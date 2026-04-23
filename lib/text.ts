/**
 * Shared text tokenizer for rendering post copy in platform mockups.
 * Produces an array of segments so each platform can color them per brand.
 *
 * Mention syntax: @"Full Name" (with quotes). The rendered output omits
 * the @ and the quotes — only the name is shown, colored per platform.
 * Plain @handles (without quotes) are also supported and rendered as-is.
 */

export type Segment =
  | { kind: "text"; value: string }
  | { kind: "hashtag"; value: string }
  | { kind: "mention"; value: string } // raw value including @ and quotes
  | { kind: "mentionQuoted"; name: string } // name only, quotes stripped
  | { kind: "url"; value: string }
  | { kind: "break" };

const HASHTAG_RE = /#[A-Za-z0-9_]+/;
const MENTION_QUOTED_RE = /@"([^"]+)"/;
const MENTION_PLAIN_RE = /@[A-Za-z0-9_.-]+/;
const URL_RE = /https?:\/\/[^\s]+/;

export function tokenize(copy: string): Segment[] {
  const out: Segment[] = [];
  if (!copy) return out;

  for (const line of copy.split("\n")) {
    let remaining = line;
    while (remaining.length > 0) {
      const hash = HASHTAG_RE.exec(remaining);
      const quoted = MENTION_QUOTED_RE.exec(remaining);
      const plain = MENTION_PLAIN_RE.exec(remaining);
      const url = URL_RE.exec(remaining);

      type Candidate = {
        index: number;
        length: number;
        kind: Segment["kind"];
        value: string;
        name?: string;
      };

      const candidates: Candidate[] = [];
      if (hash) {
        candidates.push({
          index: hash.index,
          length: hash[0].length,
          kind: "hashtag",
          value: hash[0],
        });
      }
      if (quoted) {
        candidates.push({
          index: quoted.index,
          length: quoted[0].length,
          kind: "mentionQuoted",
          value: quoted[0],
          name: quoted[1],
        });
      }
      // Only accept plain @ mention if it isn't actually the @ of an @"..."
      if (plain && !(quoted && plain.index === quoted.index)) {
        candidates.push({
          index: plain.index,
          length: plain[0].length,
          kind: "mention",
          value: plain[0],
        });
      }
      if (url) {
        candidates.push({
          index: url.index,
          length: url[0].length,
          kind: "url",
          value: url[0],
        });
      }

      if (candidates.length === 0) {
        out.push({ kind: "text", value: remaining });
        break;
      }

      candidates.sort((a, b) => a.index - b.index);
      const first = candidates[0];
      if (first.index > 0) {
        out.push({ kind: "text", value: remaining.slice(0, first.index) });
      }
      if (first.kind === "mentionQuoted") {
        out.push({ kind: "mentionQuoted", name: first.name! });
      } else if (first.kind === "mention") {
        out.push({ kind: "mention", value: first.value });
      } else if (first.kind === "hashtag") {
        out.push({ kind: "hashtag", value: first.value });
      } else if (first.kind === "url") {
        out.push({ kind: "url", value: first.value });
      }
      remaining = remaining.slice(first.index + first.length);
    }
    out.push({ kind: "break" });
  }

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
