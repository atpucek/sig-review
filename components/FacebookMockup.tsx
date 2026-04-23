"use client";

import type { Post } from "@/lib/types";
import Avatar from "./Avatar";
import CopyRenderer from "./CopyRenderer";
import { formatDate } from "@/lib/text";

export default function FacebookMockup({
  post,
  avatarSrc,
}: {
  post: Post;
  avatarSrc: string | null;
}) {
  const images = post.media.filter((m) => m.kind === "image");
  const video = post.media.find((m) => m.kind === "video");

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
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
            SIG
          </div>
          <div style={{ fontSize: 12, color: "#65676b" }}>
            Published by Agorapulse ·{" "}
            {post.publishDate ? formatDate(post.publishDate) : "Just now"} ·{" "}
            <span>🌐</span>
          </div>
        </div>
        <div style={{ color: "#65676b", fontSize: 18, lineHeight: 1 }}>⋯</div>
      </div>

      {/* Copy */}
      {(post.copy || post.hashtags || post.mentions) && (
        <div
          style={{
            padding: "0 16px 12px",
            fontSize: 15,
            lineHeight: 1.45,
            color: "#050505",
          }}
        >
          <CopyRenderer
            copy={post.copy}
            variant="facebook"
            extraHashtags={post.hashtags}
            extraMentions={post.mentions}
          />
          {post.ctaLink && (
            <div
              style={{
                color: "#1877f2",
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
      {post.format === "single" && images.length === 1 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={images[0].src}
          alt=""
          style={{ width: "100%", display: "block" }}
        />
      )}

      {(post.format === "carousel" || (post.format === "single" && images.length > 1)) &&
        images.length > 0 && <FacebookGrid images={images.map((i) => i.src)} />}

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
          padding: "8px 16px",
          fontSize: 12,
          color: "#65676b",
        }}
      >
        <span>👍❤️ 142</span>
        <span>24 comments · 8 shares</span>
      </div>

      {/* Action bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          borderTop: "1px solid #ced0d4",
          color: "#65676b",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {["👍 Like", "💬 Comment", "↗ Share"].map((label) => (
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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 16px",
          borderTop: "1px solid #ced0d4",
          fontSize: 12,
          color: "#65676b",
        }}
      >
        <span>See insights and ads</span>
        <span
          style={{
            fontWeight: 600,
            color: "#1877f2",
            padding: "3px 10px",
            border: "1px solid #1877f2",
            borderRadius: 6,
          }}
        >
          Boost post
        </span>
      </div>
    </div>
  );
}

function FacebookGrid({ images }: { images: string[] }) {
  const count = images.length;
  if (count === 0) return null;

  // 1 image
  if (count === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={images[0]} alt="" style={{ width: "100%", display: "block" }} />
    );
  }

  // 2 images: side by side
  if (count === 2) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        {images.map((src, i) => (
          <FbCell key={i} src={src} index={i} />
        ))}
      </div>
    );
  }

  // 3 images: 1 large left, 2 stacked right
  if (count === 3) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 2,
          height: 360,
        }}
      >
        <FbCell src={images[0]} index={0} fill />
        <div
          style={{
            display: "grid",
            gridTemplateRows: "1fr 1fr",
            gap: 2,
          }}
        >
          <FbCell src={images[1]} index={1} fill />
          <FbCell src={images[2]} index={2} fill />
        </div>
      </div>
    );
  }

  // 4 images: 2x2
  if (count === 4) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 2,
          height: 360,
        }}
      >
        {images.map((src, i) => (
          <FbCell key={i} src={src} index={i} fill />
        ))}
      </div>
    );
  }

  // 5+: top 2 large + 3 bottom with +N on last
  const extra = count - 5;
  const shown = images.slice(0, 5);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "1fr 1fr",
        gap: 2,
        height: 360,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <FbCell src={shown[0]} index={0} fill />
        <FbCell src={shown[1]} index={1} fill />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 2,
        }}
      >
        <FbCell src={shown[2]} index={2} fill />
        <FbCell src={shown[3]} index={3} fill />
        <FbCell
          src={shown[4]}
          index={4}
          fill
          overlay={extra > 0 ? `+${extra}` : undefined}
        />
      </div>
    </div>
  );
}

function FbCell({
  src,
  index,
  fill,
  overlay,
}: {
  src: string;
  index: number;
  fill?: boolean;
  overlay?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        height: fill ? "100%" : undefined,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        style={{
          width: "100%",
          height: fill ? "100%" : "auto",
          objectFit: "cover",
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 6,
          left: 6,
          background: "rgba(255,255,255,0.9)",
          color: "#050505",
          fontSize: 10,
          fontWeight: 700,
          padding: "2px 6px",
          borderRadius: 4,
        }}
      >
        {index + 1}
      </div>
      {overlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {overlay}
        </div>
      )}
    </div>
  );
}
