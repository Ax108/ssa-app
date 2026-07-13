import { render, screen } from "@testing-library/react-native";
import { CustomText } from "@shared/components/CustomText";

describe("CustomText", () => {
  it("renders children", async () => {
    await render(<CustomText>Sadhan Sangha Ashram</CustomText>);
    expect(screen.getByText("Sadhan Sangha Ashram")).toBeTruthy();
  });
});
