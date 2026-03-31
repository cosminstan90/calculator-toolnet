import config from "@/cms.config";
import { getPayload, type Payload } from "payload";

let cachedPayload: Promise<Payload> | null = null;

export const getPayloadClient = async (): Promise<Payload> => {
  if (!cachedPayload) {
    cachedPayload = getPayload({ config });
  }

  try {
    return await cachedPayload;
  } catch (error) {
    cachedPayload = null;
    throw error;
  }
};
