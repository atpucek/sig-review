"use client";

import type { Platform, Post } from "@/lib/types";
import LinkedInMockup from "./LinkedInMockup";
import FacebookMockup from "./FacebookMockup";
import InstagramMockup from "./InstagramMockup";
import NetworkedMockup from "./NetworkedMockup";

const LABELS: Record<Platform, string> = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  networked: "Networked",
};

export default function PostMockups({
  post,
  compact = false,
}: {
  post: Post;
  compact?: boolean;
}) {
  const platforms = post.platforms;
  if (platforms.length === 0) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          color: "#71717a",
          border: "1px dashed #d4d4d8",
          borderRadius: 12,
          background: "#fafafa",
        }}
      >
        Select at least one platform to see the mockup.
      </div>
    );
  }

  const gap = compact ? 14 : 20;
  const minCol = compact && platforms.length > 1 ? 280 : 360;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCol}px, 1fr))`,
        gap,
        alignItems: "flex-start",
      }}
    >
      {platforms.map((p) => (
        <div key={p} className="mockup-col">
          <div className="mockup-col-label">{LABELS[p]}</div>
          {renderFor(p, post)}
        </div>
      ))}
    </div>
  );
}

function renderFor(platform: Platform, post: Post) {
  switch (platform) {
    case "linkedin":
      return <LinkedInMockup post={post} />;
    case "facebook":
      return <FacebookMockup post={post} />;
    case "instagram":
      return <InstagramMockup post={post} />;
    case "networked":
      return <NetworkedMockup post={post} />;
  }
}
