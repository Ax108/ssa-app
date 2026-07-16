import { decideBottomStackNav } from "@navigation/helpers/bottomStackNav";
import { RouteNames } from "@navigation/types/nav_types";

const routes = (...names: string[]) => names.map((name) => ({ name }));

describe("decideBottomStackNav", () => {
  it("pops to top when targeting home", () => {
    expect(
      decideBottomStackNav(
        routes(RouteNames.home, RouteNames.ashram, RouteNames.satsang),
        2,
        RouteNames.home,
      ),
    ).toEqual({ action: "popToTop" });
  });

  it("no-ops when already on the target tab", () => {
    expect(
      decideBottomStackNav(
        routes(RouteNames.home, RouteNames.ashram),
        1,
        RouteNames.ashram,
      ),
    ).toEqual({ action: "noop" });
  });

  it("pushes when the target is not in the stack", () => {
    expect(
      decideBottomStackNav(
        routes(RouteNames.home, RouteNames.ashram),
        1,
        RouteNames.gallery,
      ),
    ).toEqual({ action: "push", route: RouteNames.gallery });
  });

  it("pops back to an existing tab instead of pushing a duplicate", () => {
    expect(
      decideBottomStackNav(
        routes(RouteNames.home, RouteNames.ashram, RouteNames.satsang),
        2,
        RouteNames.ashram,
      ),
    ).toEqual({ action: "pop", count: 1 });
  });

  it("pops multiple levels to the nearest existing target", () => {
    expect(
      decideBottomStackNav(
        routes(
          RouteNames.home,
          RouteNames.ashram,
          RouteNames.satsang,
          RouteNames.gallery,
        ),
        3,
        RouteNames.ashram,
      ),
    ).toEqual({ action: "pop", count: 2 });
  });

  it("reuses donation in history instead of stacking another copy", () => {
    expect(
      decideBottomStackNav(
        routes(RouteNames.home, RouteNames.donation, RouteNames.contact),
        2,
        RouteNames.donation,
      ),
    ).toEqual({ action: "pop", count: 1 });
  });

  it("pushes donation when it is not already in the stack", () => {
    expect(
      decideBottomStackNav(
        routes(RouteNames.home, RouteNames.contact),
        1,
        RouteNames.donation,
      ),
    ).toEqual({ action: "push", route: RouteNames.donation });
  });

  it("uses the nearest (topmost) existing instance when duplicates already exist", () => {
    expect(
      decideBottomStackNav(
        routes(
          RouteNames.home,
          RouteNames.ashram,
          RouteNames.satsang,
          RouteNames.ashram,
          RouteNames.gallery,
        ),
        4,
        RouteNames.ashram,
      ),
    ).toEqual({ action: "pop", count: 1 });
  });
});
