"use client";

export default function Avatar({
  src,
  size = 44,
  label = "SIG",
}: {
  src: string | null;
  size?: number;
  label?: string;
}) {
  return (
    <div
      className="mockup-avatar"
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.28) }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" />
      ) : (
        label
      )}
    </div>
  );
}
