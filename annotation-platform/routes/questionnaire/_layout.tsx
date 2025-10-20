import { type PageProps } from "$fresh/server.ts";
import { Container } from "../../components/Container.tsx";

// deno-lint-ignore no-explicit-any
export default function App({ Component, ...pageProps }: PageProps & { children: any }) {
  return (
    <Container {...pageProps} Component={Component}>
      <Component {...pageProps}>
        {pageProps.children}
      </Component>
    </Container>
  );
}
