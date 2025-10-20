import { Handlers } from "$fresh/server.ts";
import { redirect } from "../../utils.ts";
import { createSupabaseClient } from "../../plugins/auth.ts";

export const handler: Handlers = {
  async GET(req) {
    const requestUrl = new URL(req.url);
    // Set up a successful response
    const resp = redirect("/admin");
    const code = requestUrl.searchParams.get("code");
    const supabase = createSupabaseClient(req, resp);

    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    }

    return resp;
  },
};