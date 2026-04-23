import { notFound } from "next/navigation";
import { getPreview } from "@/lib/storage";
import PostMockups from "@/components/PostMockups";
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

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "40px 24px 80px",
      }}
    >
      {/* Minimal header for shareable link */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          paddingBottom: 20,
          borderBottom: "1px solid var(--border)",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: "var(--sig-red)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          SIG
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
            }}
          >
            SIG Social Preview · for approval
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, marginTop: 2 }}>
            {preview.title}
          </div>
        </div>
      </header>

      {/* Meta */}
      <div
        className="card"
        style={{
          padding: 20,
          marginBottom: 24,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        <MetaItem label="Campaign" value={preview.campaign || "—"} />
        <MetaItem label="Sub-Campaign" value={preview.subCampaign || "—"} />
        <MetaItem label="Prepared by" value={preview.preparedBy} />
        <MetaItem
          label="Created"
          value={formatDate(preview.createdAt)}
        />
        <MetaItem
          label="Posts"
          value={`${preview.posts.length} ${preview.posts.length === 1 ? "post" : "posts"}`}
        />
      </div>

      {/* Posts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {preview.posts.map((post, i) => (
          <section key={post.id}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                Post {i + 1}
              </h2>
              {post.publishDate && (
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  Publishes {formatDate(post.publishDate)}
                </span>
              )}
            </div>
            <PostMockups post={post} avatarSrc={preview.avatarDataUrl} />
          </section>
        ))}
      </div>

      <footer
        style={{
          marginTop: 56,
          paddingTop: 20,
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        This is a preview — platform mockups are approximations. Actual posts
        may render slightly differently on each network.
      </footer>
    </main>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--text-muted)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
    </div>
  );
}
