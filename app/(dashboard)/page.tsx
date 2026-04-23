import Link from "next/link";
import { listPreviews } from "@/lib/storage";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const previews = await listPreviews();
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
            Shareable social post previews — {previews.length}{" "}
            {previews.length === 1 ? "preview" : "previews"}
          </div>
        </div>
        <Link href="/new" className="btn btn-primary">
          + New Preview
        </Link>
      </div>

      <DashboardClient initialPreviews={previews} />
    </main>
  );
}
