export default function AudioPage() {
  // const projects = [
  //   // "part-example"
  // ];

  // projects are 00 to 13
  const projects = Array.from({ length: 14 }, (_, i) => i.toString().padStart(2, "0"));

  return (
    <div class="p-4">
      <h1 class="text-2xl mb-4">Audio Annotations</h1>
      {projects.map((project) => (
        <a href={`/admin/audio/${project}`} class="rounded-md m-4 p-2 bg-gray-200">
          {project}
        </a>
      ))}
    </div>
  );
}
