import { Handlers, PageProps } from "$fresh/server.ts";
import AnnotationIsland from "../../../islands/AnnotationIsland.tsx";

interface GuideData {
  instructions: string;
  labels: {[key: string]: string[]}
  options: {
    [key: string]: {
      [key: string]: string[] | object;
    };
  };
  images: string[];
  user: string;
}

export const handler: Handlers<GuideData | null> = {
  async GET(p, ctx) {
    // console.log(p.state.session);
    // console.log((ctx.state.session as { user: { email: string } })?.user.email);
    const project = p.url.split("/").pop();
    const response = await fetch(
      `YOUR_API_URL/projects/${project}/guide.json`,
    );
    if (response.ok) {
      const data: GuideData = await response.json();
      data.user = (ctx.state.session as { user: { email: string } })?.user
        .email;
      return ctx.render(data);
    } else {
      return ctx.render(null);
    }
  },
};

export default function Project(props: PageProps) {
  if (
    !props.data || !props.data.options ||
    !props.data.images
  ) {
    return (
      <div>
        Loading data failed. Check the{" "}
        <a
          href="YOUR_API_URL"
          class="font-bold"
        >
          Annotate Collection Repository
        </a>{" "}
        for completeness.
      </div>
    );
  }

  const { options, images, user } = props.data;

  const reverseOptions: { [key: string]: string[] } = {};

  if (options.buttons !== undefined) {
    Object.keys(options.buttons).forEach((key: string) => {
      options.buttons[key].forEach((value: string) => {
        if (reverseOptions[value]) {
          reverseOptions[value].push(key);
        } else {
          reverseOptions[value] = [key];
        }
      });
    });
  }

  // pick a random image for start
  // const image = images[Math.floor(Math.random() * images.length)];
  // const image = images[0];
  return (
    <div>
      <AnnotationIsland
        buttons={options.buttons}
        labels={options.labels}
        reverseButtons={reverseOptions}
        images={images}
        user={user}
        project={props.params.project}
      />
    </div>
  );
}
