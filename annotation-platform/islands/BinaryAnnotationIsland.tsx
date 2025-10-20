import { useEffect, useState } from "preact/hooks";

interface BinaryAnnotationProps {
  data: {
    user: string;
    data: Array<{
      src: string;
      emotion: string;
    }>;
  };
}

interface BinaryAnnotationData {
  src?: string;
  path?: string;
  ind?: number;
  Prompt?: string;
  Age?: string;
  Ethnicity?: string;
  Gender?: string;
  Emotion?: string;
  image?: {
    bytes: string;
  };
}

export default function BinaryAnnotationIsland({ data }: BinaryAnnotationProps) {
  const [currentRows, setCurrentRows] = useState<BinaryAnnotationData[]>([]);
  const [skipIds, setSkipIds] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [lastDuration, setLastDuration] = useState<number>(0);

  const downloadNewRow = async (project: number, index: number) => {
    const id = index.toString().padStart(4, "0");
    const response = await fetch(
      `YOUR_ENDPOINT_HERE/part-${project}/${id}.json`,
    );

    if (response.ok) {
      return await response.json();
    }
    return {};
  };

  const preloadRows = async (project: number, startIndex: number) => {
    const rows = await Promise.all([
      downloadNewRow(project, startIndex),
      downloadNewRow(project, startIndex + 1),
      downloadNewRow(project, startIndex + 2),
    ]);
    setCurrentRows(rows.filter(row => row.Emotion && row.image));
    setStartTime(Date.now()); // Reset timer when new image is loaded
  };

  const skipIdsThatAreAlreadyAnnotated = async () => {
    const projectStr = globalThis.location.pathname.split("-").pop();
    const projectId = "B" + projectStr;
    const response = await fetch(
      `/api/binaryAlreadyAnnotated?email=${data.user}&projectId=${projectId}`,
    );
    if (response.ok) {
      const annotatedIds = await response.json();
      setSkipIds(annotatedIds);
      // Find first non-annotated index
      let nextIndex = currentIndex;
      while (annotatedIds.includes(nextIndex) && nextIndex < 2000) {
        nextIndex++;
      }
      setCurrentIndex(nextIndex);
      preloadRows(Number(projectStr), nextIndex);
    }
  };

  useEffect(() => {
    skipIdsThatAreAlreadyAnnotated();
  }, []);

  const handleAnnotation = async (isPresent: boolean) => {
    const duration = Date.now() - startTime;
    setLastDuration(duration);
    // console.log(`Annotation took ${duration}ms`);
    const projectStr = globalThis.location.pathname.split("-").pop();
    const projectId = "B" + projectStr;
    console.log({
      projectId,
      email: data.user,
      imageId: currentIndex,
      value: isPresent,
    });

    const response = await fetch("/api/annotate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId,
        imageId: currentIndex,
        email: data.user,
        value: isPresent,
        duration,
      }),
    });

    if (!response.ok) {
      console.error("Failed to save annotation");
      return;
    }

    if (currentIndex < 2000) {
      setSkipIds((prev) => [...prev, currentIndex]);
      let nextIndex = currentIndex + 1;
      while (skipIds.includes(nextIndex) && nextIndex < 2000) {
        nextIndex++;
      }

      setCurrentIndex(nextIndex);
      setCurrentRows(prev => prev.slice(1));

      const nextPreloadIndex = nextIndex + 2;
      if (nextPreloadIndex < 2000) {
        const newRow = await downloadNewRow(Number(projectStr), nextPreloadIndex);
        if (newRow.Emotion && newRow.image) {
          setCurrentRows(prev => [...prev, newRow]);
        }
      }
      setStartTime(Date.now()); // Reset timer for next image
    }
  };

  if (!currentRows[0] || !currentRows[0].Emotion || !currentRows[0].image) {
    return (
      <div>
        Loading data...
        {currentIndex}
        {currentRows[0]?.Emotion}
        {currentRows[0]?.image}
      </div>
    );
  }

  globalThis.onkeyup = (e: KeyboardEvent) => {
    console.log(e.key);
    if (e.key === "y") {
      handleAnnotation(true);
    } else if (e.key === "n") {
      handleAnnotation(false);
    }
  };

  return (
    <div class="flex flex-col items-center gap-4 p-4">
      <img
        src={`data:image/jpeg;base64,${currentRows[0].image?.bytes}`}
        class="rounded-lg shadow-lg max-w-[32rem] max-h-[32rem]"
        alt="Annotation"
      />

      <div class="text-xl">
        {currentRows[0].Emotion}
      </div>
      <div>
        Are the emotions present in the image?<br />
        <i>(You can also click "y" for Yes and "n" for No on the keyboard.)</i>
      </div>
      <div class="flex gap-4">
        <button
          onClick={() => handleAnnotation(true)}
          class="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Yes (y)
        </button>
        <button
          onClick={() => handleAnnotation(false)}
          class="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          No (n)
        </button>
      </div>

      <div class="text-sm text-gray-500">
        Progress: {currentIndex + 1} / 2000
        {lastDuration > 0 && ` | Last annotation: ${lastDuration}ms`}
      </div>
    </div>
  );
}
