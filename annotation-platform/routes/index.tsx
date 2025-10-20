import { PageProps } from "$fresh/server.ts";
import { Container } from "../components/Container.tsx";

// Make this an `async` function so we can get the full context
// deno-lint-ignore require-await
export default async function Home(
  _req: Request,
  pageProps: PageProps
) {
  if (pageProps?.state?.session) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/dashboard",
      },
    });
  } else {
    return (
      <Container {...pageProps}>
        <div></div>
      </Container>
    );
  }
}
