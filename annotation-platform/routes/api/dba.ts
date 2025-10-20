import { Handlers } from "$fresh/server.ts";
import { kvStorage } from "../../utils/kvStorage.ts";

export const handler: Handlers = {
  POST(req, _ctx) {
    const result = req.json().then(async (data) => {
      const r = await kvStorage.addAnnotation(data);
      return new Response(r, {
        status: 200,
      });
    });
    return result;
  },

  async GET(req, _ctx) {
    const p = new URL(req.url).searchParams.get("project");
    console.log(p);
    const result = await kvStorage.getAllAnnotations(p || "");
    return new Response(JSON.stringify(result), {
      status: 200,
    });
  },

  async DELETE(req, _ctx) {
    const p = new URL(req.url).searchParams.get("project");
    const result = await kvStorage.deleteAllAnnotations(p || "");
    return new Response(result, {
      status: 200,
    });
  }
};
