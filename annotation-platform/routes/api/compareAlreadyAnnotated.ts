import { Handlers } from "$fresh/server.ts";
import { db } from "../../utils/kvStorage.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    const email = url.searchParams.get("email");
    if (!projectId || !email) {
      return new Response(JSON.stringify({ annotatedImages: [] }), { status: 400 });
    }
    const prefix = [`compare|${projectId}`, email];
    const entries = db.list({ prefix });
    const annotatedImages: string[] = [];
    for await (const entry of entries) {
      // entry.key = ["compare|projectId", email, imageId, ...]
      if (entry.key.length > 2) {
        annotatedImages.push(entry.key[2]);
      }
    }
    return new Response(JSON.stringify({ annotatedImages }), { status: 200 });
  },
};
