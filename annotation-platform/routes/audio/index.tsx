import { Handlers, PageProps } from "$fresh/server.ts";
import { AudioProjects } from "../../components/AudioProjects.tsx";

interface AudioProject {
  name: string;
  id: string;
}

export const handler: Handlers<AudioProject[]> = {
  async GET(_req, ctx) {
    try {
      // Read the audio files directory to get projects
      const files = await Deno.readDir("./static/audio-files");
      const projects: AudioProject[] = [];
      
      for await (const file of files) {
        if (file.name.endsWith("-audio.json")) {
          const id = file.name.replace("-audio.json", "");
          projects.push({
            name: `Audio Project ${id}`,
            id: id,
          });
        }
      }
      
      return ctx.render(projects);
    } catch (error) {
      console.error("Error reading audio projects:", error);
      return ctx.render([]);
    }
  },
};

export default function AudioProjectsPage(props: PageProps<AudioProject[]>) {
  return <AudioProjects projects={props.data} />;
}
