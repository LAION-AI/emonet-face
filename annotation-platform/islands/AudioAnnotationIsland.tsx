import { useEffect, useState, useRef } from "preact/hooks";

interface AudioAnnotationProps {
  data: {
    user: string;
    projectId: string;
  };
}

export default function AudioAnnotationIsland({ data }: AudioAnnotationProps) {
  const [audioList, setAudioList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [annotatedIds, setAnnotatedIds] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Updated to use a proxy endpoint instead of direct HTTP URL
  const baseUrl = "/api/audio-proxy?path=";

  useEffect(() => {
    // Load audio list from the project
    const loadAudioList = async () => {
      try {
        const projectId = data.projectId;
        const response = await fetch(`/audio-files/${projectId}-audio.json`);
        if (response.ok) {
          const audioFiles = await response.json();
          setAudioList(audioFiles);
          
          // Load already annotated files
          const annotatedResponse = await fetch(
            `/api/audioAlreadyAnnotated?email=${data.user}&projectId=${projectId}`
          );
          if (annotatedResponse.ok) {
            const annotated = await annotatedResponse.json();
            setAnnotatedIds(annotated);
            
            // Find first non-annotated index
            let nextIndex = 0;
            while (annotated.includes(audioFiles[nextIndex]) && nextIndex < audioFiles.length) {
              nextIndex++;
            }
            setCurrentIndex(nextIndex);
          }
          
          setIsLoading(false);
        } else {
          console.error("Failed to load audio list");
        }
      } catch (error) {
        console.error("Error loading audio list:", error);
      }
    };
    
    loadAudioList();
  }, [data.projectId]);

  useEffect(() => {
    // Update audio source when currentIndex changes
    if (audioList.length > 0 && currentIndex < audioList.length && audioRef.current) {
      setStartTime(Date.now());
      
      // The audio element's source will be updated in the render function
      // We just need to handle autoplay here
      const audioElement = audioRef.current;
      const handleCanPlay = () => {
        audioElement.play().catch(err => console.error("Error playing audio:", err));
      };
      
      audioElement.addEventListener('canplaythrough', handleCanPlay);
      
      return () => {
        audioElement.removeEventListener('canplaythrough', handleCanPlay);
      };
    }
  }, [currentIndex, audioList]);

  const handleAnnotation = async (rating: number) => {
    if (isLoading || currentIndex >= audioList.length) return;
    
    const duration = Date.now() - startTime;
    const audioPath = audioList[currentIndex];
    const emotion = audioPath.split('/')[0];
    
    try {
      const response = await fetch("/api/annotate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: data.projectId,
          audioId: audioPath,
          email: data.user,
          label: emotion,
          value: rating,
          duration,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save annotation");
        return;
      }

      // Move to next non-annotated audio
      setAnnotatedIds(prev => [...prev, audioPath]);
      let nextIndex = currentIndex + 1;
      while (
        nextIndex < audioList.length && 
        annotatedIds.includes(audioList[nextIndex])
      ) {
        nextIndex++;
      }
      
      setCurrentIndex(nextIndex);
    } catch (error) {
      console.error("Error saving annotation:", error);
    }
  };
  
  const getCurrentEmotion = () => {
    if (!audioList[currentIndex]) return "";
    return audioList[currentIndex].split('/')[0].replace(/%20/g, " ").toLowerCase();
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "1") {
        handleAnnotation(0); // Not present
      } else if (e.key === "2") {
        handleAnnotation(1); // Weakly present
      } else if (e.key === "3") {
        handleAnnotation(2); // Strongly present
      }
    };
    
    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [currentIndex, audioList, annotatedIds]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading audio files...</div>;
  }
  
  if (currentIndex >= audioList.length) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">All done!</h2>
        <p>You have completed all the audio annotations for this project.</p>
        <a href="/audio" className="text-blue-500 hover:underline mt-4 inline-block">
          Return to projects
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 max-w-xl mx-auto">
      <div className="w-full bg-gray-100 dark:bg-gray-400 rounded-lg p-6 text-center">        
        <div className="mb-8">
          <audio 
            ref={audioRef}
            controls 
            className="w-full mb-4"
            src={currentIndex < audioList.length ? baseUrl + encodeURIComponent(audioList[currentIndex]) : ''}
            onEnded={() => audioRef.current?.play()} // Loop the audio
          />
        </div>

        <div className="mt-8">
          <p className="mb-4 text-lg">Is <span class="text-2xl font-bold">{getCurrentEmotion()}</span> present in the audio?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleAnnotation(0)}
              className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Not Present (1)
            </button>
            <button
              onClick={() => handleAnnotation(1)}
              className="px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Weakly Present (2)
            </button>
            <button
              onClick={() => handleAnnotation(2)}
              className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Strongly Present (3)
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <div className="text-sm text-gray-500">
          Progress: {currentIndex + 1} / {audioList.length} 
          ({Math.round(((currentIndex + 1) / audioList.length) * 100)}%)
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${((currentIndex + 1) / audioList.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
