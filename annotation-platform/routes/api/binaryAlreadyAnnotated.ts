import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const projectId = url.searchParams.get("projectId");

    if (!email || !projectId) {
      return new Response("Missing email or projectId", { status: 400 });
    }

    try {
      const kv = await Deno.openKv();
      const entries = kv.list({ prefix: [projectId, email] });
      const annotatedIds = [];
      
      for await (const entry of entries) {
        annotatedIds.push(entry.key[2]); // key[2] is the imageId
      }

      return new Response(JSON.stringify(annotatedIds));
    } catch (e) {
      console.error(e);
      return new Response("Error", { status: 500 });
    }
  },

  OPTIONS(_req) {
    return new Response(null, {
      status: 204,
      headers: {
        "Allow": "GET, OPTIONS",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  },
};
