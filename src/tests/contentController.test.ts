import { oxyApi } from "@shared/serviceCalls/oxyApi";
import { loadStateBulk, saveStateBulk } from "@shared/helpers/asyncStorage";
import { contentController } from "@store/contentController";
import { appStore } from "@store/appStore";
import { GIST, GIT, LOCALSTORE, siteTitle } from "@constants/cdn";
import type { Config } from "@shared/types/config";
import type { Texts } from "@shared/types/texts";
import type { VersionResponse } from "@shared/types/api";

jest.mock("@shared/serviceCalls/oxyApi", () => ({
  oxyApi: {
    getGist: jest.fn(),
    getGit: jest.fn(),
  },
}));

jest.mock("@shared/helpers/asyncStorage", () => ({
  loadStateBulk: jest.fn(),
  saveStateBulk: jest.fn(),
}));

const makeConfig = (version = 1): Config => ({
  version,
  CONSTS: {
    ytPList: "",
    ytEmbed: "",
    gitAssetBase: "https://cdn/",
    spotifyPL: "",
    spotifyPLTitle: "",
  },
  primaryImgs: {
    guruji: {
      src: "guruji.jpg",
      alt: "Guruji",
      width: 200,
      ratio: 1.5,
    },
  },
  contactDetails: {
    location: "",
    gmap: "",
    phone: "",
    email: "",
    gmapEmbed: "",
    gmapEmbedTitle: "",
  },
  socialLinks: {},
  gallery: {
    albums: { ashram: { value: "Ashram", path: "ashram/" } },
  },
  yt: {
    channel: "",
    podcast: "",
    satsangHeaderVid: "",
    playlists: [],
  },
});

const makeTexts = (): Texts => ({
  version: 1,
  headers: {
    title: "Sadhan Sangha Ashram",
    shortTitle: "",
    menuTitle: "",
    guruji: "",
    boroGuruji: "",
    mataji: "",
    ashram: "",
    satsang: "",
    gallery: "",
    contact: "",
    followUs: "",
    navigate: "",
    reachUs: "",
    downloadApp: "",
    readMore: "",
    albumSelect: "",
    listenYT: "",
    listenSP: "",
    follow: "",
    subscribe: "",
    dailySatsang: "",
    alsoAvailableAt: "",
  },
  pages: {
    home: "Home",
    ashram: "Ashram",
    satsang: "Satsang",
    gallery: "Gallery",
    contact: "Contact",
  },
  footer: {
    privacy: "",
    dev: "",
    devName: "",
    devLink: "",
    startYear: 2005,
    cc: "",
  },
  socialNames: {},
  ashramShort: "",
  satsangShort: "",
  ashram: "Ashram body",
  satsang: "Satsang body",
  gallery: "Gallery body",
});

