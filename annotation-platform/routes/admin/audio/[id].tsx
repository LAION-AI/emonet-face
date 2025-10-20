import { Handlers, PageProps } from "$fresh/server.ts";
import { kvStorage } from "../../../utils/kvStorage.ts";
import AudioAdmin from "../../../islands/AudioAdmin.tsx";

export const handler: Handlers = {
  async GET(req, ctx) {
    const projectId = ctx.params.id;
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (token !== "YOUR_SECRET_KEY" && ctx.state.session.user.email !== "YOUR_ADMIN_EMAIL") {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const result = await kvStorage.performAnalysisOnProject("YOUR_SECRET_KEY", projectId);
      const annotations = [];
      
      for (const entry of result) {
        annotations.push(entry.value);
      }
      
      return ctx.render({ annotations });
    } catch (error) {
      console.error("Error loading annotations:", error);
      return ctx.render({ annotations: [], error: "Failed to load annotations" });
    }
  },
};

export default function AdminAudioPage({ data }: PageProps) {
  if (data.error) {
    return <div>Error: {data.error}</div>;
  }
  
  return <AudioAdmin annotations={data.annotations} />;
}
