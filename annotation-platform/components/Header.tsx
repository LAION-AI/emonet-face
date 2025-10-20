import { PageProps } from "$fresh/server.ts";

export function Header(props: PageProps) {
  return (
    <header class="flex bg-gray-50 text-sm p-2">
      <div class="container mx-auto flex justify-evenly pt-3 pb-1 flex-wrap">
        <h1>
          <a href="/">
            <img
              class="mx-4 inline h-6, w-6"
              src="/logo.svg"
              alt="the Annotate logo."
            />
            Annotate Platform
          </a>
        </h1>
        <div>
          {(props?.state?.session as { user: { email: string } })?.user.email}
        </div>
        {props?.params?.project && <div>{props.params.project}</div>}
        <nav class="mt-2 md:mt-0">
          <ul class="flex gap-4">
            {props?.params?.project && (
              <li>
                <a
                  href="/dashboard"
                  class="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-150"
                >
                  Home
                </a>
              </li>
            )}
            {props?.state?.session && (
              <li>
                <a
                  href="/auth/signout"
                  class="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-150 whitespace-nowrap"
                >
                  Sign out
                </a>
              </li>
            )}
            <li>
              <a
                href="#impressum"
                class="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-150"
              >
                Impressum
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
