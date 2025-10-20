import { Handlers, PageProps } from "$fresh/server.ts";
import AudioAnnotationIsland from "../../islands/AudioAnnotationIsland.tsx";
// import { getSessionInfo } from "../../plugins/auth.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const projectId = ctx.params.id;
    // const sessionInfo = await getSessionInfo(req);

    console.log(req);
    console.log(ctx);
    
    if (!ctx.state.session.user.email) {
      const url = new URL(req.url);
      return Response.redirect(`${url.origin}/login?returnTo=${encodeURIComponent(url.pathname)}`);
    }
    
    // Verify that the project exists
    try {
      const audioListPath = `./static/audio-files/${projectId}-audio.json`;
      await Deno.stat(audioListPath);
    } catch (error) {
      return ctx.render({ error: "Project not found" });
    }
    
    return ctx.render({
      user: ctx.state.session.user.email,
      projectId: projectId,
    });
  },
};

export default function AudioProjectPage({ data }: PageProps) {
  if (data.error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">{data.error}</h2>
          <a href="/audio" className="text-blue-500 hover:underline">
            Return to projects
          </a>
        </div>
      </div>
    );
  }
  
  return <AudioAnnotationIsland data={data} />;
}
