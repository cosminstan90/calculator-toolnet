import { absoluteURL, siteConfig } from "./site.ts";

const INDEXNOW_KEY = "34fc324484f820eea2ddac40b668294f";

const isProduction = process.env.NODE_ENV === "production";

export const notifyIndexNow = async (paths: string[]): Promise<void> => {
  if (!isProduction || paths.length === 0) {
    return;
  }

  try {
    const host = new URL(absoluteURL("/")).host;

    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: absoluteURL(`/${INDEXNOW_KEY}.txt`),
        urlList: paths.map((path) => absoluteURL(path)),
      }),
    });
  } catch (error) {
    console.error(`[indexnow] notify failed for ${siteConfig.name}`, error);
  }
};
