"use client";

import { useEffect, useState } from "react";

/**
 * Generic natural-aspect carousel.
 * - One image at a time, full card width, natural aspect ratio.
 * - Overlaid prev/next arrow buttons (semi-transparent dark circles).
 * - "N / Total" counter pill in bottom-left.
 * - Subtle slide-number watermark in bottom-right.
 * - Arrows disabled at edges.
 */
export default function MediaCarousel({
  images,
}: {
  images: { src: string }[];
}) {
  const [slide, setSlide] = useState(0);

  // Clamp slide if image list shrinks
  useEffect(() => {
    if (slide >= images.length) setSlide(Math.max(0, images.length - 1));
  }, [images.length, slide]);

  if (images.length === 0) return null;

  const canPrev = slide > 0;
  const canNext = slide < images.length - 1;

  return (
    <div style={{ position: "relative", background: "#000" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[slide].src}
        alt=""
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />

      <button
        type="button"
        aria-label="Previous slide"
        onClick={(e) => {
          e.preventDefault();
          if (canPrev) setSlide((s) => s - 1);
        }}
        disabled={!canPrev}
        style={{
          ...arrowBtn,
          left: 12,
          opacity: canPrev ? 1 : 0.3,
          cursor: canPrev ? "pointer" : "default",
        }}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={(e) => {
          e.preventDefault();
          if (canNext) setSlide((s) => s + 1);
        }}
        disabled={!canNext}
        style={{
          ...arrowBtn,
          right: 12,
          opacity: canNext ? 1 : 0.3,
          cursor: canNext ? "pointer" : "default",
        }}
      >
        ›
      </button>

      {/* Counter pill, bottom-left */}
      <div
        style={{
          position: "absolute",
          left: 12,
          bottom: 12,
          background: "rgba(0,0,0,0.65)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          padding: "4px 10px",
          borderRadius: 999,
          lineHeight: 1,
        }}
      >
        {slide + 1} / {images.length}
      </div>

      {/* Subtle slide watermark, bottom-right */}
      <div
        style={{
          position: "absolute",
          right: 12,
          bottom: 12,
          color: "rgba(255,255,255,0.6)",
          fontSize: 12,
          fontWeight: 500,
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          lineHeight: 1,
        }}
      >
        {slide + 1}
      </div>
    </div>
  );
}

const arrowBtn: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 36,
  height: 36,
  borderRadius: 999,
  background: "rgba(0,0,0,0.55)",
  color: "#fff",
  border: "none",
  fontWeight: 700,
  fontSize: 20,
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};
