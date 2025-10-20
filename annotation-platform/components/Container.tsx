import { JSX } from "preact";
import { Header } from "./Header.tsx";
import { SignUpInContainer } from "./SignUpInContainer.tsx";
import { PageProps } from "$fresh/server.ts";

interface ContainerProps extends PageProps {
  children: JSX.Element;
}

export function Container({ children, ...props }: ContainerProps) {
  return (
    <>
      <Header {...props} />

      <div class="justify-center text-center">
        {children}
      </div>
      {!props?.state?.session && <SignUpInContainer />}
    </>
  );
}
