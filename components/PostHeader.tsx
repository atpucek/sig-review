import { formatDate } from "@/lib/text";

/**
 * Header shown above each post's platform mockups, both in the builder
 * preview panel and in the published shareable view.
 *
 * Layout: "POST 1        Event/Campaign        Publishes: Date"
 */
export default function PostHeader({
  index,
  campaign,
  publishDate,
}: {
  index: number;
  campaign: string;
  publishDate: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "4px 0 10px",
        borderBottom: "1px solid var(--border)",
        marginBottom: 12,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--text-muted)",
      }}
    >
      <span>Post {index + 1}</span>
      <span
        style={{
          flex: 1,
          textAlign: "center",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "none",
          fontSize: 12,
          color: "var(--text)",
        }}
      >
        {campaign || ""}
      </span>
      <span style={{ textAlign: "right", minWidth: 120 }}>
        {publishDate ? `Publishes: ${formatDate(publishDate)}` : ""}
      </span>
    </div>
  );
}
