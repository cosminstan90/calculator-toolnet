import config from "@/cms.config";
import {
  GRAPHQL_PLAYGROUND_GET,
  GRAPHQL_POST,
} from "@payloadcms/next/routes";
import { NextResponse } from "next/server";

const configPromise = Promise.resolve(config);
const playgroundHandler = GRAPHQL_PLAYGROUND_GET(configPromise);

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  return playgroundHandler(request);
}

export const POST = GRAPHQL_POST(configPromise);
