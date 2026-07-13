import { appStore } from "@store/appStore";
import { RouteTitles } from "@navigation/types/nav_types";

describe("navbarSlice", () => {
  beforeEach(() => {
    appStore.getState().setTitle(RouteTitles.home);
  });

  it("defaults to Home and updates the active title", () => {
    expect(appStore.getState().title).toBe(RouteTitles.home);

    appStore.getState().setTitle(RouteTitles.ashram);
    expect(appStore.getState().title).toBe(RouteTitles.ashram);

    appStore.getState().resetTitle();
    expect(appStore.getState().title).toBeNull();
  });
});
