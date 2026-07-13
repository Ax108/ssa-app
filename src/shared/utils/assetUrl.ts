import { gitAssetBase } from "@constants/cdn";

/** Full album image URL: `{assetBase}{path}{filename}` */
export const albumImageUrl = (path: string, filename: string): string =>
  `${gitAssetBase}${path}${filename}`;

/**
 * Thumbnail URL matching web GitImageViewer:
 * `{assetBase}{path}{nameWithoutExt}t.{ext}`
 */
export const albumThumbUrl = (path: string, filename: string): string => {
  const dot = filename.lastIndexOf(".");
  if (dot <= 0) {
    return albumImageUrl(path, filename);
  }
  const name = filename.slice(0, dot);
  const ext = filename.slice(dot + 1);
  return `${gitAssetBase}${path}${name}t.${ext}`;
};

/** YouTube thumbnail from video id (strip query like `?start=`). */
export const youtubeThumbUrl = (videoIdOrEmbed: string): string => {
  const id = videoIdOrEmbed.split("?")[0]?.split("/").pop() ?? videoIdOrEmbed;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
};

/** Watch URL from `satsangHeaderVid` (supports `id?start=645`). */
export const youtubeWatchUrl = (videoIdOrEmbed: string): string => {
  const [idPart, query = ""] = videoIdOrEmbed.split("?");
  const id = idPart ?? videoIdOrEmbed;
  const params = new URLSearchParams(query);
  const start = params.get("start");
  const base = `https://www.youtube.com/watch?v=${id}`;
  return start ? `${base}&t=${start}` : base;
};

export const youtubePlaylistUrl = (base: string, listId: string): string =>
  `${base}${listId}`;

/** Light markdown strip for short teasers (v1 — no markdown renderer). */
export const stripBasicMarkdown = (md: string): string =>
  md
    // CDN / gist copy stores paragraph breaks as literal `\n` (web `Md` does the same).
    .replace(/\\n/g, "\n")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[*_#>`]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const paragraphsFromMarkdown = (md: string): string[] =>
  stripBasicMarkdown(md)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);

export type MarkdownSection = {
  heading: string | null;
  body: string;
};

/**
 * CDN long-form copy often uses `**Heading**    body    **Next**    …`
 * (multi-space runs, not always blank lines). Split into heading + body for screens.
 */
export const sectionsFromMarkdown = (md: string): MarkdownSection[] => {
  const normalized = md.replace(/\\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const headingRe = /\*\*([^*]+)\*\*/g;
  const headings: { title: string; end: number; index: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(normalized)) !== null) {
    headings.push({
      title: match[1]?.trim() ?? "",
      index: match.index,
      end: match.index + match[0].length,
    });
  }

  const tidy = (raw: string): string =>
    stripBasicMarkdown(raw)
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n+/g, " ")
      .trim();

  if (headings.length === 0) {
    const body = tidy(normalized);
    return body ? [{ heading: null, body }] : [];
  }

  const sections: MarkdownSection[] = [];
  const first = headings[0];
  if (first && first.index > 0) {
    const preamble = tidy(normalized.slice(0, first.index));
    if (preamble) {
      sections.push({ heading: null, body: preamble });
    }
  }

  for (let i = 0; i < headings.length; i++) {
    const current = headings[i];
    if (!current) {
      continue;
    }
    const next = headings[i + 1];
    const body = tidy(
      normalized.slice(current.end, next ? next.index : normalized.length),
    );
    if (current.title || body) {
      sections.push({ heading: current.title || null, body });
    }
  }

  return sections;
};
