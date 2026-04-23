import { notFound } from "next/navigation";
import { getPreview } from "@/lib/storage";
import PostMockups from "@/components/PostMockups";
import PostHeader from "@/components/PostHeader";
import { formatDate } from "@/lib/text";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const preview = await getPreview(id);
  if (!preview) return { title: "Preview not found" };
  return {
    title: `${preview.title} — SIG Social Preview`,
    description: preview.campaign
      ? `${preview.campaign} approval preview`
      : "SIG social approval preview",
  };
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const preview = await getPreview(id);
  if (!preview) notFound();

  const headerCampaign = preview.subCampaign || preview.campaign || "";

  return (
    <main
      style={{
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "28px 24px 80px",
        }}
      >
        {/* Minimal top wordmark — no nav */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--text-muted)",
            marginBottom: 24,
          }}
        >
          SIG | ORG
        </div>

        {/* Title block */}
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          {preview.title}
        </h1>

        {headerCampaign && (
          <div
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              marginTop: 6,
            }}
          >
            {headerCampaign}
          </div>
        )}

        <div
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            marginTop: 4,
          }}
        >
          Prepared by {preview.preparedBy} · {formatDate(preview.createdAt)}
        </div>

        <div
          style={{
            marginTop: 28,
            marginBottom: 28,
            borderTop: "1px solid var(--border)",
          }}
        />

        {/* Posts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
          {preview.posts.map((post, i) => (
            <section key={post.id}>
              <PostHeader
                index={i}
                campaign={headerCampaign}
                publishDate={post.publishDate}
              />
              <PostMockups post={post} />
            </section>
          ))}
        </div>

        <footer
          style={{
            marginTop: 64,
            paddingTop: 20,
            borderTop: "1px solid var(--border)",
            textAlign: "center",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          Platform mockups are approximations — actual posts may render slightly
          differently on each network.
        </footer>
      </div>
    </main>
  );
}
