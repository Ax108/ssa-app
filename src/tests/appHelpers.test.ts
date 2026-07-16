import { Appearance } from "react-native";
import { getDeviceColorScheme } from "@appModules/helpers/app_Feature_helpers";

describe("getDeviceColorScheme", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("maps Appearance dark to dark", () => {
    jest.spyOn(Appearance, "getColorScheme").mockReturnValue("dark");
    expect(getDeviceColorScheme()).toBe("dark");
  });

  it("falls back to light", () => {
    jest.spyOn(Appearance, "getColorScheme").mockReturnValue(null);
    expect(getDeviceColorScheme()).toBe("light");
  });
});
