import { Handlers, PageProps } from "$fresh/server.ts";
import { kvStorage } from "../../../utils/kvStorage.ts";
import CompareAdmin from "../../../islands/CompareAdmin.tsx";

export const handler: Handlers = {
  async GET(req, ctx) {
    const { project } = ctx.params;
    console.log("AdminCompare", project);
    const data = await kvStorage.getAllCompareAnnotations(project);
    return ctx.render({ project, data: Array.isArray(data) ? data : [] });
  },
};

export default function AdminCompare({ data }: PageProps) {
  return <CompareAdmin annotations={data} projectId={data.project} />;
}
