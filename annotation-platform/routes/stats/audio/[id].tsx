// ./stats/audio/[id].tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import AudioStats from "../../../islands/AudioStats.tsx";

// Import from kvStorage
import { kvStorage } from "../../../utils/kvStorage.ts";

interface AudioAnnotation {
  projectId: string;
  email: string;
  audioId: string;
  label: string;
  value: number;
  time: number;
  timestamp: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const projectId = ctx.params.id;
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (token !== "YOUR_SECRET_KEY") {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      console.log(`Fetching annotations for project ID: ${projectId}`);
      
      // Use the existing method from kvStorage with our token
      // Modify token check to allow our token
      const result = await kvStorage.performAnalysisOnProject("YOUR_SECRET_KEY", projectId);
      
      // Convert the result to the format we expect
      const annotations: AudioAnnotation[] = [];
      for (const entry of result as any[]) {
        if (entry.value) {
          annotations.push(entry.value);
        }
      }
      
      console.log(`Found ${annotations.length} annotations`);
      
      return ctx.render({ annotations, projectId });
    } catch (error) {
      console.error("Error loading annotations:", error);
      return ctx.render({ 
        annotations: [], 
        projectId, 
        error: `Failed to load annotations: ${error.message}` 
      });
    }
  },
};

export default function StatsPage({ data }: PageProps<{
  annotations: AudioAnnotation[];
  projectId: string;
  error?: string;
}>) {
  if (data.error) {
    return (
      <div class="p-4">
        <h1 class="text-2xl font-bold">Error</h1>
        <p>{data.error}</p>
      </div>
    );
  }
  
  if (!data.annotations || data.annotations.length === 0) {
    return (
      <div class="p-4">
        <h1 class="text-2xl font-bold">No annotations found</h1>
        <p>There are no annotations for project ID: {data.projectId}</p>
      </div>
    );
  }
  
  return (
    <div class="p-4 max-w-6xl mx-auto">
      <AudioStats annotations={data.annotations} projectId={data.projectId} />
    </div>
  );
}
