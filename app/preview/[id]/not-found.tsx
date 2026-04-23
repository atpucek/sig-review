import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        maxWidth: 560,
        margin: "80px auto",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
          marginBottom: 8,
        }}
      >
        SIG Social Preview
      </div>
      <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Preview not found</h1>
      <p style={{ color: "var(--text-muted)", margin: "0 0 24px" }}>
        This preview has been deleted, or the link is incorrect.
      </p>
      <Link href="/" className="btn btn-primary">
        Go to dashboard
      </Link>
    </main>
  );
}
