import { Handlers, PageProps } from "$fresh/server.ts";
import { AnnotationProjects } from "../../components/AnnotationProjects.tsx";

export const handler: Handlers<ProjectDataList> = {
  async GET(_p, ctx) {
    // const project = p.url.split("/").pop();
    const response = await fetch(
      `YOUR_API_ENDPOINT_HERE/projects.json`,
    );
    if (response.ok) {
      const data: ProjectDataList = await response.json();
      return ctx.render(data);
    } else {
      return ctx.render([]);
    }
  },
};

export default function DashboardPage(props: PageProps<ProjectDataList>) {
  return <AnnotationProjects projects={props.data} />;
}
