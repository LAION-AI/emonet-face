interface BinaryAnnotation {
  projectId: string;
  email: string;
  imageId: string;
  value: boolean;
  time: number;
}

export default function BinaryAdmin(
  { annotations }: { annotations: BinaryAnnotation[] },
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

  return (
    <div>
      <h2 class="font-bold">General statistics</h2>
      <div>Total annotations: {annotations.length}</div>
      <button
        class="bg-blue-200 rounded-md my-2 p-2"
        onClick={() => handleDownload()}
      >
        Download all annotations
      </button>
      <h3 class="font-bold">Annotations per annotator</h3>
      <div>Average time taken: {Math.round(annotations.reduce((acc, curr) => acc + curr.time, 0) / annotations.length)}ms</div>
      <div>
        {Object.keys(
          annotations.reduce((acc: { [key: string]: number }, annotation) => {
            if (!acc[annotation.email]) {
              acc[annotation.email] = 0;
            } else {
              acc[annotation.email]++;
            }
            return acc;
          }, {}),
        ).map((email, i) => (
          <div key={i} class="flex items-center">
            <div>{email}</div>
            <div class="mx-4">
              {annotations.filter((annotation) => annotation.email === email)
                .length} / 2000
            </div>
            <button
              class="bg-red-200 rounded-md my-2 p-2"
              onClick={() => handleDelete(annotations[0].projectId, email)}
            >
              Delete annotations for {email}
            </button>
          </div>
        ))}
      </div>
      <h3 class="font-bold">Details</h3>
      <table class="w-full border-collapse border">
        <thead>
          <tr>
            <th class="border p-2">Project ID</th>
            <th class="border p-2">Email</th>
            <th class="border p-2">Image ID</th>
            <th class="border p-2">Value</th>
            <th class="border p-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {annotations.map((annotation, i) => (
            <tr key={i}>
              <td class="border p-2">{annotation.projectId}</td>
              <td class="border p-2">{annotation.email}</td>
              <td class="border p-2">{annotation.imageId}</td>
              <td class="border p-2">{annotation.value ? "Yes" : "No"}</td>
              <td class="border p-2">{annotation.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
