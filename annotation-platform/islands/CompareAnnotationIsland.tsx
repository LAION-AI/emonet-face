import { useEffect, useState, useCallback, useMemo } from "preact/hooks";

interface CompareAnnotationIslandProps {
  data: {
    user: string;
    currentPath: string;
  }
}

// Enhanced types for better organization
interface AnnotationData {
  annotatorName: string;
  annotations: [string, number][];
}

interface PreloadedItem {
  image: string;
  modelA: [string, number][];
  modelB: [string, number][];
  sideAssignment: {
    left: string;
    right: string;
    leftAnn: [string, number][];
    rightAnn: [string, number][];
  };
  startTime: number;
}

export default function CompareAnnotationIsland(
  { data }: CompareAnnotationIslandProps,
) {
  const user = data.user;
  const currentPath = data.currentPath;
  const annotatorA = "human-median";
  const annotatorB = "empathic-insight-face-large";
  const project = useMemo(() => currentPath.split("/").pop() || "", [currentPath]);
  const preloadCount = 3; // Number of items to preload

  // Consolidated state
  const [allImages, setAllImages] = useState<string[]>([]);
  const [annotatedImages, setAnnotatedImages] = useState<Set<string>>(new Set());
  const [preloadedQueue, setPreloadedQueue] = useState<PreloadedItem[]>([]);
  const [currentItem, setCurrentItem] = useState<PreloadedItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch all available images once
  useEffect(() => {
    let cancelled = false;
    const fetchImages = async () => {
      try {
        const url = `YOUR_ENDPOINT_HERE/${project}/images`;
        const res = await fetch(url);
        const data = await res.json();
        const imageFiles = Array.isArray(data)
          ? data.filter((f) => f.type === "file" && f.download_url).map((f) => f.name)
          : [];
        
        if (!cancelled) {
          setAllImages(imageFiles);
        }
      } catch (error) {
        console.error("Failed to fetch images:", error);
        if (!cancelled) {
          setAllImages([]);
        }
      }
    };

    const fetchAnnotatedImages = async () => {
      try {
        const res = await fetch(
          `/api/compareAlreadyAnnotated?projectId=${encodeURIComponent(project)}&email=${encodeURIComponent(user)}`
        );
        const data = await res.json();
        if (!cancelled) {
          setAnnotatedImages(new Set(data.annotatedImages || []));
        }
      } catch (error) {
        console.error("Failed to fetch annotated images:", error);
        if (!cancelled) {
          setAnnotatedImages(new Set());
        }
      }
    };

    Promise.all([fetchImages(), fetchAnnotatedImages()]);
    return () => { cancelled = true; };
  }, [project, user]);

  // Preload function to fetch annotations for an image
  const preloadImage = useCallback(async (imageName: string): Promise<PreloadedItem | null> => {
    if (!imageName) return null;
    
    const imageStem = imageName.replace(/\.[^/.]+$/, "");
    const urlA = `YOUR_API_ENDPOINT_HERE/annotations/${annotatorA}/${project}/${imageStem}.json`;
    const urlB = `YOUR_API_ENDPOINT_HERE/annotations/models/stance-detection-all/${annotatorB}/${imageStem}.json`;

    try {
      const [resA, resB] = await Promise.all([fetch(urlA), fetch(urlB)]);
      
      let annotationsA: [string, number][] = [];
      let annotationsB: [string, number][] = [];
      
      if (resA.ok) {
        const dataA = await resA.json();
        annotationsA = Object.entries(dataA.value)
          .filter(([_, v]) => Number(v) !== 0)
          .sort((a, b) => 
            Number(b[1]) - Number(a[1]) !== 0
              ? Number(b[1]) - Number(a[1])
              : a[0].localeCompare(b[0])
          )
          .slice(0, 5);
      }
      
      if (resB.ok) {
        const dataB = await resB.json();
        annotationsB = Object.entries(dataB.value)
          .filter(([_, v]) => Number(v) !== 0)
          .sort((a, b) => 
            Number(b[1]) - Number(a[1]) !== 0
              ? Number(b[1]) - Number(a[1])
              : a[0].localeCompare(b[0])
          )
          .slice(0, 5);
      }
      
      // Randomize side assignment
      const isLeftA = Math.random() < 0.5;
      const sideAssignment = isLeftA 
        ? {
            left: annotatorA,
            right: annotatorB,
            leftAnn: annotationsA,
            rightAnn: annotationsB,
          }
        : {
            left: annotatorB,
            right: annotatorA,
            leftAnn: annotationsB,
            rightAnn: annotationsA,
          };
      
      // Preload the actual image
      const img = new Image();
      img.src = `YOUR_API_ENDPOINT_HERE/${project}/images/${imageName}`;

      return {
        image: imageName,
        modelA: annotationsA,
        modelB: annotationsB,
        sideAssignment,
        startTime: Date.now(),
      };
    } catch (error) {
      console.error(`Failed to preload image ${imageName}:`, error);
      return null;
    }
  }, [project, annotatorA, annotatorB]);

  // Function to get next unannotated images
  const getNextUnannotatedImages = useCallback((count: number) => {
    const result: string[] = [];
    for (const img of allImages) {
      if (!annotatedImages.has(img) && 
          !preloadedQueue.some(item => item.image === img) && 
          (!currentItem || currentItem.image !== img)) {
        result.push(img);
        if (result.length >= count) break;
      }
    }
    return result;
  }, [allImages, annotatedImages, preloadedQueue, currentItem]);

  // Fill the preload queue when needed
  useEffect(() => {
    if (loading && preloadedQueue.length > 0) {
      // Set the first preloaded item as current item
      setCurrentItem(preloadedQueue[0]);
      setPreloadedQueue(prev => prev.slice(1));
      setLoading(false);
      return;
    }

    const fillQueue = async () => {
      const neededItems = preloadCount - preloadedQueue.length;
      if (neededItems <= 0) return;

      const nextImages = getNextUnannotatedImages(neededItems);
      if (nextImages.length === 0) return;

      // Preload each image and its annotations
      const preloadPromises = nextImages.map(img => preloadImage(img));
      const preloadedItems = await Promise.all(preloadPromises);
      
      // Filter out null results and add to queue
      const validItems = preloadedItems.filter(Boolean) as PreloadedItem[];
      if (validItems.length > 0) {
        setPreloadedQueue(prev => [...prev, ...validItems]);
        
        // If we're still loading and got items, set the first one as current
        if (loading && validItems.length > 0 && !currentItem) {
          setCurrentItem(validItems[0]);
          setPreloadedQueue(prev => prev.filter((_, i) => i !== 0));
          setLoading(false);
        }
      }
    };

    fillQueue();
  }, [
    allImages, 
    annotatedImages, 
    preloadedQueue, 
    preloadCount, 
    getNextUnannotatedImages, 
    preloadImage, 
    loading,
    currentItem
  ]);

  // Compute progress index (1-based)
  const progressIndex = useMemo(() => {
    if (!currentItem) return 0;
    const idx = allImages.indexOf(currentItem.image);
    return idx === -1 ? 0 : idx + 1;
  }, [allImages, currentItem]);

  // Submit annotation with improved error handling
  const submitAnnotation = useCallback(async (side: "A" | "B") => {
    if (submitting || !currentItem || isTransitioning) return;
    setSubmitting(true);
    setIsTransitioning(true);
    
    // Store current image to check if it changes
    const currentImageName = currentItem.image;
    
    try {
      const duration = Date.now() - currentItem.startTime;
      const pickedModel = side === "A" ? currentItem.sideAssignment.left : currentItem.sideAssignment.right;
      
      const payload = {
        projectId: project,
        email: user,
        imageId: currentItem.image,
        value: pickedModel,
        duration,
      };
      
      console.log("Submitting annotation:", payload);
      
      // First prepare the next image before submitting to ensure smooth transition
      let nextItem: PreloadedItem | null = null;
      
      if (preloadedQueue.length > 0) {
        console.log("Getting next preloaded item:", preloadedQueue[0].image);
        nextItem = preloadedQueue[0];
        
        // Preload the next image to ensure it's in browser cache
        const img = new Image();
        img.src = `YOUR_API_ENDPOINT_HERE/${project}/images/${nextItem.image}`;
      } else {
        const nextImages = getNextUnannotatedImages(1);
        console.log("No preloaded items available, found next images:", nextImages);
        
        if (nextImages.length > 0) {
          console.log("Will load a new image after submission");
          // We'll set loading to true later
        } else {
          console.log("No more unannotated images available");
        }
      }
      
      // Now submit the annotation
      const response = await fetch("/api/annotateCompare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error submitting annotation: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      try {
        const responseData = await response.json();
        console.log("Annotation submission response:", responseData);
      } catch (parseError) {
        console.log("Failed to parse JSON response:", parseError);
        // If response can't be parsed as JSON, just log it
        console.log("Non-JSON response from annotation API");
      }
      
      // Update annotated images locally
      setAnnotatedImages(prev => new Set([...prev, currentItem.image]));
      
      // Apply the prepared transition
      if (nextItem) {
        console.log("Transitioning to next item:", nextItem.image);
        setCurrentItem(nextItem);
        setPreloadedQueue(prev => prev.slice(1));
      } else {
        // If no preloaded items, try to get a new one or mark as complete
        const nextImages = getNextUnannotatedImages(1);
        if (nextImages.length > 0) {
          console.log("Setting loading to true to fetch next image");
          setLoading(true);
        } else {
          console.log("No more unannotated images available");
          setCurrentItem(null);
        }
      }
    } catch (error) {
      console.error("Failed to submit annotation:", error);
      // Don't block the user - continue to next image anyway
      if (preloadedQueue.length > 0) {
        setCurrentItem(preloadedQueue[0]);
        setPreloadedQueue(prev => prev.slice(1));
      } else {
        setLoading(true);
      }
    } finally {
      // Ensure we clear the submitting state
      setSubmitting(false);
      
      // Add a slight delay before allowing new transitions
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  }, [submitting, currentItem, preloadedQueue, project, user, getNextUnannotatedImages, isTransitioning]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (submitting || !currentItem) return;
      if (e.key === "ArrowLeft") {
        submitAnnotation("A");
      }
      if (e.key === "ArrowRight") {
        submitAnnotation("B");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [submitAnnotation, submitting, currentItem]);

  // Helper function to safely render annotation text
  const renderAnnotationText = (key: string) => {
    try {
      if (key && key.includes('|')) {
        return key.split('|')[1];
      }
      return key;
    } catch (e) {
      console.error("Error formatting annotation key:", e);
      return key;
    }
  };

  // Loading state with conditional message
  if (loading || !currentItem) {
    // Check if there are no more unannotated images
    const noMoreImages = allImages.length > 0 && 
      allImages.every(img => annotatedImages.has(img) || 
        preloadedQueue.some(item => item.image === img));
    
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">
          {noMoreImages 
            ? "No more unannotated images available" 
            : "Loading images and annotations..."}
        </div>
      </div>
    );
  }

  return (
    <div class="mx-auto max-w-4xl flex flex-col items-center gap-8 py-8">
      {/* Progress indicator */}
      <div class="text-lg font-semibold">
        {progressIndex} / 250
      </div>
      {/* show the image stem and extension of the image */}
      {/* <div class="text-sm text-gray-500">
        {currentItem.image}
      </div> */}
      <div class={`relative ${isTransitioning ? '' : ''}`}>
        <img
          class="max-h-[520px] md:rounded-lg"
          src={`YOUR_API_ENDPOINT_HERE/${project}/images/${currentItem.image}`}
          alt="Project Image"
          key={currentItem.image}
          onLoad={() => console.log("Image loaded:", currentItem.image)}
        />
        {isTransitioning && (
          <div class="absolute inset-0 flex items-center justify-center">
          </div>
        )}
      </div>
      <div>Use the <b>left</b> and <b>right</b> arrow keys, or click the <b>arrow buttons</b>, to choose the emotions that best describe the person.</div>

      <div class="flex w-full gap-8">
        {/* LEFT SIDE */}
        <div class="flex-1 bg-gray-50 rounded-lg p-4 flex flex-col">
          <div class="flex flex-row items-center justify-between gap-2">
            {/* Arrow button on the left */}
            <button
              class={`bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 flex items-center ${(loading || isTransitioning) ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => submitAnnotation("A")}
              disabled={submitting || loading || isTransitioning}
              aria-label="Pick A (Left Arrow)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {/* Emotions */}
            <ul class="flex flex-col gap-1 flex-1 ml-3">
              {currentItem.sideAssignment.leftAnn.length === 0
                ? <li class="text-base">No model annotation</li>
                : currentItem.sideAssignment.leftAnn.map(([k, _v], idx) => {
                    const sizes = ["text-xl", "text-lg", "text-base", "text-sm", "text-xs"];
                    return (
                      <li key={k} class={`${sizes[idx] || "text-xs"} font-semibold`}>
                        {renderAnnotationText(k)}
                      </li>
                    );
                  })
              }
            </ul>
          </div>
        </div>
        {/* RIGHT SIDE */}
        <div class="flex-1 bg-gray-50 rounded-lg p-4 flex flex-col">
          <div class="flex flex-row items-center justify-between gap-2">
            {/* Emotions */}
            <ul class="flex flex-col gap-1 flex-1 mr-3 items-center">
              {currentItem.sideAssignment.rightAnn.length === 0
                ? <li class="text-base">No model annotation</li>
                : currentItem.sideAssignment.rightAnn.map(([k, _v], idx) => {
                    const sizes = ["text-xl", "text-lg", "text-base", "text-sm", "text-xs"];
                    return (
                      <li key={k} class={`${sizes[idx] || "text-xs"} font-semibold`}>
                        {renderAnnotationText(k)}
                      </li>
                    );
                  })
              }
            </ul>
            {/* Arrow button on the right */}
            <button
              class={`bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 flex items-center ${(loading || isTransitioning) ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => submitAnnotation("B")}
              disabled={submitting || loading || isTransitioning}
              aria-label="Pick B (Right Arrow)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Preload status indicator */}
      {/* <div class="text-xs text-gray-500 flex justify-center items-center gap-2">
        <span>{preloadedQueue.length} images preloaded</span>
        {submitting && <span class="animate-pulse">Submitting...</span>}
      </div> */}
      
      {/* Debug information toggle (for troubleshooting) */}
      {/* <details class="text-xs text-gray-500 mt-2">
        <summary>Debug Info</summary>
        <pre class="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-40">
          Current Image: {currentItem?.image}
          Annotations Left: {JSON.stringify(currentItem?.sideAssignment.leftAnn.map(a => a[0]))}
          Annotations Right: {JSON.stringify(currentItem?.sideAssignment.rightAnn.map(a => a[0]))}
        </pre>
      </details> */}
    </div>
  );
}
