"use client";

import { useState } from "react";
import type { Post } from "@/lib/types";
import Avatar from "./Avatar";
import CopyRenderer from "./CopyRenderer";

export default function InstagramMockup({ post }: { post: Post }) {
  const [slide, setSlide] = useState(0);
  const images = post.media.filter((m) => m.kind === "image");
  const video = post.media.find((m) => m.kind === "video");
  const crop = post.igCrop || "1:1";
  const aspect = crop === "1:1" ? "1 / 1" : "4 / 5";

  const showCarousel = post.format === "carousel" && images.length > 1;
  const current = showCarousel ? images[slide] : images[0];

  return (
    <div className="mockup-card" style={{ maxWidth: 400 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 12px",
          gap: 10,
          borderBottom: "1px solid #efefef",
        }}
      >
        <Avatar size={34} />
        <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>SIG.ORG</div>
        <div style={{ fontSize: 18, color: "#262626", lineHeight: 1 }}>⋯</div>
      </div>

      {/* Media */}
      <div
        style={{
          position: "relative",
          background: "#000",
          aspectRatio: aspect,
          overflow: "hidden",
        }}
      >
        {post.format === "video" && (video?.src || video?.link) ? (
          video?.src ? (
            <video
              src={video.src}
              controls
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#000",
                color: "#fff",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                textAlign: "center",
              }}
            >
              (Instagram requires an uploaded video, not a link)
            </div>
          )
        ) : post.format === "text" || !current ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 12,
              background:
                "linear-gradient(135deg, #434345 0%, #0d2a52 100%)",
            }}
          >
            (Text only — Instagram requires media)
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.src}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {showCarousel && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setSlide((s) => (s - 1 + images.length) % images.length);
              }}
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                width: 28,
                height: 28,
                borderRadius: 999,
                background: "rgba(255,255,255,0.9)",
                border: "none",
                fontWeight: 700,
              }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setSlide((s) => (s + 1) % images.length);
              }}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                width: 28,
                height: 28,
                borderRadius: 999,
                background: "rgba(255,255,255,0.9)",
                border: "none",
                fontWeight: 700,
              }}
            >
              ›
            </button>
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "rgba(0,0,0,0.55)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 999,
                padding: "2px 8px",
              }}
            >
              {slide + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {/* Action bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 12px",
          gap: 14,
          fontSize: 20,
        }}
      >
        <span>♡</span>
        <span>💬</span>
        <span>➤</span>
        <span style={{ marginLeft: "auto" }}>🔖</span>
      </div>

      <div style={{ padding: "0 12px 4px", fontSize: 13, fontWeight: 600 }}>
        142 likes
      </div>

      {/* Copy */}
      {(post.copy || post.hashtags || post.mentions) && (
        <div
          style={{
            padding: "4px 12px 12px",
            fontSize: 13,
            lineHeight: 1.4,
            color: "#262626",
          }}
        >
          <span style={{ fontWeight: 600 }}>SIG.ORG</span>{" "}
          <CopyRenderer
            copy={post.copy}
            variant="instagram"
            extraHashtags={post.hashtags}
            extraMentions={post.mentions}
          />
        </div>
      )}

      {/* Bottom nav */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          borderTop: "1px solid #efefef",
          padding: "10px 0",
          fontSize: 18,
          color: "#262626",
          textAlign: "center",
        }}
      >
        <span>🏠</span>
        <span>🔍</span>
        <span>＋</span>
        <span>♡</span>
        <span>👤</span>
      </div>
    </div>
  );
}
