import {
  RouteNames,
  RouteTitles,
  TAB_ROUTES,
} from "@navigation/types/nav_types";

describe("nav_types", () => {
  it("exposes the five primary tab routes and donation stack route", () => {
    expect(TAB_ROUTES).toEqual([
      RouteNames.home,
      RouteNames.ashram,
      RouteNames.satsang,
      RouteNames.gallery,
      RouteNames.contact,
    ]);
    expect(RouteTitles.home).toBe("Home");
    expect(RouteTitles.donation).toBe("Donate");
    expect(RouteNames.donation).toBe("donation");
    expect(RouteNames.bottomStack).toBe("bottomStack");
  });
});
