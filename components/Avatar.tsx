"use client";

/**
 * SIG page avatar. Always renders /sig-knot.png cropped to a circle.
 * The stored file is the full SIG|ORG lockup — object-position:left
 * crops to show only the knot portion inside the circular mask.
 */
export default function Avatar({ size = 44 }: { size?: number }) {
  return (
    <div
      className="mockup-avatar"
      style={{ width: size, height: size, background: "#fff" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/sig-knot.png"
        alt="SIG"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "0% 50%",
        }}
      />
    </div>
  );
}
