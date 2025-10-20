import { useEffect, useState, useRef } from "preact/hooks";

interface BinaryAnnotation {
  projectId: string;
  email: string;
  imageId: string;
  value: boolean;
  time: number;
}

const fetchImageData = async (projectId: string, imageId: string) => {
  const projectNumber = String(projectId.replace('B', '')).padStart(2, "0");
  const id = imageId.padStart(4, "0");
  const response = await fetch(
    `YOUR_ENDPOINT_HERE/part-${projectNumber}/${id}.json`,
  );

  if (response.ok) {
    const data = await response.json();
    return {emotion: data.Emotion, imageBytes: data?.image?.bytes}; // Return base64 string
  }
  return null;
};

export default function BinaryStatsIsland(
  { annotations }: { annotations: BinaryAnnotation[] },
) {
  const [loadedImages, setLoadedImages] = useState<{ [imageId: string]: string }>({});
  const [loadedEmotions, setLoadedEmotions] = useState<{ [imageId: string]: string }>({});
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observer.current?.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const imageId = target.dataset.imageId;
            const projectId = target.dataset.projectId;
            if (imageId && projectId && !loadedImages[imageId]) {
              observer.current?.unobserve(target);
              const emotionImageData = await fetchImageData(projectId, imageId);
              const imageData = emotionImageData!['imageBytes'];
              const emotion = emotionImageData!['emotion']
              if (imageData && emotion) {
                setLoadedImages(prev => ({ ...prev, [imageId]: imageData }));
                setLoadedEmotions(prev => ({ ...prev, [imageId]: emotion }));
              } else {
                console.error(`Failed to load image data for ${projectId}/${imageId}`);
              }
            }
          }
        });
      },
      {
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    const imageContainers = document.querySelectorAll('[data-image-id]');
    imageContainers.forEach(container => {
      observer.current?.observe(container);
    });

    return () => {
      observer.current?.disconnect();
    };
  }, [annotations]);
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
      <h3 class="font-bold">Details</h3>
      <table class="w-full border-collapse border">
        <thead>
          <tr>
            <th class="border p-2">Project ID</th>
            <th class="border p-2">Email</th>
            <th class="border p-2">Image ID</th>
            <th class="border p-2">Value</th>
            <th class="border p-2">Time</th>
            <th class="border p-2">Emotion</th>
            <th class="border p-2">Image</th> {/* New header */}
          </tr>
        </thead>
        <tbody>
          {annotations.map((annotation, i) => (
            <tr key={i}>
              <td class="border p-2">{annotation.projectId}</td>
              <td class="border p-2">{annotation.email}</td>
              <td class="border p-2">{annotation.imageId}</td>
              <td class="border p-2">{annotation.value ? "✅" : "❌"}</td>
              <td class="border p-2">{annotation.time}</td>
              <td class="border p-2">{loadedEmotions[annotation.imageId]}</td>
              <td class="border p-2">
                <div
                  data-image-id={annotation.imageId}
                  data-project-id={annotation.projectId}
                  class="w-48 h-48 flex items-center justify-center bg-gray-200" // Placeholder styling
                >
                  {loadedImages[annotation.imageId] ? (
                    <img
                      src={`data:image/jpeg;base64,${loadedImages[annotation.imageId]}`}
                      alt={`Image ${annotation.imageId}`}
                      class="max-w-full max-h-full object-contain" // Image styling
                    />
                  ) : (
                    'Loading...' // Loading indicator
                  )}
                </div>
              </td> {/* New cell */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
