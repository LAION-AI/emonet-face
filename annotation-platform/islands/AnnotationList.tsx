// import { PageProps } from "$fresh/server.ts";
import { useState } from "preact/hooks";

interface ProjectProps {
  projects: ProjectDataList;
}

interface Statistics {
  total_annotations: number;
  number_of_files: number;
  distribution: { [key: string]: number };
  distributionOfAnnotators: { [key: string]: number };
  // distributionOfCategories: { [key: string]: number };
  // distributionOfEmotions: { [key: string]: number };
}

interface Annotation {
  key: string[];
  value: { [key: string]: string[] };
  versionstamp: string;
}

const _formatDate = (versionstamp: string) => {
  return new Date(parseInt(versionstamp.substring(0, 10))).toLocaleDateString(
    "de-DE",
  );
};

export default function AnnotationList(props: ProjectProps) {
  // State to store the fetched data
  const [annotations, setAnnotations] = useState([]);
  const [statistics, setStatistics] = useState<Statistics>();

  const downloadAnnotationsAsJsonl = () => {
    if (!annotations) return;

    // add a timestamp in format YYYY-MM-DD-HH-MM-SS
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "-");

    // Convert annotations array to JSONL format
    const jsonlData = annotations.map((annotation: Annotation) =>
      JSON.stringify(annotation)
    ).join("\n");

    // Create a Blob with JSONL data
    const blob = new Blob([jsonlData], { type: "text/plain" });

    // Create a temporary anchor element for the download
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "annotations-" + timestamp + ".jsonl";
    document.body.appendChild(a); // Append anchor to body
    a.click(); // Trigger download
    document.body.removeChild(a); // Clean up
  };

  const deleteAllAnnotations = async (p: string) => {
    const response = await fetch(`/api/dba?project=${p}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      console.log("Deleted all annotations");
      setAnnotations([]);
      setStatistics(undefined);
    } else {
      console.error("Failed to delete annotations");
    }
  };

  const getAnnotations = async (p: string) => {
    const response = await fetch(`/api/dba?project=${p}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      const data = await response.json();
      // console.log(data);

      const numAnnotations = data.length;

      // // Find the first and last annotations based on versionstamp
      // // Assuming higher versionstamp values are more recent
      // const sortedAnnotations = data.sort((a: Annotation, b: Annotation) =>
      //   a.versionstamp.localeCompare(b.versionstamp)
      // );

      // Calculate the distribution of files
      const distributionOfFiles: { [key: string]: number } = {};
      const distributionOfAnnotators: { [key: string]: number } = {};
      data.forEach((annotations: Annotation) => {
        const fileName = annotations.key[2];
        const annotator = annotations.key[1];
        if (distributionOfAnnotators[annotator]) {
          distributionOfAnnotators[annotator] += 1;
        } else {
          distributionOfAnnotators[annotator] = 1;
        }
        if (distributionOfFiles[fileName]) {
          distributionOfFiles[fileName] += 1;
        } else {
          distributionOfFiles[fileName] = 1;
        }
      });

      const number_of_files = Object.keys(distributionOfFiles).length;

      // const distributionOfCategories: { [key: string]: number } = {};
      // const distributionOfEmotions: { [key: string]: number } = {};

      // data.forEach((annotation: Annotation) => {
      //   const categories = Object.keys(annotation.value);
      //   categories.forEach((category) => {
      //     // Update category distribution
      //     distributionOfCategories[category] =
      //       (distributionOfCategories[category] || 0) + 1;

      //     // Assume emotions are stored as an array of emotion names under each category
      //     const emotions = annotation.value[category]; // Assuming this is now directly accessing the array of emotions
      //     emotions.forEach((emotion) => {
      //       // Update emotion distribution, now correctly referencing emotion names
      //       distributionOfEmotions[category + " - " + emotion] =
      //         (distributionOfEmotions[category + " - " + emotion] || 0) + 1;
      //     });
      //   });
      // });

      // const sortableCategories = Object.entries(distributionOfCategories);
      // const sortedCategories = sortableCategories.sort(([, a], [, b]) => a - b);
      // const sortedDistributionOfCategories = Object.fromEntries(
      //   sortedCategories,
      // );

      // const sortableEmotions = Object.entries(distributionOfEmotions);
      // const sortedEmotions = sortableEmotions.sort(([, a], [, b]) => a - b);
      // const sortedDistributionOfEmotions = Object.fromEntries(sortedEmotions);

      setAnnotations(data); // Update state with fetched data
      setStatistics({
        total_annotations: numAnnotations,
        distribution: distributionOfFiles,
        distributionOfAnnotators: distributionOfAnnotators,
        // distributionOfCategories: sortedDistributionOfCategories,
        // distributionOfEmotions: sortedDistributionOfEmotions,
        number_of_files: number_of_files,
      });
    } else {
      console.error("Failed to fetch annotations");
    }
  };

  // // Fetch data on component mount
  // useEffect(() => {
  //   getAnnotations();
  // }, []); // Empty dependency array means this effect runs once on mount

  // Render the fetched data

  return (
    <div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 sm:gap-4 sm:p-4">
        {props.projects.map((project: ProjectData) => (
          <div>
            <a
              href={`/analysis?token=SDFlskdjkillx%C3%B6O45ccv&project=${project.folder}`}
            >
              <button class="w-full bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mb-2">
                Go to {project.folder} analysis
              </button>
            </a>
            <button
              key={project.folder}
              onClick={() => getAnnotations(project.folder)}
              class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
            >
              {project.folder}
            </button>
            <button
              onClick={() => deleteAllAnnotations(project.folder)}
              class="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete all {project.folder} annotations
            </button>
          </div>
        ))}
      </div>

      {statistics && (
        <div>
          <div class="max-w-md mx-auto bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden md:max-w-xl my-2 p-5">
            <h2 class="text-xl font-semibold text-gray-800">
              Annotation Statistics
            </h2>
            <div class="my-3">
              <p>
                Total number of annotated images:{" "}
                <span class="font-semibold">
                  {statistics.total_annotations}
                </span>
              </p>
            </div>
            <div class="mt-4">
              <h3 class="font-semibold text-gray-800">
                Annotations per Annotator
              </h3>
              <ul class="list-disc list-inside">
                {Object.entries(statistics.distributionOfAnnotators).map((
                  [annotator, count],
                ) => (
                  <li key={annotator}>
                    <b>{annotator}</b>: {count}
                  </li>
                ))}
              </ul>
            </div>

            <div class="mt-4">
              {
                /*
              <h3 class="font-semibold text-gray-800">
                Distribution of Categories
              </h3>
              <div class="overflow-x-auto mt-2">
                <table class="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Count
                      </th>
                      <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(statistics.distributionOfCategories).map((
                      [category, count],
                    ) => (
                      <tr key={category}>
                        <td class="px-5 py-2 border-b border-gray-200 bg-white text-sm">
                          <b class="text-gray-900">{category}</b>
                        </td>
                        <td class="px-5 py-2 border-b border-gray-200 bg-white text-sm">
                          {count}
                        </td>
                        <td class="px-5 py-2 border-b border-gray-200 bg-white text-sm">
                          {(count / statistics.number_of_files * 100).toFixed(
                            1,
                          )}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div> */
              }

              {
                /* <div class="mt-4">
              <h3 class="font-semibold text-gray-800">
                Distribution of Emotions
              </h3>
              <div class="overflow-x-auto mt-2">
                <table class="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Emotion
                      </th>
                      <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Count
                      </th>
                      <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(statistics.distributionOfEmotions).map((
                      [emotion, count],
                    ) => (
                      <tr key={emotion}>
                        <td class="px-5 py-2 border-b border-gray-200 bg-white text-sm">
                          <b class="text-gray-900">{emotion}</b>
                        </td>
                        <td class="px-5 py-2 border-b border-gray-200 bg-white text-sm">
                          {count}
                        </td>
                        <td class="px-5 py-2 border-b border-gray-200 bg-white text-sm">
                          {(count / statistics.number_of_files * 100).toFixed(
                            1,
                          )}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div> */
              }

              <div class="mt-4">
                <h3 class="font-semibold text-gray-800">
                  Distribution of Files
                </h3>
                <ul class="list-disc list-inside">
                  {Object.entries(statistics.distribution).map((
                    [file, count],
                  ) => (
                    <li key={file}>
                      <b>{file}</b>: {count}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div class="mt-2">
              <button
                onClick={downloadAnnotationsAsJsonl}
                class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Download Annotations as JSONL
              </button>
            </div>
          </div>
        </div>
      )}

      {
        /* {annotations && (
        <div>
          {JSON.stringify(annotations)}
        </div>
      )} */
      }

      {annotations && (
        <div class="mb-8">
          {annotations.map((annotation: Annotation) => (
            <div>
              <div class="mx-2 mt-4 bg-gray-600 py-2 text-white flex justify-center rounded-t-md">
                {JSON.stringify(annotation.key)}
              </div>
              <div class="mx-2 bg-gray-100 rounded-b-md">
                <ul>
                  {Object.entries(annotation.value).map(([k, v]) => (
                    <li class="flex justify-between mx-8">
                      <div>
                        {k}
                      </div>
                      <div>
                        {v}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {
        /* {statistics && (<div>
        {JSON.stringify(statistics)}
      </div>)}

      <div>
        {annotations && (
          <pre class="p-4 bg-gray-100 rounded overflow-auto">
        {JSON.stringify(annotations, null, 2)}
          </pre> // Pretty print the object
        )}
      </div> */
      }
    </div>
  );
}
