import { render } from "@testing-library/react-native";
import { SatsangScreen } from "@satsang/SatsangScreen";
import { appStore } from "@store/appStore";
import { formatConfig } from "@shared/utils/formatConfig";
import seedConfig from "../assets/json/config.json";
import seedEn from "../assets/json/en.json";
import type { Config } from "@shared/types/config";
import type { Texts } from "@shared/types/texts";

jest.mock("@shared/components/SSADivider", () => ({
  SSADivider: () => null,
}));

jest.mock("@shared/components/AppFooterStrip", () => ({
  AppFooterStrip: () => null,
}));

beforeEach(() => {
  appStore.getState().setContent({
    config: formatConfig(structuredClone(seedConfig) as Config),
    texts: structuredClone(seedEn) as Texts,
    version: 1,
  });
});

describe("SatsangScreen", () => {
  it("renders without text-outside-Text error", async () => {
    await expect(render(<SatsangScreen />)).resolves.toBeTruthy();
  });

  it("shows full CDN satsang sections", async () => {
    const { getByText } = await render(<SatsangScreen />);
    expect(getByText("Satsangs and Teachings")).toBeTruthy();
    expect(getByText("Path to Enlightenment")).toBeTruthy();
    expect(getByText("Also Available At")).toBeTruthy();
  });
});
