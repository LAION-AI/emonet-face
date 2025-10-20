import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async POST(req) {
    const { projectId, email, imageId, value, duration } = await req.json();

    console.log(projectId);

    try {
      const kv = await Deno.openKv();
      const key = [projectId, email, imageId];

      await kv.set(key, [value, duration]);
    } catch (e) {
      console.error(e);
      return new Response("Error", { status: 500 });
    }
    
    return new Response("OK", { status: 200 });
  },
};
