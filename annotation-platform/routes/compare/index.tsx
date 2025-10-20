import { Handlers, PageProps } from "$fresh/server.ts";
import { CompareProjects } from "../../components/CompareProjects.tsx";

  const compareDataList = [
    "stance-detection-part-1",
    "stance-detection-part-2",
    "stance-detection-part-3",
    "stance-detection-part-4",
    "stance-detection-part-5",
    "stance-detection-part-6",
    "stance-detection-part-7",
    "stance-detection-part-8",
    "stance-detection-part-9",
    "stance-detection-part-10",
  ]

export default function DashboardPage(props: PageProps<string[]>) {
  // return <BinaryProjects projects={props.data} />;
  return <CompareProjects data={compareDataList} />;
}
