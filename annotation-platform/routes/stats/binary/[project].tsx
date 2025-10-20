import { Handlers, PageProps } from "$fresh/server.ts";
import BinaryStatsIsland from "../../../islands/BinaryStatsIsland.tsx";

interface BinaryAnnotation {
  projectId: string;
  email: string;
  imageId: string;
  value: boolean;
  time: number;
}

interface BinaryStats {
  totalAnnotations: number;
  numberOfImages: number;
  annotationsPerAnnotator: { [key: string]: number };
  averageTime: number;
}

export const handler: Handlers<BinaryAnnotation[]> = {
  async GET(p, ctx) {
    const project = p.url.split("/").pop().split("?")[0]!;
    console.log(project);
    const stats: BinaryStats = {
      "totalAnnotations": 0,
      "numberOfImages": 0,
      "annotationsPerAnnotator": {},
      "averageTime": 0,
    };
    try {
      const kv = await Deno.openKv();
      const entries = kv.list<[boolean, number]>({ prefix: [project] });
      const annotations: BinaryAnnotation[] = [];

      for await (const entry of entries) {
        stats.totalAnnotations++;
        if (!stats.annotationsPerAnnotator[entry.key[1] as string]) {
          stats.annotationsPerAnnotator[entry.key[1] as string] = 0;
        } else {
          stats.annotationsPerAnnotator[entry.key[1] as string]++;
        }
        stats.averageTime += entry.value[1];
        annotations.push({
          projectId: entry.key[0] as string,
          email: entry.key[1] as string,
          imageId: entry.key[2] as string,
          value: entry.value[0] as boolean,
          time: entry.value[1] as number,
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

export default function BinaryPage({ data }: PageProps<BinaryAnnotation[]>) {
  return (
    <div class="p-4">
      <h1 class="text-2xl mb-4">Binary Annotations</h1>
      <BinaryStatsIsland annotations={data} />
    </div>
  );
}
