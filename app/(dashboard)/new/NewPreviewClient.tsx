"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PostEditor from "@/components/PostEditor";
import PostMockups from "@/components/PostMockups";
import type { Post, Preview } from "@/lib/types";
import type { OrganicPost } from "@/app/api/smartsheet/posts/route";

function newPost(): Post {
  return {
    id: Math.random().toString(36).slice(2, 10),
    platforms: ["linkedin"],
    format: "single",
    media: [],
    copy: "",
    publishDate: "",
    hashtags: "",
    mentions: "",
    ctaLink: "",
    sourceRowId: null,
    sourceSheet: null,
    igCrop: "1:1",
  };
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}

export default function NewPreviewClient() {
  const [title, setTitle] = useState("");
  const [campaign, setCampaign] = useState("");
  const [subCampaign, setSubCampaign] = useState("");
  const [preparedBy, setPreparedBy] = useState("Alyssa Pucek");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([newPost()]);

  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [smartsheetPosts, setSmartsheetPosts] = useState<OrganicPost[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Load Smartsheet data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [campResp, postsResp] = await Promise.all([
          fetch("/api/smartsheet/campaigns"),
          fetch("/api/smartsheet/posts"),
        ]);
        const camp = await campResp.json();
        const ps = await postsResp.json();
        if (cancelled) return;
        if (!campResp.ok) {
          setLoadError(camp.error || "Failed to load campaigns.");
        } else {
          setCampaigns(camp.campaigns || []);
        }
        if (postsResp.ok) setSmartsheetPosts(ps.posts || []);
      } catch (e) {
        if (!cancelled) setLoadError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sub-campaign options: derive from loaded Smartsheet posts, scoped to selected campaign
  const subCampaignOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of smartsheetPosts) {
      if (!p.subCampaign) continue;
      if (
        !campaign ||
        campaign === "Other / Manual" ||
        (p.campaign || "").toLowerCase() === campaign.toLowerCase()
      ) {
        set.add(p.subCampaign.trim());
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [smartsheetPosts, campaign]);

  function updatePost(index: number, next: Post) {
    setPosts((arr) => arr.map((p, i) => (i === index ? next : p)));
  }

  function addPost() {
    setPosts((arr) => [...arr, newPost()]);
  }

  function removePost(index: number) {
    setPosts((arr) => arr.filter((_, i) => i !== index));
  }

  function movePost(index: number, dir: -1 | 1) {
    setPosts((arr) => {
      const target = index + dir;
      if (target < 0 || target >= arr.length) return arr;
      const next = arr.slice();
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleAvatar(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      alert("Avatar must be under 4MB.");
      return;
    }
    const src = await readAsDataUrl(file);
    setAvatarDataUrl(src);
  }

  async function publish() {
    if (!title.trim()) {
      alert("Please enter a preview title.");
      return;
    }
    if (posts.length === 0) {
      alert("Add at least one post.");
      return;
    }
    setSaving(true);
    try {
      const body: Omit<Preview, "id" | "createdAt" | "updatedAt"> & {
        id?: string;
      } = {
        title: title.trim(),
        campaign: campaign === "Other / Manual" ? "" : campaign,
        subCampaign: subCampaign === "Other / Manual" ? "" : subCampaign,
        preparedBy: preparedBy.trim() || "Alyssa Pucek",
        avatarDataUrl,
        posts,
      };
      const resp = await fetch("/api/previews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Failed to save.");
      }
      const url = `${window.location.origin}/preview/${data.preview.id}`;
      setPublishedUrl(url);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function copyPublishedLink() {
    if (!publishedUrl) return;
    try {
      await navigator.clipboard.writeText(publishedUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      window.prompt("Copy link:", publishedUrl);
    }
  }

  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(400px, 1fr) minmax(400px, 1.1fr)",
        gap: 20,
        padding: 20,
        height: "calc(100vh - 60px)",
        overflow: "hidden",
      }}
    >
      {/* LEFT: Builder */}
      <section
        style={{
          overflowY: "auto",
          paddingRight: 4,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              New Preview
            </div>
            <Link
              href="/"
              className="muted"
              style={{ fontSize: 12, textDecoration: "none" }}
            >
              ← Back to dashboard
            </Link>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving}
            onClick={publish}
          >
            {saving ? "Publishing…" : "Publish Preview"}
          </button>
        </div>

        {publishedUrl && (
          <div
            className="card"
            style={{
              padding: 14,
              background: "#f0fdf4",
              borderColor: "#bbf7d0",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              ✓ Preview published
            </div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
              Anyone with this link can view — no login required.
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                className="input"
                readOnly
                value={publishedUrl}
                style={{ fontSize: 12, flex: 1 }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button className="btn" onClick={copyPublishedLink}>
                {linkCopied ? "✓ Copied" : "Copy"}
              </button>
              <a
                className="btn"
                href={publishedUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open
              </a>
            </div>
          </div>
        )}

        {loadError && (
          <div
            className="card"
            style={{
              padding: 12,
              background: "#fef2f2",
              borderColor: "#fecaca",
              fontSize: 13,
            }}
          >
            Smartsheet load error: {loadError}
          </div>
        )}

        {/* Document info */}
        <div className="card" style={{ padding: 18 }}>
          <div
            style={{
              fontWeight: 700,
              marginBottom: 14,
              fontSize: 14,
            }}
          >
            Document info
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div className="label">Preview Title</div>
              <input
                className="input"
                placeholder="e.g. Executive Retreat Week 2 Posts"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <div className="label">Campaign</div>
                <select
                  className="select"
                  value={campaign}
                  onChange={(e) => {
                    setCampaign(e.target.value);
                    setSubCampaign("");
                  }}
                  disabled={loading}
                >
                  <option value="">
                    {loading ? "Loading…" : "— Select campaign —"}
                  </option>
                  {campaigns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Other / Manual">Other / Manual</option>
                </select>
              </div>
              <div>
                <div className="label">Sub-Campaign</div>
                <select
                  className="select"
                  value={subCampaign}
                  onChange={(e) => setSubCampaign(e.target.value)}
                  disabled={loading}
                >
                  <option value="">— Select sub-campaign —</option>
                  {subCampaignOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Other / Manual">Other / Manual</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <div className="label">Prepared by</div>
                <input
                  className="input"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                />
              </div>
              <div>
                <div className="label">Page avatar</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 999,
                      overflow: "hidden",
                      background: "var(--sig-red)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {avatarDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarDataUrl}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      "SIG"
                    )}
                  </div>
                  <label className="btn" style={{ cursor: "pointer" }}>
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) =>
                        e.target.files?.[0] && handleAvatar(e.target.files[0])
                      }
                    />
                  </label>
                  {avatarDataUrl && (
                    <button
                      className="btn btn-ghost"
                      onClick={() => setAvatarDataUrl(null)}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {posts.map((post, i) => (
            <PostEditor
              key={post.id}
              post={post}
              index={i}
              onChange={(next) => updatePost(i, next)}
              onRemove={() => removePost(i)}
              onMove={(dir) => movePost(i, dir)}
              smartsheetPosts={smartsheetPosts}
              sheetCampaign={campaign}
              sheetSubCampaign={subCampaign}
              isFirst={i === 0}
              isLast={i === posts.length - 1}
            />
          ))}
          <button type="button" className="btn" onClick={addPost}>
            + Add Another Post
          </button>
        </div>
      </section>

      {/* RIGHT: Live mockup panel */}
      <section
        style={{
          overflowY: "auto",
          background: "#fafafa",
          borderRadius: 12,
          border: "1px solid var(--border)",
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: -18,
            background: "#fafafa",
            padding: "18px 0 8px",
            marginTop: -18,
            borderBottom: "1px solid var(--border)",
            zIndex: 1,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14 }}>Live preview</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </div>
        </div>

        {posts.map((post, i) => (
          <div key={post.id}>
            <div
              className="muted"
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              Post {i + 1}
              {post.publishDate ? ` · ${post.publishDate}` : ""}
            </div>
            <PostMockups post={post} avatarSrc={avatarDataUrl} compact />
          </div>
        ))}
      </section>
    </main>
  );
}
