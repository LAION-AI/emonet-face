import { Handlers, PageProps } from "$fresh/server.ts";
import { BinaryProjects } from "../../components/BinaryProjects.tsx";

export const handler: Handlers<BinaryAnnotationDataList> = {
  async GET(_p, ctx) {
    // const project = p.url.split("/").pop();
    const response = await fetch(
      `YOUR_API_ENDPOINT_HERE`, // Replace with your actual API endpoint
    );
    if (response.ok) {
      const data: BinaryAnnotationDataList = await response.json();
      // console.log(data);
      // reduce data so it only keeps download_url of each row
      const binaryDataList = data.map((row) => ({ name: row.name }));
      // console.log(binaryDataList);
      return ctx.render(binaryDataList);
    } else {
      return ctx.render([]);
    }
  },
};

export default function DashboardPage(props: PageProps<string[]>) {
  // return <BinaryProjects projects={props.data} />;
  return <BinaryProjects projects={props.data} />;
}
