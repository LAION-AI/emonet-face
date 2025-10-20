import { Handlers } from "$fresh/server.ts";
import { assert } from "$std/assert/assert.ts";
import { Banner } from "../../components/Banner.tsx";
import { createSupabaseClient } from "../../plugins/auth.ts";
import { redirect } from "../../utils.ts";

export const handler: Handlers = {
  async POST(req) {
    const resp = redirect("/dashboard");
    const supabase = createSupabaseClient(req, resp);
    const form = await req.formData();
    const email = form.get("email")?.toString();
    const password = form.get("password")?.toString();

    assert(email, "email is required");
    assert(password, "password is required");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect("/auth/signin?message=Error signing up");
    }

    return resp;
  },
};

export default function Page(req: Request) {
  const message = new URL(req.url).searchParams.get("message");

  return (
    <div class="flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto">
      <Banner />
      <form method="post" class="w-full">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign in
        </button>
      </form>
      {message && (
        <p class="mt-3 text-center text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}
