import { useRef, useState } from "preact/hooks";

interface AudioAnnotation {
  projectId: string;
  email: string;
  audioId: string;
  label: string;
  value: number; // 0 = not present, 1 = weakly present, 2 = strongly present
  time: number;
  timestamp: string;
}

export default function AudioStats(
  { annotations, projectId }: { annotations: AudioAnnotation[]; projectId: string },
) {
  const handleDownload = () => {
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
  
  const getRatingText = (value: number) => {
    switch (value) {
      case 0: return "Not Present";
      case 1: return "Weakly Present";
      case 2: return "Strongly Present";
      default: return `Unknown (${value})`;
    }
  };

  // For playback: track which row is playing and refs to audio elements
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  const handlePlay = (audioId: string, idx: number) => {
    // Pause any currently playing audio
    audioRefs.current.forEach((audio, i) => {
      if (audio && i !== idx) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setPlayingIndex(idx);
    // Play the selected audio after a short delay to ensure src is set
    setTimeout(() => {
      audioRefs.current[idx]?.play();
    }, 100);
  };

  return (
    <div>
      <h2 class="font-bold text-xl mb-4">Audio Annotations - Statistics for Project: {projectId}</h2>
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
          </div>
        ))}
      </div>
      
      <h3 class="font-bold text-lg mt-6 mb-2">Detailed Annotations</h3>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-400">
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
                <td class="border p-2">{annotation.email}</td>
                <td class="border p-2 text-sm flex items-center gap-2">
                  <button
                    class="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    onClick={() => handlePlay(annotation.audioId, i)}
                    title="Play audio"
                  >
                    ▶️
                  </button>
                  <span>{annotation.audioId}</span>
                  {/* Lazy-load audio element only if playing */}
                  {playingIndex === i && (
                    <audio
                      ref={el => audioRefs.current[i] = el}
                      src={`/api/audio-proxy?path=${encodeURIComponent(annotation.audioId)}`}
                      onEnded={() => setPlayingIndex(null)}
                      style={{ display: "none" }}
                    />
                  )}
                </td>
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
