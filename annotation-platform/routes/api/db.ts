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

  async GET(_req, _ctx) {
    const url = new URL(_req.url);
    const user = url.searchParams.get("user") ?? "";
    const project = url.searchParams.get("project") ?? "";
    const file = url.searchParams.get("file") ?? "";
    const method = url.searchParams.get("method") ?? "";
    if (method == "currentAnnotation") {
      const result = await kvStorage.getAnnotationForProjectUserFile(
        user,
        project,
        file,
      );
      return new Response(JSON.stringify(result), {
        status: 200,
      });
    }
    if (method == "lastAnnotation") {
      const result = await kvStorage.getLastAnnotationForProjectUser(
        user,
        project
      );
      return new Response(JSON.stringify(result), {
        status: 200,
      });
    }

    return new Response("Method not found", {
      status: 404,
    });
  },
};
