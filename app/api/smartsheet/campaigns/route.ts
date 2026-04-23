import { NextRequest } from "next/server";
import {
  cellByColId,
  fetchSheet,
  findColId,
  getToken,
  SHEETS,
} from "@/lib/smartsheet";

/**
 * Returns unique Campaign + Sub-Campaign values from the 2026 Organic Social
 * Calendar (Sheet 2). These power the builder's dropdowns — the same sheet
 * also sources the posts themselves, so filtering lines up cleanly.
 */
export async function GET(request: NextRequest) {
  const token = getToken(request);
  if (!token) {
    return Response.json({ error: "Missing API token" }, { status: 401 });
  }

  try {
    const sheet = await fetchSheet(token, SHEETS.organicSocial);
    const cols = sheet.columns || [];
    const campaignCol = findColId(cols, [
      "main campaign",
      "campaign",
      "event",
    ]);
    const subCampaignCol = findColId(cols, [
      "sub-campaign",
      "sub campaign",
      "subcampaign",
    ]);

    if (!campaignCol) {
      const colNames = cols.map((c) => c.title).join(", ");
      return Response.json(
        {
          error: `Could not find a Campaign column in the Organic Social Calendar. Columns: ${colNames}`,
        },
        { status: 422 }
      );
    }

    // Build a map: campaign -> Set(subcampaigns)
    const map = new Map<string, Set<string>>();
    for (const row of sheet.rows || []) {
      const cells = row.cells || [];
      const camp = cellByColId(cells, campaignCol);
      const sub = cellByColId(cells, subCampaignCol);
      if (!camp || !camp.trim()) continue;
      const trimmed = camp.trim();
      if (!map.has(trimmed)) map.set(trimmed, new Set());
      if (sub && sub.trim()) map.get(trimmed)!.add(sub.trim());
    }

    const campaigns = Array.from(map.keys()).sort((a, b) =>
      a.localeCompare(b)
    );
    const subCampaignsByCampaign: Record<string, string[]> = {};
    for (const [c, subs] of map.entries()) {
      subCampaignsByCampaign[c] = Array.from(subs).sort((a, b) =>
        a.localeCompare(b)
      );
    }

    return Response.json({ campaigns, subCampaignsByCampaign });
  } catch (e) {
    return Response.json(
      { error: (e as Error).message || "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
