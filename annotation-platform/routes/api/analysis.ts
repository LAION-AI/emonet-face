import { kvStorage } from "../../utils/kvStorage.ts";
import { FreshContext } from "$fresh/server.ts";

export const handler = async (req: Request, _ctx: FreshContext): Promise<Response> => {
  const url = new URL(req.url);
  const project = url.searchParams.get("project");
  const token = url.searchParams.get("token");

  // Early return if token or project is missing to avoid unnecessary processing.
  if (!token || !project) {
    return new Response("You need to provide both a token and a project.", {
      status: 400, // Use 400 for bad request instead of 404 not found
    });
  }

  // Await the async operation to complete before continuing.
  const result = await kvStorage.performAnalysisOnProject(token, project);

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      "Content-Type": "application/json", // Explicitly set the Content-Type
    },
  });
};
