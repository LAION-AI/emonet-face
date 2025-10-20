import { Handlers } from "$fresh/server.ts";
import { db } from "../../utils/kvStorage.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) {
      return new Response(JSON.stringify({ data: [] }), { status: 400 });
    }
    const prefix = [`compare|${projectId}`];
    const entries = db.list({ prefix });
    const data = [];
    for await (const entry of entries) {
      data.push(entry);
    }
    return new Response(JSON.stringify({ data }), { status: 200 });
  },
};
