import { Suspense } from "react";
import NewPreviewClient from "./NewPreviewClient";

export const dynamic = "force-dynamic";

export default function NewPreviewPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading…</div>}>
      <NewPreviewClient />
    </Suspense>
  );
}
