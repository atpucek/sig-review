import { NextRequest } from "next/server";
import {
  cellByColId,
  fetchSheet,
  findColId,
  getToken,
  SHEETS,
} from "@/lib/smartsheet";

/**
 * Returns unique campaign names from the Marketing Calendar (Sheet 1).
 */
export async function GET(request: NextRequest) {
  const token = getToken(request);
  if (!token) {
    return Response.json({ error: "Missing API token" }, { status: 401 });
  }

  try {
    const sheet = await fetchSheet(token, SHEETS.marketingCalendar);
    const cols = sheet.columns || [];
    const campaignCol = findColId(cols, [
      "campaign",
      "campaign name",
      "initiative",
      "event",
    ]);

    if (!campaignCol) {
      const colNames = cols.map((c) => c.title).join(", ");
      return Response.json(
        {
          error: `Could not find a Campaign column. Columns: ${colNames}`,
        },
        { status: 422 }
      );
    }

    const unique = new Set<string>();
    for (const row of sheet.rows || []) {
      const val = cellByColId(row.cells || [], campaignCol);
      if (val && val.trim()) unique.add(val.trim());
    }

    const campaigns = Array.from(unique).sort((a, b) => a.localeCompare(b));
    return Response.json({ campaigns });
  } catch (e) {
    return Response.json(
      { error: (e as Error).message || "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
