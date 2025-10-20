import { Handlers, PageProps } from "$fresh/server.ts";
import AudioAnnotationIsland from "../../islands/AudioAnnotationIsland.tsx";

interface GuideData {
  user: string;
}

export const handler: Handlers<GuideData | null> = {
  async GET(_p, ctx) {

    const user = await (ctx.state.session as { user: { email: string } })?.user.email;
    // console.log(data);

    if (!user) {
      return ctx.render(null);
    }

    // console.log(data[0]);

    return ctx.render({
      user
    });
  },
};

export default function Project(props: PageProps) {
  if (
    !props.data || !props.data.user
  ) {
    return (
      <div>
        Loading data failed. Check the{" "}
        <a
          href="/audio"
          class="font-bold"
        >
          Annotate Collection Repository
        </a>{" "}
        for completeness.
      </div>
    );
  } else {
    return <AudioAnnotationIsland data={props.data} />;
  }
}
