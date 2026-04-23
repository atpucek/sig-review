"use client";

import type { Platform, Post, PostFormat } from "@/lib/types";
import MediaUploader from "./MediaUploader";
import type { OrganicPost } from "@/app/api/smartsheet/posts/route";

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "networked", label: "Networked" },
];

const FORMATS: { value: PostFormat; label: string }[] = [
  { value: "single", label: "Single Image" },
  { value: "carousel", label: "Carousel" },
  { value: "video", label: "Video" },
  { value: "text", label: "Text Only" },
];

export default function PostEditor({
  post,
  index,
  onChange,
  onRemove,
  onMove,
  smartsheetPosts,
  sheetCampaign,
  sheetSubCampaign,
  isFirst,
  isLast,
}: {
  post: Post;
  index: number;
  onChange: (next: Post) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  smartsheetPosts: OrganicPost[];
  sheetCampaign: string;
  sheetSubCampaign: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const patch = (p: Partial<Post>) => onChange({ ...post, ...p });

  const togglePlatform = (platform: Platform) => {
    const has = post.platforms.includes(platform);
    const next = has
      ? post.platforms.filter((p) => p !== platform)
      : [...post.platforms, platform];
    patch({ platforms: next });
  };

  const mode = post.sourceRowId ? "pull" : "manual";
  function setMode(m: "pull" | "manual") {
    if (m === "manual") {
      patch({ sourceRowId: null, sourceSheet: null });
    } else {
      patch({ sourceSheet: "organic" });
    }
  }

  function pullFromRow(rowId: string) {
    if (!rowId) {
      patch({ sourceRowId: null });
      return;
    }
    const src = smartsheetPosts.find((p) => p.rowId === rowId);
    if (!src) return;
    const channels = (src.platform || "")
      .toLowerCase()
      .split(/[,/|]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const platforms: Platform[] = [];
    if (channels.some((c) => c.includes("linkedin"))) platforms.push("linkedin");
    if (channels.some((c) => c.includes("facebook") || c === "fb")) platforms.push("facebook");
    if (channels.some((c) => c.includes("instagram") || c === "ig")) platforms.push("instagram");
    if (channels.some((c) => c.includes("networked"))) platforms.push("networked");

    // Auto-extract hashtags from copy
    const copyText = src.copy || "";
    const hashtagMatches = copyText.match(/#[A-Za-z0-9_]+/g) || [];
    const mergedHashtags = Array.from(
      new Set([
        ...post.hashtags
          .split(/[\s,]+/)
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t) => (t.startsWith("#") ? t : `#${t}`)),
        ...hashtagMatches,
      ])
    ).join(" ");

    patch({
      sourceRowId: src.rowId,
      sourceSheet: "organic",
      copy: copyText,
      publishDate: src.publishDate || post.publishDate,
      hashtags: mergedHashtags,
      platforms: platforms.length ? platforms : post.platforms,
      media: src.imageUrl
        ? [{ kind: "image" as const, src: src.imageUrl, name: src.name }]
        : post.media,
    });
  }

  // Filter smartsheet posts to selected campaign/sub-campaign
  const filteredPosts = smartsheetPosts.filter((p) => {
    const matchesCampaign =
      !sheetCampaign ||
      sheetCampaign === "Other / Manual" ||
      (p.campaign || "").toLowerCase() === sheetCampaign.toLowerCase();
    const matchesSub =
      !sheetSubCampaign ||
      sheetSubCampaign === "Other / Manual" ||
      (p.subCampaign || "").toLowerCase() === sheetSubCampaign.toLowerCase();
    return matchesCampaign && matchesSub;
  });

  return (
    <div
      className="card"
      style={{
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              background: "var(--sig-red)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {index + 1}
          </div>
          <div style={{ fontWeight: 700 }}>Post {index + 1}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onMove(-1)}
            disabled={isFirst}
            title="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onMove(1)}
            disabled={isLast}
            title="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-danger"
            onClick={onRemove}
            title="Remove"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Source toggle */}
      <div>
        <div className="label">Source</div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["pull", "manual"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`pill ${mode === m ? "pill-active" : ""}`}
              onClick={() => setMode(m)}
            >
              {m === "pull" ? "Pull from calendar" : "Create manually"}
            </button>
          ))}
        </div>

        {mode === "pull" && (
          <div style={{ marginTop: 10 }}>
            <select
              className="select"
              value={post.sourceRowId || ""}
              onChange={(e) => pullFromRow(e.target.value)}
            >
              <option value="">
                {filteredPosts.length === 0
                  ? "— No matching posts in calendar —"
                  : "— Select a post from the calendar —"}
              </option>
              {filteredPosts.map((p) => (
                <option key={p.rowId} value={p.rowId}>
                  {p.name}
                  {p.publishDate ? ` — ${p.publishDate}` : ""}
                </option>
              ))}
            </select>
            {sheetCampaign === "" && (
              <div
                className="muted"
                style={{ fontSize: 12, marginTop: 6 }}
              >
                Tip: pick a Campaign above to narrow the list.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Platforms */}
      <div>
        <div className="label">Platforms</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {PLATFORMS.map(({ value, label }) => {
            const active = post.platforms.includes(value);
            return (
              <button
                key={value}
                type="button"
                className={`pill ${active ? `pill-platform-active-${value}` : ""}`}
                onClick={() => togglePlatform(value)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Format */}
      <div>
        <div className="label">Format</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {FORMATS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`pill ${post.format === value ? "pill-active" : ""}`}
              onClick={() => patch({ format: value })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Media */}
      {post.format !== "text" && (
        <div>
          <div className="label">Media</div>
          {post.format === "single" && (
            <MediaUploader
              media={post.media.filter((m) => m.kind === "image").slice(0, 1)}
              multiple={false}
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(next) => patch({ media: next })}
              label="Upload image"
              mode="image"
            />
          )}
          {post.format === "carousel" && (
            <MediaUploader
              media={post.media.filter((m) => m.kind === "image")}
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(next) => patch({ media: next })}
              label="Upload images"
              mode="image"
            />
          )}
          {post.format === "video" && (
            <div className="col">
              <MediaUploader
                media={post.media.filter((m) => m.kind === "video").slice(0, 1)}
                multiple={false}
                accept="video/mp4,video/quicktime,video/webm"
                onChange={(next) => patch({ media: next })}
                label="Upload video file"
                mode="video"
              />
              <div style={{ fontSize: 12, color: "#71717a" }}>
                Or paste a YouTube/Vimeo link:
              </div>
              <input
                type="url"
                className="input"
                placeholder="https://www.youtube.com/watch?v=…"
                value={post.media.find((m) => m.kind === "video")?.link || ""}
                onChange={(e) => {
                  const link = e.target.value;
                  const existing = post.media.find((m) => m.kind === "video");
                  if (existing) {
                    const next = post.media.map((m) =>
                      m === existing ? { ...m, link } : m
                    );
                    patch({ media: next });
                  } else if (link) {
                    patch({
                      media: [...post.media, { kind: "video", src: "", link }],
                    });
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Instagram crop */}
      {post.platforms.includes("instagram") && post.format !== "text" && (
        <div>
          <div className="label">Instagram crop</div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["1:1", "4:5"] as const).map((c) => (
              <button
                key={c}
                type="button"
                className={`pill ${post.igCrop === c ? "pill-active" : ""}`}
                onClick={() => patch({ igCrop: c })}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Copy */}
      <div>
        <div className="label">Copy</div>
        <textarea
          className="textarea"
          value={post.copy}
          onChange={(e) => patch({ copy: e.target.value })}
          placeholder="Main post copy…"
          rows={Math.min(12, Math.max(3, post.copy.split("\n").length + 1))}
        />
      </div>

      {/* Date + hashtags + mentions + CTA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <div>
          <div className="label">Publish date</div>
          <input
            type="date"
            className="input"
            value={post.publishDate}
            onChange={(e) => patch({ publishDate: e.target.value })}
          />
        </div>
        <div>
          <div className="label">Hashtags</div>
          <input
            type="text"
            className="input"
            placeholder="#SIGOneDay #Sourcing"
            value={post.hashtags}
            onChange={(e) => patch({ hashtags: e.target.value })}
          />
        </div>
        <div>
          <div className="label">Mentions</div>
          <input
            type="text"
            className="input"
            placeholder="@SpeakerName"
            value={post.mentions}
            onChange={(e) => patch({ mentions: e.target.value })}
          />
        </div>
        <div>
          <div className="label">CTA / Link</div>
          <input
            type="url"
            className="input"
            placeholder="https://…"
            value={post.ctaLink}
            onChange={(e) => patch({ ctaLink: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
