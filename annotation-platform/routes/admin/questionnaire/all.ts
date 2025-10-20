import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET() {
    const kv = await Deno.openKv();
    const entries = kv.list({ prefix: ["questionnaire"] });
    const responses = [];
    for await (const entry of entries) {
      responses.push({
        email: entry.key[1] as string,
        responses: entry.value as Record<string, unknown>,
      });
    }
    return new Response(JSON.stringify(responses), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
