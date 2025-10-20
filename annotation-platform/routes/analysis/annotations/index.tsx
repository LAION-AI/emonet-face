import { Handlers, PageProps } from "$fresh/server.ts";
import { handler as getData } from "../../api/analysis.ts";

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
  email_count: { [image: string]: number };
}

const processDataToImageEmailCount = (
  data: ProjectAnnotation[],
): { [image: string]: number } => {
  //   console.log(data);

  const result: { [email: string]: number } = {};

  data.forEach(({ key: [_project, email, imageName] }) => {
    if (Object.keys(result).includes(email)) {
      result[email] += 1;
    } else {
      result[email] = 1;
    }
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

  const email_count = processDataToImageEmailCount(data);

  return { count, total, email_count };
};

export const handler: Handlers<PreprocessDataReturn> = {
  async GET(_req, _ctx) {
    const url = new URL(_req.url);
    const token = url.searchParams.get("token") ?? "";
    const project = url.searchParams.get("project") ?? "";
    console.log(token, project);
    const response = await getData(_req, _ctx);
    const data = await response.json();
    // const email_count = processDataToImageEmailCount(data);
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
  const email_count: { [email: string]: number } = props.data.email_count;
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

  console.log(email_count);

  return (
    <div class="max-w-4xl mx-auto mt-8">
      <div class="flex items-center justify-between bg-slate-800 text-white py-3 px-4 rounded-t-lg">
        <div class="w-2/3">E-Mail</div>
        <div class="w-1/3">Annotations</div>
      </div>
      {Object.entries(email_count).map(([email, count], index) => (
        <div
          class={`flex items-center justify-between ${
            index % 2 === 0 ? "bg-white" : "bg-gray-100"
          } border-b last:border-b-0 py-2 px-4`}
        >
          <div class="w-2/3 text-gray-800">{email}</div>
          <div class="w-1/3 text-right text-gray-600">{count}</div>
        </div>
      ))}
      {/* add a download button as csv that contains the email_count */}
      <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(Object.entries(email_count).map(([email, count]) => `${email},${count}`).join("\n"))}`} download="email_count.csv" class="block bg-slate-800 text-white py-2 px-4 rounded-b-lg text-center">Download CSV</a>
      {
        /* <div>
        {JSON.stringify(project)}
      </div>
      <div>
        {JSON.stringify(count)}
      </div>
      <div>
        {JSON.stringify(total)}
      </div> */
      }
      {
        /* <div>
        {JSON.stringify(email_count)}
      </div> */
      }
    </div>
  );
}
