import { Handlers } from "$fresh/server.ts";
import { db } from "../../utils/kvStorage.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const annotator = url.searchParams.get("annotator");
    const projectId = url.searchParams.get("projectId");
    console.log("Deleting all annotations for", annotator, projectId);
    if (!annotator || !projectId) {
      return new Response("Missing annotator or projectId", { status: 400 });
    }
    const prefix = [`compare|${projectId}`, `${annotator}`];
    const entries = db.list({ prefix: prefix });
    let count = 0;
    for await (const entry of entries) {
      await db.delete(entry.key);
      count++;
    }
    return new Response(`Deleted ${count} annotations for ${annotator}`, { status: 200 });
  },
};

