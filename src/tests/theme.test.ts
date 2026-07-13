import { palette, theme } from "../constants";

describe("theme / palette", () => {
  it("keeps web cream header and taupe page tokens", () => {
    expect(palette.default100).toBe("#fff1e4");
    expect(palette.default200).toBe("#bda894");
    expect(palette.default300).toBe("#464038");
    expect(palette.logoBrown).toBe("#796b5d");
    expect(theme.topNav.background).toBe(palette.default100);
    expect(theme.bg.default).toBe(palette.default200);
    expect(theme.topNav.logoBody).toBe(palette.logoBrown);
    expect(theme.footer.background).toBe("#2a1f16");
  });
});