beforeEach(() => {
  appStore.setState({
    loaded: false,
    version: null,
    config: null,
    texts: null,
  });
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("contentController.init", () => {
  it("triggers loadVersion when storage is empty", async () => {
    jest.mocked(loadStateBulk).mockResolvedValue({});
    const loadVersion = jest
      .spyOn(contentController, "loadVersion")
      .mockResolvedValue({ status: "stub", version: 1 });

    const result = await contentController.init();

    expect(loadVersion).toHaveBeenCalledTimes(1);
    expect(appStore.getState().loaded).toBe(false);
    expect(result.status).toContain("Local Storage Empty");
  });

  it("hydrates from storage then awaits version sync", async () => {
    jest.mocked(loadStateBulk).mockResolvedValue({
      [LOCALSTORE.config]: makeConfig(1),
      [LOCALSTORE.en]: makeTexts(),
    });
    const syncVersion = jest
      .spyOn(contentController, "syncVersion")
      .mockResolvedValue({ status: "stub", version: 1 });

    const result = await contentController.init();

    const state = appStore.getState();
    expect(state.loaded).toBe(true);
    expect(state.version).toBe(1);
    expect(state.config?.primaryImgs.guruji.src).toBe("https://cdn/guruji.jpg");
    expect(syncVersion).toHaveBeenCalledTimes(1);
    expect(result.status).toContain("Loaded from Local Storage");
  });
});

describe("contentController.loadVersion", () => {
  it("fetches version + config + texts, persists, and formats config", async () => {
    jest.mocked(oxyApi.getGist).mockResolvedValue({
      version: 7,
    } satisfies VersionResponse);
    jest.mocked(oxyApi.getGit).mockImplementation((path: string) => {
      if (path === GIT.config) return Promise.resolve(makeConfig(1));
      if (path === GIT.english) return Promise.resolve(makeTexts());
      return Promise.resolve({});
    });

    const result = await contentController.loadVersion();

    expect(oxyApi.getGist).toHaveBeenCalledWith(GIST.version);
    expect(saveStateBulk).toHaveBeenCalledTimes(1);
    const saved = jest.mocked(saveStateBulk).mock.calls[0]?.[0];
    expect((saved?.[LOCALSTORE.config] as Config).version).toBe(7);

    const state = appStore.getState();
    expect(state.version).toBe(7);
    expect(state.loaded).toBe(true);

    const guruji = state.config!.primaryImgs.guruji;
    expect(guruji.key).toBe("guruji");
    expect(guruji.src).toBe("https://cdn/guruji.jpg");
    expect(guruji.height).toBe(300);
    expect(guruji.alt).toBe(`Guruji - ${siteTitle}`);
    expect(state.config!.gallery.albums.ashram.key).toBe("ashram");
    expect(result).toEqual({ status: "Loaded Version", version: 7 });
  });

  it("falls back to seed when CDN fails and storage is empty", async () => {
    jest.mocked(oxyApi.getGist).mockRejectedValue(new Error("offline"));
    jest.mocked(loadStateBulk).mockResolvedValue({});

    const result = await contentController.loadVersion();

    expect(appStore.getState().loaded).toBe(true);
    expect(appStore.getState().config).not.toBeNull();
    expect(result.status).toContain("seeded");
  });
});

describe("contentController.syncVersion", () => {
  it("does nothing when remote version matches", async () => {
    appStore.setState({ version: 7 });
    jest.mocked(oxyApi.getGist).mockResolvedValue({
      version: 7,
    } satisfies VersionResponse);
    const loadVersion = jest
      .spyOn(contentController, "loadVersion")
      .mockResolvedValue({ status: "stub", version: 7 });

    const result = await contentController.syncVersion();

    expect(oxyApi.getGist).toHaveBeenCalledWith(GIST.version, true);
    expect(loadVersion).not.toHaveBeenCalled();
    expect(result.status).toContain("Version Synced");
  });

  it("reloads when remote version is newer", async () => {
    appStore.setState({ version: 7 });
    jest.mocked(oxyApi.getGist).mockResolvedValue({
      version: 8,
    } satisfies VersionResponse);
    const loadVersion = jest
      .spyOn(contentController, "loadVersion")
      .mockResolvedValue({ status: "stub", version: 8 });

    const result = await contentController.syncVersion();

    expect(loadVersion).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: "Updating Version", version: 8 });
  });
});

describe("contentController.init awaits CDN update on sync", () => {
  it("does not finish init until loadVersion completes when version changed", async () => {
    jest.mocked(loadStateBulk).mockResolvedValue({
      [LOCALSTORE.config]: makeConfig(1),
      [LOCALSTORE.en]: makeTexts(),
    });
    jest.mocked(oxyApi.getGist).mockResolvedValue({
      version: 2,
    } satisfies VersionResponse);

    let loadFinished = false;
    const loadVersion = jest
      .spyOn(contentController, "loadVersion")
      .mockImplementation(async () => {
        await new Promise((r) => setTimeout(r, 20));
        loadFinished = true;
        appStore.getState().setContent({
          config: makeConfig(2),
          texts: makeTexts(),
          version: 2,
        });
        return { status: "Loaded Version", version: 2 };
      });

    await contentController.init();

    expect(loadVersion).toHaveBeenCalledTimes(1);
    expect(loadFinished).toBe(true);
    expect(appStore.getState().version).toBe(2);
  });
});
