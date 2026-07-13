import { render, screen } from "@testing-library/react-native";
import App from "../App";

jest.mock("react-native-screens", () => ({
  enableScreens: jest.fn(),
}));

jest.mock("@features/app/hooks/useLoadFonts", () => ({
  useLoadFonts: () => ({ fontsLoaded: false, fontError: null }),
}));

jest.mock("@features/app/components/BubbleLoader", () => ({
  BubbleLoader: () => null,
}));

describe("App", () => {
  it("shows the splash brand title before fonts are ready", async () => {
    await render(<App />);
    expect(screen.getByText("Sadhan Sangha Ashram")).toBeTruthy();
  });
});
