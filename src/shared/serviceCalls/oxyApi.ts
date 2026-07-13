import { gistBase, gitBase } from "@constants/cdn";

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return (await response.json()) as T;
};

export const oxyApi = {
  getGist: <T = unknown>(gist: string, useCache = false): Promise<T> =>
    fetchJson<T>(
      `${gistBase}${gist}/raw${useCache ? "" : `?timestamp=${Date.now()}`}`,
    ),
  getGit: <T = unknown>(path: string): Promise<T> =>
    fetchJson<T>(`${gitBase}${path}`),
};
