import { NextRequest } from "next/server";
import {
  cellByColId,
  fetchSheet,
  findColId,
  getToken,
  isImageUrl,
  SHEETS,
} from "@/lib/smartsheet";

/**
 * Returns all posts from the Organic Social Calendar (Sheet 2), with
 * campaign/sub-campaign tags so the client can filter.
 */
export type OrganicPost = {
  rowId: string;
  name: string;
  campaign: string | null;
  subCampaign: string | null;
  status: string | null;
  publishDate: string | null;
  platform: string | null;
  pillar: string | null;
  copy: string | null;
  imageUrl: string | null;
  hasImage: boolean;
  link: string | null;
  creativeStatus: string | null;
  approvalStatus: string | null;
  commentCta: string | null;
  permalink: string | null;
};

export async function GET(request: NextRequest) {
  const token = getToken(request);
  if (!token) {
    return Response.json({ error: "Missing API token" }, { status: 401 });
  }

  try {
    const sheet = await fetchSheet(token, SHEETS.organicSocial);
    const cols = sheet.columns || [];

    const ci = {
      campaign: findColId(cols, ["main campaign", "campaign", "event"]),
      subcampaign: findColId(cols, [
        "sub-campaign",
        "sub campaign",
        "subcampaign",
        "sub_campaign",
      ]),
      name: findColId(cols, [
        "content / post name",
        "content/post name",
        "content / post",
        "content/post",
        "post name",
        "post title",
        "content",
        "title",
        "name",
      ]),
      status: (() => {
        const postStatus = cols.find(
          (c) => c.title.toLowerCase() === "post status"
        );
        if (postStatus) return String(postStatus.id);
        const plain = cols.find((c) => c.title.toLowerCase() === "status");
        if (plain) return String(plain.id);
        return null;
      })(),
      date: findColId(cols, ["publish date", "date"]),
      platform: findColId(cols, ["platform"]),
      pillar: findColId(cols, ["content pillar", "pillar"]),
      copy: findColId(cols, ["main copy", "copy"]),
      image: findColId(cols, [
        "graphic preview",
        "graphic",
        "creative",
        "preview",
        "image",
      ]),
      link: findColId(cols, ["live post link", "post link", "link", "url"]),
      creativeStatus: findColId(cols, ["creative status"]),
      approvalStatus: findColId(cols, ["approval status", "approval"]),
      commentCta: findColId(cols, ["comment cta", "cta"]),
    };

    const posts: OrganicPost[] = [];
    for (const row of sheet.rows || []) {
      const cells = row.cells || [];
      const campaign = cellByColId(cells, ci.campaign);
      const subCampaign = cellByColId(cells, ci.subcampaign);
      if (!campaign && !subCampaign) continue;

      const imageUrl = cellByColId(cells, ci.image);
      posts.push({
        rowId: String(row.id),
        name: cellByColId(cells, ci.name) || "Untitled post",
        campaign,
        subCampaign,
        status: cellByColId(cells, ci.status),
        publishDate: cellByColId(cells, ci.date),
        platform: cellByColId(cells, ci.platform),
        pillar: cellByColId(cells, ci.pillar),
        copy: cellByColId(cells, ci.copy),
        imageUrl: isImageUrl(imageUrl) ? imageUrl : null,
        hasImage: !!imageUrl,
        link: cellByColId(cells, ci.link),
        creativeStatus: cellByColId(cells, ci.creativeStatus),
        approvalStatus: cellByColId(cells, ci.approvalStatus),
        commentCta: cellByColId(cells, ci.commentCta),
        permalink: row.permalink || null,
      });
    }

    // Sort by publish date descending (most recent first); undated rows last
    posts.sort((a, b) => {
      if (!a.publishDate && !b.publishDate) return 0;
      if (!a.publishDate) return 1;
      if (!b.publishDate) return -1;
      return b.publishDate.localeCompare(a.publishDate);
    });

    return Response.json({ posts });
  } catch (e) {
    return Response.json(
      { error: (e as Error).message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
