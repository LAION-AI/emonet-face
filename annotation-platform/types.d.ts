interface AnnotationData {
  user: string;
  project: string;
  file: string;
  annotation: object;
}

interface ProjectData {
  title: string;
  folder: string;
  description: string;
}

type ProjectDataList = ProjectData[];

interface AudioAnnotationData {
  url: string;
  name: string;
}

interface AudioAnnotationDataList extends Array<AudioAnnotationData> {}

interface BinaryAnnotationData {
  download_url?: string;
  name?: string;
}

interface BinaryAnnotationDataList extends Array<BinaryAnnotationData> {}
