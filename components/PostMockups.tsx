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

/**
 * Renders all selected platform mockups side by side for a single post.
 * On narrow screens, they wrap.
 */
export default function PostMockups({
  post,
  avatarSrc,
  compact = false,
}: {
  post: Post;
  avatarSrc: string | null;
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

  // When compact (builder panel with many platforms), limit column width
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
          {renderFor(p, post, avatarSrc)}
        </div>
      ))}
    </div>
  );
}

function renderFor(platform: Platform, post: Post, avatarSrc: string | null) {
  switch (platform) {
    case "linkedin":
      return <LinkedInMockup post={post} avatarSrc={avatarSrc} />;
    case "facebook":
      return <FacebookMockup post={post} avatarSrc={avatarSrc} />;
    case "instagram":
      return <InstagramMockup post={post} avatarSrc={avatarSrc} />;
    case "networked":
      return <NetworkedMockup post={post} avatarSrc={avatarSrc} />;
  }
}
