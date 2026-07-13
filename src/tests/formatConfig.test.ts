import { formatConfig } from "@shared/utils/formatConfig";
import {
  albumImageUrl,
  albumThumbUrl,
  paragraphsFromMarkdown,
  sectionsFromMarkdown,
  stripBasicMarkdown,
  youtubeThumbUrl,
  youtubeWatchUrl,
} from "@shared/utils/assetUrl";
import type { Config } from "@shared/types/config";
import { gitAssetBase } from "@constants/cdn";

const sampleConfig = {
  version: 1,
  CONSTS: {
    ytPList: "https://youtube.com/playlist?list=",
    ytEmbed: "https://youtube.com/embed/",
    gitAssetBase,
    spotifyPL: "https://open.spotify.com/embed/show/x",
    spotifyPLTitle: "Spotify",
  },
  primaryImgs: {
    guruji: { src: "guruji.jpg", alt: "Guruji", width: 100, ratio: 1.2 },
  },
  contactDetails: {
    location: "x",
    gmap: "x",
    phone: "x",
    email: "x",
    gmapEmbed: "x",
    gmapEmbedTitle: "x",
  },
  socialLinks: {},
  gallery: {
    albums: {
      guruji: { value: "Guruji", path: "albums/guruji/" },
    },
  },
  yt: {
    channel: "@x",
    podcast: "x",
    satsangHeaderVid: "abc123?start=1",
    playlists: [],
  },
} as Config;

describe("formatConfig", () => {
  it("prefixes primary image src and stamps keys", () => {
    const formatted = formatConfig(sampleConfig);
    expect(formatted.primaryImgs.guruji.src).toBe(`${gitAssetBase}guruji.jpg`);
    expect(formatted.primaryImgs.guruji.key).toBe("guruji");
    expect(formatted.primaryImgs.guruji.height).toBe(120);
    expect(formatted.gallery.albums.guruji.key).toBe("guruji");
    expect(formatted.primaryImgs.guruji.alt).toContain("Sadhan Sangha Ashram");
  });

  it("does not double-prefix absolute urls", () => {
    const once = formatConfig(sampleConfig);
    const twice = formatConfig(once);
    expect(twice.primaryImgs.guruji.src).toBe(`${gitAssetBase}guruji.jpg`);
  });
});

describe("assetUrl helpers", () => {
  it("builds album thumb and full urls", () => {
    expect(albumThumbUrl("albums/guruji/", "1.jpg")).toBe(
      `${gitAssetBase}albums/guruji/1t.jpg`,
    );
    expect(albumImageUrl("albums/guruji/", "1.jpg")).toBe(
      `${gitAssetBase}albums/guruji/1.jpg`,
    );
  });

  it("builds youtube urls from header vid tokens", () => {
    expect(youtubeThumbUrl("srn9_-36LBI?start=645")).toBe(
      "https://img.youtube.com/vi/srn9_-36LBI/hqdefault.jpg",
    );
    expect(youtubeWatchUrl("srn9_-36LBI?start=645")).toBe(
      "https://www.youtube.com/watch?v=srn9_-36LBI&t=645",
    );
  });

  it("strips basic markdown", () => {
    expect(stripBasicMarkdown("**Hello** [x](http://y)")).toBe("Hello x");
  });

  it("turns CDN literal \\n into paragraph breaks (matches web Md)", () => {
    const raw = "**Title**  \\n  \\nWelcome to the Ashram.";
    expect(stripBasicMarkdown(raw)).not.toContain("\\n");
    expect(paragraphsFromMarkdown(raw)).toEqual([
      "Title",
      "Welcome to the Ashram.",
    ]);
  });

  it("splits CDN bold-heading sections (Satsang / Ashram body)", () => {
    const raw =
      "**Satsangs and Teachings**    Body one.    **Path to Enlightenment**    Body two.";
    expect(sectionsFromMarkdown(raw)).toEqual([
      { heading: "Satsangs and Teachings", body: "Body one." },
      { heading: "Path to Enlightenment", body: "Body two." },
    ]);
  });
});
