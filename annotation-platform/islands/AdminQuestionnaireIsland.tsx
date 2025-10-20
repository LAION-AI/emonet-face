import { useEffect, useState } from "preact/hooks";

interface QuestionnaireResponse {
  email: string;
  responses: Record<string, unknown>;
}

export default function AdminQuestionnaireIsland() {
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/questionnaire/all")
      .then((res) => res.json())
      .then((data) => {
        setResponses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDownload = () => {
    const jsonl = responses.map((r) => JSON.stringify(r)).join("\n");
    const blob = new Blob([jsonl], { type: "application/x-ndjson" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `questionnaire-responses-${new Date().toISOString().replace(/[:.]/g, "-")}.jsonl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div>Loading...</div>;
  if (!responses.length) return <div>No questionnaire responses found.</div>;

  const allKeys = Array.from(
    new Set(responses.flatMap((r) => Object.keys(r.responses)))
  );

  return (
    <div>
      <button
        class="bg-blue-500 text-white rounded-md my-2 p-2 hover:bg-blue-600"
        onClick={handleDownload}
      >
        Download as JSONL
      </button>
      <div class="overflow-x-auto mt-4">
        <table class="min-w-full border">
          <thead>
            <tr class="bg-gray-100">
              <th class="border p-2">Email</th>
              {allKeys.map((k) => (
                <th class="border p-2" key={k}>{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((r, i) => (
              <tr key={i} class="hover:bg-gray-50">
                <td class="border p-2">{r.email}</td>
                {allKeys.map((k) => (
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
