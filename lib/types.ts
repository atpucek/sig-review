export type Platform = "linkedin" | "facebook" | "instagram" | "networked";

export type PostFormat = "single" | "carousel" | "video" | "text";

export type MediaItem = {
  kind: "image" | "video";
  // Base64 data URI OR external URL
  src: string;
  // Original filename for display only
  name?: string;
  // For video: optional external link (YouTube/Vimeo)
  link?: string;
};

export type Post = {
  id: string;
  platforms: Platform[];
  format: PostFormat;
  media: MediaItem[];
  copy: string;
  publishDate: string; // YYYY-MM-DD
  hashtags: string;
  mentions: string;
  ctaLink: string;
  // Smartsheet origin (optional)
  sourceRowId?: string | null;
  sourceSheet?: "organic" | null;
  // Instagram crop ratio
  igCrop?: "1:1" | "4:5";
};

export type Preview = {
  id: string;
  title: string;
  campaign: string;
  subCampaign: string;
  preparedBy: string;
  avatarDataUrl: string | null;
  posts: Post[];
  createdAt: string;
  updatedAt: string;
};

export type PreviewSummary = {
  id: string;
  title: string;
  campaign: string;
  subCampaign: string;
  preparedBy: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
};
