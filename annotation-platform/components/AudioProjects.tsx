interface AudioProject {
  name: string;
  id: string;
}

export function AudioProjects(props: { projects: AudioProject[] }) {
  return (
    <div class="flex flex-col gap-6 p-4 max-w-3xl mx-auto">
      <div class="prose dark:prose-invert">
        <h1 class="text-2xl font-bold text-center mb-6">
          Audio Emotion Annotation
        </h1>

        <section class="mb-6">
          <h2 class="text-xl font-semibold mb-3">Instructions</h2>
          <p class="mb-4 text-left">
            In this task, you'll be assessing whether a specific emotion appears
            to be present in the audio recordings. Each recording will be associated with
            a single emotion label, and you need to decide whether that emotion is:
          </p>
          <ul class="list-disc pl-6 space-y-2 text-left mb-4">
            <li><strong>Not Present</strong> - The emotion is not detectable in the audio</li>
            <li><strong>Weakly Present</strong> - The emotion is somewhat present but not strong</li>
            <li><strong>Strongly Present</strong> - The emotion is clearly and strongly expressed</li>
          </ul>
          <p class="mb-4 text-left">
            Listen carefully to each recording and make your selection based on your perception
            of the emotion in the audio.
          </p>
        </section>

        <section class="mb-6">
          <h2 class="text-xl font-semibold mb-3">Available Projects</h2>
          
          {props.projects.length === 0 ? (
            <p class="text-center text-gray-500">No audio projects available.</p>
          ) : (
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {props.projects
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((project) => (
                <a
                href={`/audio/${project.id}`}
                class="flex items-center justify-center bg-white dark:bg-gray-400 rounded-lg shadow-md p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                <div>
                  <h3 class="font-bold mb-2">{project.name}</h3>
                </div>
                </a>
              ))}
            </div>
          )}
        </section>

        <p class="text-center text-lg font-medium mt-6">
          Thank you for your contribution! 🎧
        </p>
      </div>
    </div>
  );
}
