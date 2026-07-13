import { GIST, GIT, gistBase, gitBase } from "@constants/cdn";
import { oxyApi } from "@shared/serviceCalls/oxyApi";

const jsonOk = (data: unknown): Response =>
  ({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  }) as unknown as Response;

const badJsonOk = (): Response =>
  ({
    ok: true,
    status: 200,
    json: () => Promise.reject(new Error("bad json")),
  }) as unknown as Response;

afterEach(() => {
  jest.restoreAllMocks();
});

describe("oxyApi", () => {
  it("getGist omits cache-buster when useCache is true", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonOk({ version: 3 }));
    global.fetch = fetchMock;

    const result = await oxyApi.getGist<{ version: number }>(
      GIST.version,
      true,
    );

    expect(result).toEqual({ version: 3 });
    expect(fetchMock).toHaveBeenCalledWith(`${gistBase}${GIST.version}/raw`);
  });

  it("getGist appends timestamp when useCache is false", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonOk({}));
    global.fetch = fetchMock;

    await oxyApi.getGist(GIST.version, false);

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      `${gistBase}${GIST.version}/raw?timestamp=`,
    );
  });

  it("getGit fetches from git base + path", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonOk({ ok: true }));
    global.fetch = fetchMock;

    const result = await oxyApi.getGit<{ ok: boolean }>(GIT.config);

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(`${gitBase}${GIT.config}`);
  });

  it("rejects when the network request fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network down"));

    await expect(oxyApi.getGit(GIT.config)).rejects.toThrow("network down");
  });

  it("rejects when response is not ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    await expect(oxyApi.getGit(GIT.config)).rejects.toThrow("HTTP 500");
  });

  it("rejects when the response body is not valid JSON", async () => {
    global.fetch = jest.fn().mockResolvedValue(badJsonOk());

    await expect(oxyApi.getGist(GIST.version, true)).rejects.toThrow(
      "bad json",
    );
  });
});
