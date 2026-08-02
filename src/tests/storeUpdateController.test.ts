import { Platform } from "react-native";
import { appStore } from "@store/appStore";
import { evaluateStoreUpdatePrompt } from "@shared/ota/storeUpdateController";
import * as storeVersion from "@shared/ota/storeVersion";
import type { Config } from "@shared/types/config";
import type { Texts } from "@shared/types/texts";

jest.mock("@shared/ota/storeVersion", () => {
  const actual = jest.requireActual("@shared/ota/storeVersion");
  return {
    ...actual,
    getInstalledAppVersion: jest.fn(() => "1.0.0"),
  };
});

const minimalConfig = (storeApp?: Config["storeApp"]): Config =>
  ({
    version: 1,
    CONSTS: { ytPList: "", ytEmbed: "", gitAssetBase: "" },
    primaryImgs: {},
    contactDetails: {
      location: "",
      gmap: "",
      phone: "",
      email: "",
      gmapEmbed: "",
      gmapEmbedTitle: "",
    },
    donationDetails: {
      accountName: "",
      accountNumber: "",
      ifsc: "",
      swift: "",
      bankBranch: "",
    },
    socialLinks: {},
    gallery: { albums: {} },
    yt: {
      channel: "",
      podcast: "",
      bhajan: "",
      satsangHeaderVid: "",
      playlists: [],
    },
    storeApp,
  }) as Config;

const minimalTexts = (): Texts =>
  ({
    version: 1,
    headers: {
      storeUpdateMessage: "Update available",
      storeUpdateAction: "Update",
    },
    pages: {},
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
    ashram: "",
    satsang: "",
    gallery: "",
    donationNote: "",
  }) as Texts;

beforeEach(() => {
  Object.defineProperty(Platform, "OS", {
    configurable: true,
    get: () => "android",
  });
  appStore.getState().resetStoreUpdateSession();
  appStore.setState({
    config: null,
    texts: null,
    storeUpdateVisible: false,
    storeUpdateDismissedThisSession: false,
  });
  jest.mocked(storeVersion.getInstalledAppVersion).mockReturnValue("1.0.0");
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("evaluateStoreUpdatePrompt", () => {
  it("shows when CDN store version is newer", () => {
    appStore.setState({
      config: minimalConfig({
        latestVersion: "1.0.1",
        androidPackage: "sadhan.sangha",
      }),
      texts: minimalTexts(),
    });

    evaluateStoreUpdatePrompt();

    expect(appStore.getState().storeUpdateVisible).toBe(true);
  });

  it("stays hidden when versions match", () => {
    appStore.setState({
      config: minimalConfig({
        latestVersion: "1.0.0",
        androidPackage: "sadhan.sangha",
      }),
    });

    evaluateStoreUpdatePrompt();

    expect(appStore.getState().storeUpdateVisible).toBe(false);
  });

  it("does not re-show after dismiss until session reset", () => {
    appStore.setState({
      config: minimalConfig({
        latestVersion: "1.0.1",
        androidPackage: "sadhan.sangha",
      }),
    });

    evaluateStoreUpdatePrompt();
    expect(appStore.getState().storeUpdateVisible).toBe(true);

    appStore.getState().dismissStoreUpdate();
    expect(appStore.getState().storeUpdateVisible).toBe(false);
    expect(appStore.getState().storeUpdateDismissedThisSession).toBe(true);

    evaluateStoreUpdatePrompt();
    expect(appStore.getState().storeUpdateVisible).toBe(false);
  });

  it("shows again after cold-start session reset while still outdated", () => {
    appStore.setState({
      config: minimalConfig({
        latestVersion: "1.0.1",
        androidPackage: "sadhan.sangha",
      }),
    });
    evaluateStoreUpdatePrompt();
    appStore.getState().dismissStoreUpdate();

    appStore.getState().resetStoreUpdateSession();
    evaluateStoreUpdatePrompt();

    expect(appStore.getState().storeUpdateVisible).toBe(true);
  });
});
