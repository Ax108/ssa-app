import { render, screen } from "@testing-library/react-native";
import App from "../App";

jest.mock("react-native-screens", () => ({
  enableScreens: jest.fn(),
}));

jest.mock("@modules/app/hooks/useLoadFonts", () => ({
  useLoadFonts: () => ({ fontsLoaded: false, fontError: null }),
}));

jest.mock("@modules/app/components/BubbleLoader", () => ({
  BubbleLoader: () => null,
}));

jest.mock("@store/contentController", () => ({
  contentController: {
    init: jest.fn().mockResolvedValue({ status: "stub" }),
  },
}));

jest.mock("@shared/ota/updatesController", () => ({
  syncOtaUpdate: jest.fn().mockResolvedValue({ status: "up-to-date" }),
}));

describe("App", () => {
  it("shows the splash brand title before fonts are ready", async () => {
    await render(<App />);
    expect(screen.getByText("Sadhan Sangha Ashram")).toBeTruthy();
  });
});
