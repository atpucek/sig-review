"use client";

import { tokenize } from "@/lib/text";

type Variant = "linkedin" | "facebook" | "instagram" | "networked";

const VARIANT_COLORS: Record<Variant, string> = {
  linkedin: "#0a66c2",
  facebook: "#1877f2",
  instagram: "#00376b",
  networked: "#0d2a52",
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

  // Combine copy with explicit hashtags/mentions fields so they render uniformly
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
    const mentions = extraMentions
      .split(/[\s,]+/)
      .map((m) => m.trim())
      .filter(Boolean)
      .map((m) => (m.startsWith("@") ? m : `@${m}`));
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
        if (s.kind === "mention") {
          return (
            <span
              key={i}
              className="tok-mention"
              style={{
                color: accent,
                fontWeight: 500,
                textDecoration: "underline",
              }}
            >
              {s.value}
            </span>
          );
        }
        if (s.kind === "url") {
          return (
            <span key={i} className="tok-url" style={{ color: accent }}>
              {s.value}
            </span>
          );
        }
        return null;
      })}
    </div>
  );
}
