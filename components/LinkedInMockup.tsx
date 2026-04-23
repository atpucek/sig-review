"use client";

import type { Post } from "@/lib/types";
import Avatar from "./Avatar";
import CopyRenderer from "./CopyRenderer";
import MediaCarousel from "./MediaCarousel";
import VideoPlayer from "./VideoPlayer";
import { formatDate } from "@/lib/text";

export default function LinkedInMockup({ post }: { post: Post }) {
  const images = post.media.filter((m) => m.kind === "image");
  const video = post.media.find((m) => m.kind === "video");

  // Auto-carousel for 2+ images, regardless of format setting
  const wantsCarousel = post.format === "carousel" || images.length > 1;
  const showCarousel = wantsCarousel && images.length > 1;
  const showSingle = !showCarousel && images.length === 1 && post.format !== "video";
  const showVideo = post.format === "video" && (video?.src || video?.link);

  return (
    <div className="mockup-card" style={{ maxWidth: 560 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          padding: "12px 16px 8px",
          gap: 10,
        }}
      >
        <Avatar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
            SIG | ORG
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>18,549 followers</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {post.publishDate ? formatDate(post.publishDate) : "2d"} ·{" "}
            <span style={{ fontSize: 11 }}>🌐</span>
          </div>
        </div>
        <div style={{ color: "#666", fontSize: 18, lineHeight: 1 }}>⋯</div>
      </div>

      {(post.copy || post.hashtags || post.mentions) && (
        <div
          style={{
            padding: "0 16px 12px",
            fontSize: 14,
            lineHeight: 1.5,
            color: "#1a1a1a",
          }}
        >
          <CopyRenderer
            copy={post.copy}
            variant="linkedin"
            extraHashtags={post.hashtags}
            extraMentions={post.mentions}
          />
          {post.ctaLink && (
            <div
              style={{
                color: "#0a66c2",
                marginTop: 6,
                wordBreak: "break-all",
                textDecoration: "underline",
              }}
            >
              {post.ctaLink}
            </div>
          )}
        </div>
      )}

      {showSingle && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={images[0].src}
          alt=""
          style={{ width: "100%", display: "block" }}
        />
      )}

      {showCarousel && <MediaCarousel images={images} />}

      {showVideo && <VideoPlayer video={video!} />}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          fontSize: 12,
          color: "#666",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <span>👍❤️🎉 142 others</span>
        <span>24 comments · 8 reposts</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          borderTop: "1px solid #f0f0f0",
          color: "#555",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {["👍 Like", "💬 Comment", "🔄 Repost", "📤 Send"].map((label) => (
          <div key={label} style={{ padding: "10px 0", textAlign: "center" }}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
