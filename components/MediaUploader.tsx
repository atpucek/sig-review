"use client";

import { useRef } from "react";
import type { MediaItem } from "@/lib/types";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB per file

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export default function MediaUploader({
  media,
  multiple,
  accept,
  onChange,
  label,
}: {
  media: MediaItem[];
  multiple?: boolean;
  accept: string;
  onChange: (next: MediaItem[]) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const incoming: MediaItem[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_BYTES) {
        alert(
          `"${file.name}" is larger than 8MB. Please use a smaller image.`
        );
        continue;
      }
      const src = await readAsDataUrl(file);
      incoming.push({
        kind: file.type.startsWith("video/") ? "video" : "image",
        src,
        name: file.name,
      });
    }
    if (incoming.length === 0) return;
    onChange(multiple ? [...media, ...incoming] : incoming);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(index: number) {
    const next = media.slice();
    next.splice(index, 1);
    onChange(next);
  }

  function move(index: number, dir: -1 | 1) {
    const next = media.slice();
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          className="btn"
          onClick={() => inputRef.current?.click()}
        >
          {media.length > 0 ? "+ Add more" : label}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {media.length > 0 && (
          <span className="muted" style={{ fontSize: 12 }}>
            {media.length} {media.length === 1 ? "file" : "files"} — max 8MB each
          </span>
        )}
      </div>

      {media.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 8,
            marginTop: 12,
          }}
        >
          {media.map((m, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                background: "#f4f4f5",
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid #e4e4e7",
              }}
            >
              {m.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.src}
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
                    width: "100%",
                    height: "100%",
                    background: "#000",
                    color: "#fff",
                    fontSize: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ▶
                </div>
              )}
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  background: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 4,
                  padding: "1px 6px",
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: "flex",
                  background: "rgba(0,0,0,0.6)",
                  fontSize: 11,
                }}
              >
                {multiple && (
                  <>
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      style={cellBtn}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === media.length - 1}
                      style={cellBtn}
                    >
                      →
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  style={{ ...cellBtn, marginLeft: "auto" }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const cellBtn: React.CSSProperties = {
  flex: 1,
  background: "transparent",
  border: "none",
  color: "#fff",
  padding: "3px 0",
  cursor: "pointer",
  fontWeight: 700,
};
