"use client";

import { tokenize } from "@/lib/text";

type Variant = "linkedin" | "facebook" | "instagram" | "networked";

const VARIANT_COLORS: Record<Variant, string> = {
  linkedin: "#0a66c2",
  facebook: "#1877f2",
  instagram: "#00376b",
  networked: "#0d2a52",
};

// LinkedIn renders @"Name" mentions bold; Facebook renders them plain weight.
const MENTION_BOLD: Record<Variant, boolean> = {
  linkedin: true,
  facebook: false,
  instagram: false,
  networked: false,
};

export default function CopyRenderer({
  copy,
  variant,
  extraHashtags,
  extraMentions,
}: {
  copy: string;
  variant: Variant;
  extraHashtags?: string;
  extraMentions?: string;
}) {
  const accent = VARIANT_COLORS[variant];
  const mentionBold = MENTION_BOLD[variant];

  // Combine copy with explicit hashtags/mentions trailer fields
  const trailer: string[] = [];
  if (extraHashtags && extraHashtags.trim()) {
    const tags = extraHashtags
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));
    if (tags.length) trailer.push(tags.join(" "));
  }
  if (extraMentions && extraMentions.trim()) {
    // Treat each line of the mentions field as a separate mention.
    // Bare names (no quotes, no @) are auto-wrapped as @"…" so they render
    // the same as quoted mentions inside the copy.
    const mentions = extraMentions
      .split(/\n|,/)
      .map((m) => m.trim())
      .filter(Boolean)
      .map((m) => {
        if (m.startsWith('@"') && m.endsWith('"')) return m;
        const stripped = m.startsWith("@") ? m.slice(1) : m;
        if (/\s/.test(stripped)) return `@"${stripped}"`;
        return `@${stripped}`;
      });
    if (mentions.length) trailer.push(mentions.join(" "));
  }

  const fullCopy =
    trailer.length > 0
      ? `${copy || ""}${copy ? "\n\n" : ""}${trailer.join(" ")}`
      : copy || "";

  const segments = tokenize(fullCopy);

  return (
    <div className="mockup-copy">
      {segments.map((s, i) => {
        if (s.kind === "break") return <br key={i} />;
        if (s.kind === "text") return <span key={i}>{s.value}</span>;
        if (s.kind === "hashtag") {
          return (
            <span
              key={i}
              className="tok-hashtag"
              style={{ color: accent, fontWeight: 600 }}
            >
              {s.value}
            </span>
          );
        }
        if (s.kind === "mentionQuoted") {
          // Render just the name — no @, no quotes, no underline.
          // Bold on LinkedIn; plain weight on Facebook et al.
          return (
            <span
              key={i}
              className="tok-mention"
              style={{
                color: accent,
                fontWeight: mentionBold ? 700 : 500,
              }}
            >
              {s.name}
            </span>
          );
        }
        if (s.kind === "mention") {
          return (
            <span
              key={i}
              className="tok-mention"
              style={{
                color: accent,
                fontWeight: mentionBold ? 700 : 500,
              }}
            >
              {s.value}
            </span>
          );
        }
        if (s.kind === "url") {
          // Links get underline to differentiate from mentions.
          return (
            <span
              key={i}
              className="tok-url"
              style={{ color: accent, textDecoration: "underline" }}
            >
              {s.value}
            </span>
          );
        }
        return null;
      })}
    </div>
  );
}
