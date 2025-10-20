import { Handlers, PageProps } from "$fresh/server.ts";
import AudioAdmin from "../../../islands/AudioAdmin.tsx";

interface AudioAnnotation {
  projectId: string;
  email: string;
  audioId: string;
  label: string;
  value: boolean;
  time: number;
}

interface AudioStats {
  totalAnnotations: number;
  numberOfAudioFiles: number;
  annotationsPerAnnotator: { [key: string]: number };
  averageTime: number;
}

export const handler: Handlers<AudioAnnotation[]> = {
  async GET(p, ctx) {
    const project = p.url.split("/").pop()!;
    const stats: AudioStats = {
      "totalAnnotations": 0,
      "numberOfAudioFiles": 0,
      "annotationsPerAnnotator": {},
      "averageTime": 0,
    };
    try {
      const kv = await Deno.openKv();
      // console.log("Opened KV storage - getting annotations for project", project);
      const entries = kv.list<[string, boolean, number]>({ prefix: [project] });
      const annotations: AudioAnnotation[] = [];

      // console.log(entries);

      for await (const entry of entries) {
        stats.totalAnnotations++;
        if (!stats.annotationsPerAnnotator[entry.key[1] as string]) {
          stats.annotationsPerAnnotator[entry.key[1] as string] = 0;
        } else {
          stats.annotationsPerAnnotator[entry.key[1] as string]++;
        }
        stats.averageTime += entry.value[2];
        annotations.push({
          projectId: entry.key[0] as string,
          email: entry.key[1] as string,
          audioId: entry.key[2] as string,
          label: entry.value[0] as string,
          value: entry.value[1] as boolean,
          time: entry.value[2] as number,
        });
        stats.averageTime /= stats.totalAnnotations;
      }

      return ctx.render(annotations);
    } catch (e) {
      console.error(e);
      return ctx.render([]);
    }
  },
};

export default function BinaryPage({ data }: PageProps<AudioAnnotation[]>) {
  return (
    <div class="p-4">
      <h1 class="text-2xl mb-4">Audio Annotations</h1>
      <AudioAdmin annotations={data} />
    </div>
  );
}
