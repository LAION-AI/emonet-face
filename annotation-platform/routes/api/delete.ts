import { Handlers } from "$fresh/server.ts";
import { db } from "../../utils/kvStorage.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { key } = await req.json();
      if (!Array.isArray(key)) {
        return new Response("Invalid key", { status: 400 });
      }
      await db.delete(key);
      return new Response("Deleted", { status: 200 });
    } catch (e) {
      console.error(e);
      return new Response("Error deleting annotation", { status: 500 });
    }
  },
  async DELETE(req) {
    try {
      const { annotator, projectId } = await req.json();
      if (!annotator || !projectId) {
        return new Response("Missing annotator or projectId", { status: 400 });
      }
      // Keys: ["compare|<project>", annotator, ...]
      const prefix = ["compare|" + projectId, annotator];
      const entries = db.list({ prefix });
      let count = 0;
      for await (const entry of entries) {
        await db.delete(entry.key);
        count++;
      }
      return new Response(`Deleted ${count} annotations for ${annotator}`, { status: 200 });
    } catch (e) {
      console.error(e);
      return new Response("Error deleting all annotations for annotator", { status: 500 });
    }
  },
};
