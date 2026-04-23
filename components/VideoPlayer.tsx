"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/lib/types";

/**
 * Renders an uploaded video file, a YouTube/Vimeo embed, or both.
 * Landscape video: full card width, natural height.
 * Portrait/vertical video: centered, max 55% card width.
 */
export default function VideoPlayer({ video }: { video: MediaItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [orientation, setOrientation] = useState<"landscape" | "portrait" | "unknown">(
    "unknown"
  );

  useEffect(() => {
    setOrientation("unknown");
  }, [video.src]);

  function handleMeta() {
    const el = videoRef.current;
    if (!el) return;
    if (el.videoWidth && el.videoHeight) {
      setOrientation(el.videoWidth >= el.videoHeight ? "landscape" : "portrait");
    }
  }

  // YouTube/Vimeo embed
  if (!video.src && video.link) {
    const embed = toEmbedUrl(video.link);
    if (embed) {
      return (
        <div
          style={{
            position: "relative",
            background: "#000",
            width: "100%",
            aspectRatio: "16 / 9",
          }}
        >
          <iframe
            src={embed}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
          />
        </div>
      );
    }
    // Fall through: show link text as placeholder
    return (
      <div
        style={{
          background: "#000",
          color: "#fff",
          padding: 20,
          textAlign: "center",
          fontSize: 13,
        }}
      >
        {video.link}
      </div>
    );
  }

  // Portrait: center, max 55% width. Landscape: full width.
  const wrapperStyle: React.CSSProperties =
    orientation === "portrait"
      ? {
          display: "flex",
          justifyContent: "center",
          background: "#000",
          padding: 0,
        }
      : { background: "#000" };

  const videoStyle: React.CSSProperties =
    orientation === "portrait"
      ? {
          maxWidth: "55%",
          width: "auto",
          height: "auto",
          display: "block",
        }
      : {
          width: "100%",
          height: "auto",
          display: "block",
        };

  return (
    <div style={wrapperStyle}>
      <video
        ref={videoRef}
        src={video.src}
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={handleMeta}
        style={videoStyle}
      />
    </div>
  );
}

function toEmbedUrl(link: string): string | null {
  try {
    const u = new URL(link);
    // YouTube
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const shortsMatch = u.pathname.match(/\/shorts\/([^/]+)/);
      if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (/^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}
