export default function BinaryPage() {
  const projects = [
    "B00",
    "B01",
    "B02",
    "B03",
    "B04",
    "B05",
    "B06",
    "B07",
    "B08",
    "B09",
    "B10",
    "B11",
    "B12",
    "B13",
    "B14",
    "B15",
    "B16",
    "B17"
  ];

  return (
    <div class="p-4">
      <h1 class="text-2xl mb-4">Binary Annotations</h1>
      {projects.map((project) => (
        <a href={`/stats/binary/${project}`} class="rounded-md m-4 p-2 bg-gray-200">
          {project}
        </a>
      ))}
    </div>
  );
}
