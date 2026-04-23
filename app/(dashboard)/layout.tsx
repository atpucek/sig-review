import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="app-header">
        <Link
          href="/"
          className="app-header-brand"
          style={{ textDecoration: "none", color: "#fff" }}
        >
          <span className="app-header-brand-logo">SIG</span>
          <span>SIG Social Preview</span>
        </Link>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Approval previews for organic &amp; campaign posts
        </div>
      </header>
      {children}
    </>
  );
}
