// import { AnnotationProjectCard } from "./AnnotationProjectCard.tsx";

// export function AnnotationProjects(props: { projects: ProjectDataList | null }) {
export function AnnotationProjects() {
  return (
    <div class="flex flex-wrap justify-center gap-4 p-4">
      <p class="text-center w-full mb-4">
        Here you can find a list of annotation projects we are currently working
        on.
      </p>
      <p class="flex w-full mb-4 justify-center">
        <a href="/binary" class="rounded-md shadow-md p-4 text-black">Binary classification</a>
      </p>
      <p class="flex w-full mb-4 justify-center">
        <a href="/audio" class="rounded-md shadow-md p-4 text-black">Audio classification</a>
      </p>
      {/* <p class="flex w-full mb-4 justify-center">
        <a href="/binary-round-two" class="rounded-md shadow-md p-4 text-black">Binary classification Round Two</a>
      </p> */}
      {/* {props.projects?.map((project) => (<AnnotationProjectCard {...project} />))} */}
    </div>
  );
}
