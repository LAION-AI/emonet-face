import { Handlers, PageProps } from "$fresh/server.ts";
import BinaryAdmin from "../../../islands/BinaryAdmin.tsx";

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

interface QuestionnaireResponse {
  email: string;
  responses: Record<string, unknown>;
}

export const handler: Handlers<QuestionnaireResponse[]> = {
  async GET(req, ctx) {
    const project = ctx.params.project || req.url.split("/").pop()!;
    try {
      const kv = await Deno.openKv();
      // List all questionnaire responses for this project
      const entries = kv.list({ prefix: ["questionnaire"] });
      const responses: QuestionnaireResponse[] = [];
      for await (const entry of entries) {
        // Optionally filter by project if you store project in responses
        responses.push({
          email: entry.key[1] as string,
          responses: entry.value as Record<string, unknown>,
        });
      }
      return ctx.render(responses);
    } catch (e) {
      console.error(e);
      return ctx.render([]);
    }
  },
};

function summarize(responses: QuestionnaireResponse[], key: string) {
  const counts: Record<string, number> = {};
  for (const r of responses) {
    const v = r.responses[key];
    if (typeof v === "string") {
      counts[v] = (counts[v] || 0) + 1;
    }
  }
  return counts;
}

export default function QuestionnaireAdminPage({ data }: PageProps<QuestionnaireResponse[]>) {
  if (!data.length) {
    return <div class="p-4">No questionnaire responses found.</div>;
  }

  // Example: summarize ageRange and genderIdentity
  const ageSummary = summarize(data, "ageRange");
  const genderSummary = summarize(data, "genderIdentity");

  return (
    <div class="p-4">
      <h1 class="text-2xl mb-4">Questionnaire Responses</h1>
      <div class="mb-6">
        <h2 class="font-bold mb-2">Summary</h2>
        <div class="mb-2">
          <span class="font-semibold">Age Range:</span>
          <ul class="ml-4">
            {Object.entries(ageSummary).map(([k, v]) => (
              <li key={k}>{k}: {v}</li>
            ))}
          </ul>
        </div>
        <div class="mb-2">
          <span class="font-semibold">Gender Identity:</span>
          <ul class="ml-4">
            {Object.entries(genderSummary).map(([k, v]) => (
              <li key={k}>{k}: {v}</li>
            ))}
          </ul>
        </div>
      </div>
      <h2 class="font-bold mb-2">All Responses</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full border">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-2">Email</th>
              {Object.keys(data[0].responses).map((k) => (
                <th class="border p-2" key={k}>{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i} class="hover:bg-gray-50">
                <td class="border p-2">{r.email}</td>
                {Object.keys(r.responses).map((k) => (
                  <td class="border p-2" key={k}>
                    {typeof r.responses[k] === "boolean"
                      ? (r.responses[k] ? "Yes" : "No")
                      : String(r.responses[k] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
