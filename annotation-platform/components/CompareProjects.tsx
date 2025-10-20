export function CompareProjects(props) {
  console.log(props);
  return (
    <div class="flex flex-col items-center gap-6 pt-4">
<div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-2xl text-left">
  <h1 className="font-bold text-2xl mb-4 text-center text-gray-800">Preference Annotation Task</h1>
  <div className="space-y-3 text-gray-600">
    <p className="mb-2 font-bold">Please follow these steps for the following annotation task</p>
    <ol className="list-decimal pl-5 space-y-2">
      <li>Examine the person in the image carefully.</li>
      <li>Choose the emotion group (left or right) that most accurately reflects the person's emotions and facial expression. Each group displays up to the top five emotions, ranked in descending order by annotator or model score.</li>
      <li>
        Submit your choice by either:
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Pressing the <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm">←</kbd> or <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm">→</kbd> arrow key</li>
          <li>Clicking the corresponding on-screen arrow button</li>
        </ul>
      </li>
    </ol>
    <p className="mt-4 text-center italic font-medium">Please work systematically and trust your first impression. Thank you for your careful annotations.</p>
  </div>
</div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full max-w-4xl">
        {props.data.map((item, index: number) => (
          <a
            href={`/compare/${item}`}
            class="rounded-md shadow-md p-4 text-black bg-white hover:bg-gray-100 text-center font-medium transition"
            key={index}
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  );
}
