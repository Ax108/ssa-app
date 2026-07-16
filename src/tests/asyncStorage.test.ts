import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loadState,
  loadStateBulk,
  saveState,
  saveStateBulk,
} from "@shared/helpers/asyncStorage";

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe("asyncStorage helpers", () => {
  it("round-trips multiple keys in bulk", async () => {
    await saveStateBulk({ one: { n: 1 }, two: { n: 2 } });

    await expect(loadStateBulk(["one", "two", "missing"])).resolves.toEqual({
      one: { n: 1 },
      two: { n: 2 },
    });
  });

  it("round-trips a single key", async () => {
    await saveState("locale", "bn");
    await expect(loadState<string>("locale")).resolves.toBe("bn");
  });

  it("skips invalid JSON for a key", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    await AsyncStorage.setItem("broken", "not-json{");

    await expect(loadStateBulk(["broken"])).resolves.toEqual({});
  });
});
