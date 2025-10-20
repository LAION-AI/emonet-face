import { Handlers, PageProps } from "$fresh/server.ts";
import CompareAnnotationIsland from "../../islands/CompareAnnotationIsland.tsx";

interface GuideData {
  user: string;
}

export const handler: Handlers<GuideData | null> = {
  async GET(_p, ctx) {

    const user = await (ctx.state.session as { user: { email: string } })?.user.email;
    // console.log(data);
    const currentPath = _p.url;

    console.log("path", currentPath);
    console.log("user", user);

    if (!user) {
      return ctx.render(null);
    }

    // console.log(data[0]);

    return ctx.render({
      user,
      currentPath,
    });
  },
};

export default function Project(props: PageProps) {
  if (
    !props.data || !props.data.user || !props.data.currentPath
  ) {
    return (
      <div>
        Loading data failed. Check the{" "}
        <a
          href="/binary"
          class="font-bold"
        >
          Annotate Collection Repository
        </a>{" "}
        for completeness.
      </div>
    );
  } else {
    return <CompareAnnotationIsland data={props.data} />;
  }
}
