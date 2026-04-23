import Link from "next/link";
import { listPreviews } from "@/lib/storage";
import type { PreviewSummary } from "@/lib/types";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let previews: PreviewSummary[] = [];
  let storageError: string | null = null;
  try {
    previews = await listPreviews();
  } catch (e) {
    storageError = (e as Error).message;
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Approval Previews
          </h1>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            Shareable social post previews
            {!storageError &&
              ` — ${previews.length} ${previews.length === 1 ? "preview" : "previews"}`}
          </div>
        </div>
        <Link href="/new" className="btn btn-primary">
          + New Preview
        </Link>
      </div>

      {storageError ? (
        <div
          className="card"
          style={{
            padding: 24,
            background: "#fff7ed",
            borderColor: "#fed7aa",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Storage not configured
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#7c2d12",
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            {storageError}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#9a3412",
              lineHeight: 1.6,
            }}
          >
            <strong>Quick setup:</strong>
            <ol style={{ margin: "8px 0 0 20px", padding: 0 }}>
              <li>Open your project on vercel.com</li>
              <li>
                <strong>Storage</strong> tab → <strong>Create Database</strong> →
                pick <strong>Upstash Redis</strong> (or any Redis marketplace
                option)
              </li>
              <li>
                Click <strong>Connect to Project</strong> — it auto-sets{" "}
                <code>KV_REST_API_URL</code> and <code>KV_REST_API_TOKEN</code>
              </li>
              <li>Redeploy (Deployments tab → ⋯ → Redeploy)</li>
            </ol>
          </div>
        </div>
      ) : (
        <DashboardClient initialPreviews={previews} />
      )}
    </main>
  );
}
