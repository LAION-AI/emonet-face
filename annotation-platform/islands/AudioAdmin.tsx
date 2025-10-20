interface AudioAnnotation {
  projectId: string;
  email: string;
  audioId: string;
  label: string;
  value: number; // 0 = not present, 1 = weakly present, 2 = strongly present
  time: number;
  timestamp: string;
}

export default function AudioAdmin(
  { annotations }: { annotations: AudioAnnotation[] },
) {
  const handleDownload = () => {
    const projectId = annotations[0]?.projectId || "unknown";
    const datetime = new Date().toISOString().replace(/[:.]/g, "-");
    const jsonlContent = annotations
      .map((a) => JSON.stringify(a))
      .join("\n");
    const blob = new Blob([jsonlContent], { type: "application/x-ndjson" });
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectId}-${datetime}.jsonl`;
    a.click();
  };

  const handleDelete = async (projectId: string, email: string) => {
    if (
      !confirm(`Are you sure you want to delete all annotations for ${email}?`)
    ) {
      return;
    }

    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        body: JSON.stringify({ projectId, email }),
      });

      if (res.ok) {
        globalThis.location.reload();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete annotations");
    }
  };
  
  const getRatingText = (value: number) => {
    switch (value) {
      case 0: return "Not Present";
      case 1: return "Weakly Present";
      case 2: return "Strongly Present";
      default: return `Unknown (${value})`;
    }
  };

  return (
    <div>
      <h2 class="font-bold text-xl mb-4">Audio Annotations - Admin Dashboard</h2>
      <div class="mb-4">Total annotations: {annotations.length}</div>
      <button
        class="bg-blue-500 text-white rounded-md my-2 p-2 hover:bg-blue-600"
        onClick={() => handleDownload()}
      >
        Download all annotations
      </button>
      
      <h3 class="font-bold text-lg mt-6 mb-2">Annotations per annotator</h3>
      <div class="mb-4">
        Average time taken: {Math.round(annotations.reduce((acc, curr) => acc + curr.time, 0) / annotations.length)}ms
      </div>
      
      <div class="space-y-2 mb-6">
        {Object.entries(
          annotations.reduce((acc: { [key: string]: number }, annotation) => {
            if (!acc[annotation.email]) {
              acc[annotation.email] = 0;
            }
            acc[annotation.email]++;
            return acc;
          }, {})
        ).map(([email, count], i) => (
          <div key={i} class="flex items-center gap-4">
            <div class="font-medium">{email}</div>
            <div>{count} annotations</div>
            <button
              class="bg-red-500 text-white rounded-md px-2 py-1 hover:bg-red-600"
              onClick={() => handleDelete(annotations[0].projectId, email)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      
      <h3 class="font-bold text-lg mt-6 mb-2">Detailed Annotations</h3>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-400">
              <th class="border p-2">Project ID</th>
              <th class="border p-2">Email</th>
              <th class="border p-2">Audio File</th>
              <th class="border p-2">Emotion Label</th>
              <th class="border p-2">Rating</th>
              <th class="border p-2">Time (ms)</th>
              <th class="border p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {annotations.map((annotation, i) => (
              <tr key={i} class="hover:bg-gray-50 dark:hover:bg-gray-400">
                <td class="border p-2">{annotation.projectId}</td>
                <td class="border p-2">{annotation.email}</td>
                <td class="border p-2 text-sm">{annotation.audioId}</td>
                <td class="border p-2">{annotation.label}</td>
                <td class="border p-2">{getRatingText(annotation.value)}</td>
                <td class="border p-2">{annotation.time}</td>
                <td class="border p-2 text-sm">{annotation.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
