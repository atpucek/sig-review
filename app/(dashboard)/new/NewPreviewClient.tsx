"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import PostEditor from "@/components/PostEditor";
import PostMockups from "@/components/PostMockups";
import PostHeader from "@/components/PostHeader";
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

export default function NewPreviewClient() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const router = useRouter();

  const [id, setId] = useState<string | null>(editId);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [campaign, setCampaign] = useState("");
  const [subCampaign, setSubCampaign] = useState("");
  const [preparedBy, setPreparedBy] = useState("Alyssa Pucek");
  const [posts, setPosts] = useState<Post[]>([newPost()]);

  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [smartsheetPosts, setSmartsheetPosts] = useState<OrganicPost[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(!!editId);

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

  // Load existing preview when /new?id=…
  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`/api/previews/${editId}`);
        const data = await resp.json();
        if (cancelled) return;
        if (!resp.ok) {
          setLoadError(data.error || "Failed to load preview.");
          return;
        }
        const p = data.preview as Preview;
        setId(p.id);
        setCreatedAt(p.createdAt);
        setTitle(p.title);
        setCampaign(p.campaign || "");
        setSubCampaign(p.subCampaign || "");
        setPreparedBy(p.preparedBy);
        setPosts(p.posts.length ? p.posts : [newPost()]);
      } catch (e) {
        if (!cancelled) setLoadError((e as Error).message);
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editId]);

  // Sub-campaign options
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
      const body = {
        id: id || undefined,
        createdAt: createdAt || undefined,
        title: title.trim(),
        campaign: campaign === "Other / Manual" ? "" : campaign,
        subCampaign: subCampaign === "Other / Manual" ? "" : subCampaign,
        preparedBy: preparedBy.trim() || "Alyssa Pucek",
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
      setId(data.preview.id);
      setCreatedAt(data.preview.createdAt);
      const url = `${window.location.origin}/preview/${data.preview.id}`;
      setPublishedUrl(url);
      // Reflect the id in the URL so editing continues against this preview
      router.replace(`/new?id=${data.preview.id}`);
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

  const postHeaderCampaign =
    subCampaign && subCampaign !== "Other / Manual"
      ? subCampaign
      : campaign && campaign !== "Other / Manual"
      ? campaign
      : "";

  if (loadingPreview) {
    return (
      <main
        style={{ padding: "40px", textAlign: "center", color: "#71717a" }}
      >
        Loading preview…
      </main>
    );
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
              {editId || id ? "Edit Preview" : "New Preview"}
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
            {saving
              ? "Publishing…"
              : id
              ? "Update Preview"
              : "Publish Preview"}
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
              ✓ Preview {createdAt && id && publishedUrl ? "saved" : "published"}
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
            Load error: {loadError}
          </div>
        )}

        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>
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

            <div>
              <div className="label">Prepared by</div>
              <input
                className="input"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
              />
            </div>
          </div>
        </div>

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
            <PostHeader
              index={i}
              campaign={postHeaderCampaign}
              publishDate={post.publishDate}
            />
            <PostMockups post={post} compact />
          </div>
        ))}
      </section>
    </main>
  );
}
