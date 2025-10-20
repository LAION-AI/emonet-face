import { useState, useMemo } from "preact/hooks";

interface CompareAdminProps {
  annotations: any[];
  projectId: string;
}

export default function CompareAdmin({ annotations, projectId }: CompareAdminProps) {
  // Ensure annotations is always an array
  const initialRows = annotations.data || [];
  const [rows, setRows] = useState(initialRows);

  // Compute annotation counts per annotator (key[1])
  const annotatorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!Array.isArray(rows)) return counts;
    rows.forEach((entry: any) => {
      const annotator = entry.key[1];
      counts[annotator] = (counts[annotator] || 0) + 1;
    });
    return counts;
  }, [rows]);

  const handleDelete = async (entry: any) => {
    if (!confirm("Are you sure you want to delete this annotation?")) return;
    await fetch(`/api/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: entry.key }),
    });
    setRows(rows.filter((r) => r !== entry));
  };

  // Add this function to reload all compare annotations from the backend
  const reloadRows = async () => {
    const res = await fetch(`/api/getAllCompareAnnotations?projectId=${encodeURIComponent(projectId)}`);
    const data = await res.json();
    setRows(data.data || []);
  };

  const handleDeleteAll = async (annotator: string, projectId: string) => {
    if (!confirm(`Delete ALL annotations for ${annotator}?`)) return;
    await fetch(`/api/deleteAll?annotator=${encodeURIComponent(annotator)}&projectId=${encodeURIComponent(projectId)}`);
    // Instead of filtering locally, reload from backend
    await reloadRows();
  };

  const handleDownload = () => {
    const datetime = new Date().toISOString().replace(/[:.]/g, "-");
    const jsonlContent = rows.map((a: any) => JSON.stringify(a)).join("\n");
    const blob = new Blob([jsonlContent], { type: "application/x-ndjson" });
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectId}-compare-${datetime}.jsonl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-4">Annotations for project: {projectId}</h1>
      <div class="mb-4">
        <h2 class="text-lg font-semibold mb-2">Annotations per annotator:</h2>
        <ul class="mb-2">
          {Object.entries(annotatorCounts).map(([annotator, count]) => (
            <li key={annotator} class="mb-1 flex items-center gap-2">
              <span class="font-mono">{annotator}</span>
              <span class="bg-gray-200 rounded px-2">{count}</span>
              <button
                class="bg-red-400 text-white rounded px-2 py-1 hover:bg-red-700 text-xs"
                onClick={() => handleDeleteAll(annotator, projectId)}
              >
                Delete all
              </button>
            </li>
          ))}
        </ul>
        <button
          class="bg-blue-500 text-white rounded-md my-2 p-2 hover:bg-blue-600"
          onClick={handleDownload}
        >
          Download all annotations
        </button>
      </div>
      <table class="table-auto border-collapse border w-full">
        <thead>
          <tr>
            <th class="border px-2 py-1">User</th>
            <th class="border px-2 py-1">Image</th>
            <th class="border px-2 py-1">Preferred Model</th>
            <th class="border px-2 py-1">Duration (ms)</th>
            <th class="border px-2 py-1">Timestamp</th>
            <th class="border px-2 py-1">Delete</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry: any) => (
            <tr>
              <td class="border px-2 py-1">{entry.key[1]}</td>
              <td class="border px-2 py-1">{entry.key[2]}</td>
              <td class="border px-2 py-1">{entry.value?.value}</td>
              <td class="border px-2 py-1">{entry.value?.duration}</td>
              <td class="border px-2 py-1">{entry.key[3] ? new Date(Number(entry.key[3])).toLocaleString() : ""}</td>
              <td class="border px-2 py-1">
                <button
                  class="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-700"
                  onClick={() => handleDelete(entry)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
