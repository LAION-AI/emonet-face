export function AnnotationProjectCard(project: ProjectData) {
  return (
    <a
      href={`/dashboard/projects/${project.folder}-instructions`}
      class="bg-white rounded-lg border shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
    >
      {
        /* <img
        src="projects/proj2.png"
        alt="General Annotation"
        class="w-full h-48 object-cover rounded-t-lg"
      /> */
      }
      <div class="p-4">
        <h2 class="text-xl font-semibold text-gray-800 mb-2">
          {project.title}
        </h2>
        <p class="text-gray-600">
          {project.description}
        </p>
      </div>
    </a>
  );
}
