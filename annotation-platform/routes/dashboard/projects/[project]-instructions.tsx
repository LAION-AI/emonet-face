import { Handlers, PageProps } from "$fresh/server.ts";

interface GuideData {
  instructions: string;
  project: string;
  // options: {
  //   [key: string]: {
  //     [key: string]: string[];
  //   };
  // };
  // images: string[];
}

export const handler: Handlers<GuideData | null> = {
  async GET(p, ctx) {
    const project = p.url.split("/").pop()?.replace("-instructions", "");
    const response = await fetch(
      `YOUR_API_ENDPOINT_HERE/${project}/instructions`, // Replace with your actual API endpoint
    );
    if (response.ok) {
      const data: GuideData = await response.json();
      data.project = project || "";
      return ctx.render(data);
    } else {
      return ctx.render(null);
    }
  },
};

export default function Project(props: PageProps<GuideData | null>) {
  if (
    !props.data || !props.data.instructions || !props.data.project
  ) {
    return (
      <div>
        Loading data failed. Check the{" "}
        <a
          href="YOUR_API_ENDPOINT_HERE"
          class="font-bold"
        >
          Annotate Collection Repository
        </a>{" "}
        for completeness.
      </div>
    );
  }

  const { instructions, project} = props.data;

  // pick a random image

  return (
    <div class="max-w-md bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden md:max-w-2xl mt-4 mb-8 mx-2 sm:mx-auto">
      <div class="p-2">
        <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-800">
          Instructions
        </h2>
        {/* Render the html as well from instructions */}
        <div
          class="mb-3 font-normal text-left"
          dangerouslySetInnerHTML={{ __html: instructions }}
        ></div>
        {/* <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {instructions}
        </p> */}
        <a
          href={`/dashboard/projects/${project}`}
          class="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Start annotating
          <svg
            aria-hidden="true"
            class="ml-2 -mr-1 w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            >
            </path>
          </svg>
        </a>
      </div>
    </div>
  );
}
