"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PreviewSummary } from "@/lib/types";
import { formatDate } from "@/lib/text";

export default function DashboardClient({
  initialPreviews,
}: {
  initialPreviews: PreviewSummary[];
}) {
  const [previews, setPreviews] = useState(initialPreviews);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const buildUrl = (id: string) => `${origin}/preview/${id}`;

  async function copyLink(id: string) {
    const url = buildUrl(id);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1800);
    } catch {
      // fallback
      window.prompt("Copy this link:", url);
    }
  }

  async function deletePreview(id: string) {
    if (!confirm("Delete this preview? The shareable link will stop working.")) {
      return;
    }
    const resp = await fetch(`/api/previews/${id}`, { method: "DELETE" });
    if (resp.ok) {
      setPreviews((list) => list.filter((p) => p.id !== id));
    } else {
      alert("Failed to delete preview.");
    }
  }

  if (previews.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: 48,
          textAlign: "center",
          color: "#71717a",
        }}
      >
        <div style={{ fontSize: 15, marginBottom: 8 }}>No previews yet.</div>
        <div style={{ fontSize: 13, marginBottom: 20 }}>
          Create your first approval preview to share with stakeholders.
        </div>
        <Link href="/new" className="btn btn-primary">
          + New Preview
        </Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <table className="previews">
        <thead>
          <tr>
            <th>Title</th>
            <th>Campaign</th>
            <th>Posts</th>
            <th>Created</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {previews.map((p) => (
            <tr key={p.id}>
              <td>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  Prepared by {p.preparedBy}
                </div>
              </td>
              <td>
                <div>{p.campaign || "—"}</div>
                {p.subCampaign && (
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                    {p.subCampaign}
                  </div>
                )}
              </td>
              <td>{p.postCount}</td>
              <td className="muted" style={{ fontSize: 13 }}>
                {formatDate(p.createdAt)}
              </td>
              <td>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className="btn"
                    onClick={() => copyLink(p.id)}
                    style={{ minWidth: 100 }}
                  >
                    {copied === p.id ? "✓ Copied" : "Copy Link"}
                  </button>
                  <Link
                    href={`/preview/${p.id}`}
                    className="btn"
                    target="_blank"
                  >
                    Preview
                  </Link>
                  <button
                    className="btn btn-danger"
                    onClick={() => deletePreview(p.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
