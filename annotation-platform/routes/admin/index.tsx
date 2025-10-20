import { Handlers, PageProps } from "$fresh/server.ts";
import { AnnotationProjects } from "../../components/AnnotationProjects.tsx";
import AnnotationList from "../../islands/AnnotationList.tsx";

// export const handler: Handlers<object> = {
//   async GET(_p, ctx) {
//     const response = await fetch("/api/db", {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     });
//     if (response.ok) {
//       const data: object = await response.json();
//       return ctx.render(data);
//     } else {
//       return ctx.render([]);
//     }
//   },
// };

export const handler: Handlers<ProjectDataList> = {
  async GET(p, ctx) {
    const project = p.url.split("/").pop();
    const response = await fetch(
      `PROJECT_ANNOTATION_URL`,
    );
    if (response.ok) {
      const data: ProjectDataList = await response.json();
      return ctx.render(data);
    } else {
      return ctx.render([]);
    }
  },
};

export default function AdminPage(props: PageProps<ProjectDataList>) {
  return (
    <div>
      <AnnotationList projects={props.data} />
    </div>
    // <div>
    //   {JSON.stringify(props.data)}
    // </div>
  );
}
