"use client";

import { useState } from "react";
import type { Post } from "@/lib/types";
import Avatar from "./Avatar";
import CopyRenderer from "./CopyRenderer";
import { formatDate } from "@/lib/text";

export default function LinkedInMockup({
  post,
  avatarSrc,
}: {
  post: Post;
  avatarSrc: string | null;
}) {
  const [slide, setSlide] = useState(0);
  const images = post.media.filter((m) => m.kind === "image");
  const video = post.media.find((m) => m.kind === "video");
  const showCarousel = post.format === "carousel" && images.length > 1;
  const showSingle = post.format === "single" && images.length > 0;
  const showVideo = post.format === "video" && (video || images[0]);

  return (
    <div className="mockup-card" style={{ maxWidth: 560 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          padding: "12px 16px 8px",
          gap: 10,
        }}
      >
        <Avatar src={avatarSrc} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
            SIG|ORG
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>18,549 followers</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {post.publishDate ? formatDate(post.publishDate) : "2d"} ·{" "}
            <span style={{ fontSize: 11 }}>🌐</span>
          </div>
        </div>
        <div style={{ color: "#666", fontSize: 18, lineHeight: 1 }}>⋯</div>
      </div>

      {/* Copy */}
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
            <div style={{ color: "#0a66c2", marginTop: 6, wordBreak: "break-all" }}>
              {post.ctaLink}
            </div>
          )}
        </div>
      )}

      {/* Media */}
      {showSingle && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={images[0].src}
          alt=""
          style={{ width: "100%", display: "block" }}
        />
      )}

      {showCarousel && (
        <div style={{ position: "relative", background: "#000" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[slide].src}
            alt=""
            style={{
              width: "100%",
              display: "block",
              maxHeight: 560,
              objectFit: "contain",
            }}
          />
          <button
            type="button"
            aria-label="prev"
            onClick={(e) => {
              e.preventDefault();
              setSlide((s) => (s - 1 + images.length) % images.length);
            }}
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "rgba(255,255,255,0.85)",
              border: "none",
              fontWeight: 700,
            }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="next"
            onClick={(e) => {
              e.preventDefault();
              setSlide((s) => (s + 1) % images.length);
            }}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "rgba(255,255,255,0.85)",
              border: "none",
              fontWeight: 700,
            }}
          >
            ›
          </button>
          <div
            style={{
              position: "absolute",
              left: 10,
              bottom: 10,
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 999,
              padding: "3px 8px",
            }}
          >
            {slide + 1} / {images.length}
          </div>
        </div>
      )}

      {showVideo && (
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
          ) : images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[0].src}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#fff",
              }}
            >
              ▶
            </div>
          )}
        </div>
      )}

      {/* Engagement */}
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

      {/* Action bar */}
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
          <div
            key={label}
            style={{
              padding: "10px 0",
              textAlign: "center",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
