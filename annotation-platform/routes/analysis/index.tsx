import { Handlers, PageProps } from "$fresh/server.ts";
import { SevenBar } from "../../components/SevenBar.tsx";
import { handler as getData } from "../api/analysis.ts";

// interface PreprocessedItem {
// 	category: string;
// 	emotion: string;
// 	agreement: number;
// }

// interface PreprocessedData {
// 	img: string;
// 	annotation: PreprocessedItem[];
// }

// interface ProjectAnnotation {
//   key: [string, string, string]; // [project, email, imageName]
//   value: { [category: string]: number };
//   versionstamp: string;
// }

// interface ProcessedData {
//   [image: string]: { [category: string]: Set<string> }; // Using Set to track unique emails
// }

interface ProjectAnnotation {
  key: [string, string, string]; // [project, email, imageName]
  value: { [category: string]: number };
  versionstamp: string;
}

interface ProcessedData {
  [image: string]: { [category: string]: Set<string> }; // Using Set to track unique emails
}

// This type represents the structure for the count of unique emails per category for each image
interface CategoryEmailCount {
  [image: string]: { [category: string]: number };
}

// This type represents the structure for the total count of unique emails for each image
interface TotalEmailCount {
  [image: string]: number;
}

// The return type of preprocessData combines both CategoryEmailCount and TotalEmailCount
interface PreprocessDataReturn {
  count: CategoryEmailCount;
  total: TotalEmailCount;
}

const processDataToImageEmailCount = (
  data: ProjectAnnotation[],
): { [image: string]: number } => {
  const emailCountPerImage: { [image: string]: Set<string> } = {};

  data.forEach(({ key: [_project, email, imageName] }) => {
    if (!emailCountPerImage[imageName]) {
      emailCountPerImage[imageName] = new Set<string>();
    }
    emailCountPerImage[imageName].add(email);
  });

  // Convert the Set of emails into the count of unique emails for each image
  const result: { [image: string]: number } = {};
  Object.keys(emailCountPerImage).forEach((image) => {
    result[image] = emailCountPerImage[image].size;
  });

  return result;
};

const preprocessData = (data: ProjectAnnotation[]): PreprocessDataReturn => {
  const emailCountPerImage: { [image: string]: Set<string> } = {};

  data.forEach(({ key: [_project, email, imageName] }) => {
    if (!emailCountPerImage[imageName]) {
      emailCountPerImage[imageName] = new Set<string>();
    }
    emailCountPerImage[imageName].add(email);
  });

  // Convert Set of emails into count for the total
  const total: TotalEmailCount = {};
  Object.keys(emailCountPerImage).forEach((image) => {
    total[image] = emailCountPerImage[image].size;
  });

  const tempData: ProcessedData = {};

  // Iterate over each annotation to organize data by image and then by category
  data.forEach(({ key: [_project, email, imageName], value }) => {
    if (!tempData[imageName]) {
      tempData[imageName] = {};
    }

    Object.entries(value).forEach(([category]) => {
      if (!tempData[imageName][category]) {
        tempData[imageName][category] = new Set<string>();
      }
      tempData[imageName][category].add(email);
    });
  });

  // Convert Set of emails into count of unique emails for each category
  const count: CategoryEmailCount = {};
  Object.keys(tempData).forEach((image) => {
    count[image] = {};
    Object.keys(tempData[image]).forEach((category) => {
      count[image][category] = tempData[image][category].size;
    });
  });

  return { count, total };
};

export const handler: Handlers<PreprocessDataReturn> = {
  async GET(_req, _ctx) {
    const url = new URL(_req.url);
    const token = url.searchParams.get("token") ?? "";
    const project = url.searchParams.get("project") ?? "";
    console.log(token, project);
    const response = await getData(_req, _ctx);
    const data = await response.json();
    const processedData = preprocessData(data);
    return _ctx.render(processedData);
    // console.log(preprocessData(data));
    // return _ctx.render(data);
  },
};

// export default function Analysis({ data }: PageProps) {
//   return (<div>
// 		<h1>Analysis</h1>
// 		<p>Data: {JSON.stringify(data)}</p>
// 	</div>);
// }

export default function Analysis(props: PageProps<PreprocessDataReturn>) {
  const url = new URL(props.url);
  const project = url.searchParams.get("project") ?? "";
  // const { count: CategoryEmailCount, total: TotalEmailCount } = props.data;
  const count: CategoryEmailCount = props.data.count;
  const total: TotalEmailCount = props.data.total;

  // Helper function to determine the background color based on vote count
  // const getBackgroundColor = (count: number) => {
  //   return count > 1 ? 'bg-green-200' : 'bg-yellow-200';
  // };

  const getAgreementColor = (count: number, total: number) => {
    const agreementPercentage = (count / total) * 100;
    if (agreementPercentage < 50) {
      return "bg-red-200"; // Less than 50% agreement
    } else if (agreementPercentage >= 50 && agreementPercentage <= 75) {
      return "bg-yellow-200"; // Between 50% and 75% agreement
    } else {
      return "bg-green-200"; // Above 75% agreement
    }
  };

  return (
    <div class="w-full justify-center items-center mt-8">
      <div class="flex flex-col justify-center items-center">
        <h1 class="text-2xl font-bold mx-auto">
          {project.toUpperCase()} Analysis
        </h1>
        <p class="text-sm">Total images: {Object.keys(count).length}</p>
        <p class="text-sm">
          Total annotations: {Object.values(total).reduce((a, b) => a + b, 0)}
        </p>
        <ul class="text-sm mb-4">
          <li>Green: At least 75% agreement</li>
          <li>Yellow: 50-75% agreement</li>
          <li>Red: Less than 50% agreement</li>
        </ul>
      </div>
      <div>
        {Object.entries(count).map(([imageName, emotions], index) => {
          const imageUrl =
            `YOUR_ENDPOINT_HERE/${project}/images/${imageName}?raw=true`;
          const totalCount = total[imageName];
          return (
            <div
              key={index}
              class="flex flex-col items-center lg:space-x-4 mb-4"
            >
              <div class="text-gray-800 w-full py-1 flex justify-center">
                {imageName}
              </div>
              <img
                src={imageUrl}
                alt={`Image ${imageName}`}
                class="w-full lg:w-[320px]"
              />
              <div class="rounded-md">
                {Object.entries(emotions as { [s: string]: number }).map((
                  [emotion, count],
                  emotionIndex,
                ) => (
                  <div
                    key={emotionIndex}
                    class={`${count > 1 ? getAgreementColor(count, totalCount) : 'bg-gray-200'} p-2`}
                  >
                    <b>{emotion.split("|")[0]}</b>
                    <span class="ml-4">{emotion.split("|")[1]}</span>
                    <span class="ml-4">
                      {Math.round((count as number) / totalCount * 100)}%
                    </span>
                    <span class="ml-4">
                      ({count} / {totalCount})
                    </span>
                    {/* : <SevenBar count={count} /> */}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
