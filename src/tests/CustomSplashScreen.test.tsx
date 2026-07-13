import { render, screen } from "@testing-library/react-native";
import { CustomSplashScreen } from "@features/app/components/CustomSplashScreen";

jest.mock("@features/app/components/BubbleLoader", () => ({
  BubbleLoader: () => null,
}));

describe("CustomSplashScreen", () => {
  it("renders the site brand title while loading", async () => {
    await render(<CustomSplashScreen />);
    expect(screen.getByText("Sadhan Sangha Ashram")).toBeTruthy();
  });
});
