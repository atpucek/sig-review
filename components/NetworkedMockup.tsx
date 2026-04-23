"use client";

import type { Post } from "@/lib/types";
import Avatar from "./Avatar";
import CopyRenderer from "./CopyRenderer";
import { formatDate } from "@/lib/text";

export default function NetworkedMockup({
  post,
  avatarSrc,
}: {
  post: Post;
  avatarSrc: string | null;
}) {
  const images = post.media.filter((m) => m.kind === "image");
  const video = post.media.find((m) => m.kind === "video");

  return (
    <div className="mockup-card" style={{ maxWidth: 520 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "14px 18px 10px",
          gap: 12,
        }}
      >
        <Avatar src={avatarSrc} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>SIG</div>
          <div style={{ fontSize: 12, color: "#5a6475" }}>
            Sourcing Industry Group
            {post.publishDate ? ` · ${formatDate(post.publishDate)}` : ""}
          </div>
        </div>
      </div>

      {/* Copy */}
      {(post.copy || post.hashtags || post.mentions) && (
        <div
          style={{
            padding: "0 18px 12px",
            fontSize: 14,
            lineHeight: 1.5,
            color: "#2a3142",
          }}
        >
          <CopyRenderer
            copy={post.copy}
            variant="networked"
            extraHashtags={post.hashtags}
            extraMentions={post.mentions}
          />
          {post.ctaLink && (
            <div
              style={{
                color: "#0d2a52",
                marginTop: 6,
                wordBreak: "break-all",
              }}
            >
              {post.ctaLink}
            </div>
          )}
        </div>
      )}

      {/* Media */}
      {post.format === "single" && images[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={images[0].src}
          alt=""
          style={{ width: "100%", display: "block" }}
        />
      )}
      {post.format === "carousel" && images.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(images.length, 3)}, 1fr)`,
            gap: 4,
          }}
        >
          {images.slice(0, 6).map((img, i) => (
            <div key={i} style={{ position: "relative", aspectRatio: "1 / 1" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  background: "rgba(13,42,82,0.85)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                {i + 1}/{images.length}
              </div>
            </div>
          ))}
        </div>
      )}
      {post.format === "video" && (
        <div
          style={{
            position: "relative",
            background: "#000",
            aspectRatio: "16 / 9",
          }}
        >
          {video?.src ? (
            <video
              src={video.src}
              controls
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : null}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          borderTop: "1px solid #e5e7ec",
          fontSize: 12,
          color: "#5a6475",
        }}
      >
        <span>142 engagements</span>
        <span>24 comments</span>
      </div>
    </div>
  );
}
