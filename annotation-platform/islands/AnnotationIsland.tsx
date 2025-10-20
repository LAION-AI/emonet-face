import { useEffect, useState } from "preact/hooks";
import { Slider } from "../components/Slider.tsx";

interface AnnotationIslandProps {
  buttons: { [category: string]: string[] };
  labels: { [key: string]: string[] };
  reverseButtons: { [emotion: string]: string[] };
  images: string[];
  user: string;
  project: string;
}

interface SelectedCategoriesType {
  [key: string]: string[];
}

interface SliderValues {
  [key: string]: number;
}

// interface SelectedCategoriesType {
//   [key: string]: string[];
// }

export default function AnnotationIsland(
  { buttons, labels, images, user, project }: AnnotationIslandProps,
) {
  const [slidersValues, setSlidersValues] = useState<SliderValues>({});
  const [previousSlidersValues, setPreviousSlidersValues] = useState<
    SliderValues
  >({});
  const [selectedCategories, setSelectedCategories] = useState<
    SelectedCategoriesType
  >({});
  const [_previousSelectedCategories, setPreviousSelectedCategories] = useState<
    SelectedCategoriesType
  >({});
  const [image, setImage] = useState<string>("");
  const [_autoexpandCategories, setAutoexpandCategories] = useState<Set<string>>(
    new Set(),
  );
  const total = images.length;

  useEffect(() => {
    const getLastAnnotatedImage = async () => {
      const r = await fetch(
        `/api/db?project=${project}&user=${user}&method=lastAnnotation`,
      );
      const data = await r.json();
      if (data.lastImage !== "") {
        const ind = images.indexOf(data.lastImage);
        if (ind !== total - 1) {
          setImage(images[ind + 1]);
        } else {
          setImage(images[0]);
        }
      } else {
        setImage(images[0]);
      }
    };
    getLastAnnotatedImage();
  }, []);

  const getSelectedCategories = async () => {
    const r = await fetch(
      `/api/db?project=${project}&user=${user}&file=${image}&method=currentAnnotation`,
    );
    const data = await r.json();
    if (data.value !== null) {
      const processedCategories: SelectedCategoriesType = {};
      const processedSliderValues: SliderValues = {};
      Object.entries(data.value).forEach(([key, value]) => {
        processedSliderValues[key] = Number(value);
        const [category, emotion, _] = key.split("|");
        if (processedCategories[category]) {
          if (!processedCategories[category].includes(emotion)) {
            processedCategories[category].push(emotion);
          }
        } else {
          processedCategories[category] = [emotion];
        }
      });
      setSlidersValues(processedSliderValues);
      setPreviousSlidersValues(processedSliderValues);
      setSelectedCategories(processedCategories);
      setPreviousSelectedCategories(processedCategories);
    } else {
      setSlidersValues({});
      setPreviousSlidersValues({});
      setSelectedCategories({});
      setPreviousSelectedCategories({});
    }
  };

  useEffect(() => {
    getSelectedCategories();
    setAutoexpandCategories(new Set());
  }, [image]);

  const submitOnButtonClickWithoutAnnotation = (i: number) => {
    if (i === 1 && images.indexOf(image) === images.length - 1) {
      setImage(images[0]);
    } else if (i === -1 && images.indexOf(image) + i < 0) {
      setImage(images[images.length - 1]);
    } else {
      setImage(images[images.indexOf(image) + i]);
    }
  };

  const processSliderChange = (
    category: string,
    emotion: string,
    value: number,
  ) => {
    console.log(value, category, emotion);
    setSlidersValues({
      ...slidersValues,
      [`${category}|${emotion}`]: value,
    });
  };

  const submitOnButtonClick = async () => {
    if (Object.keys(slidersValues).length == 0) {
      alert("You need to annotate first before you can submit your annotation!");
    } else {
      const data = {
        project: project,
        user: user,
        file: image,
        // annotation: selectedCategories,
        annotation: slidersValues,
      };
      if (
        JSON.stringify(slidersValues) !==
          JSON.stringify(previousSlidersValues)
      ) {
        console.log("OVERWRITING WITH THE FOLLOWING SLIDERS VALUES");
        console.log(slidersValues);
        await setNewAnnotation(data);
      }
      if (images.indexOf(image) === total - 1) {
        setImage(images[0]);
        alert(
          "You have successfully annotated the last file. Thank you! If you annotate the same file again, your previous annotations will be overwritten on submission.",
        );
      } else {
        setImage(images[images.indexOf(image) + 1]);
      }
    }
  };

  const setNewAnnotation = async (data: object) => {
    const _r = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const _toggleEmotion = (category: string, emotion: string) => {
    const newSelectedCategories = { ...selectedCategories };
    if (newSelectedCategories[category]) {
      if (newSelectedCategories[category].includes(emotion)) {
        newSelectedCategories[category] = newSelectedCategories[category]
          .filter(
            (e) => e !== emotion,
          );
      } else {
        newSelectedCategories[category].push(emotion);
      }
    } else {
      newSelectedCategories[category] = [emotion];
    }
    setSelectedCategories(newSelectedCategories);
  };

  const toggleCategorySelection = (category: string) => {
    const newSelectedCategories = { ...selectedCategories };
    if (newSelectedCategories[category]) {
      delete newSelectedCategories[category];
    } else {
      newSelectedCategories[category] = [];
    }
    setSelectedCategories(newSelectedCategories);
  };

  return (image == "" ? <div>Loading</div> : (
    <div class="mx-auto 2xl:mb-16">
      <div class="flex flex-wrap justify-center">
        <div class="w-full h-1 bg-gray-200">
          <div
            style={{
              width: `${(images.indexOf(image) + 1) / images.length * 100}%`,
            }}
            class="h-full bg-green-500"
          >
          </div>
        </div>
        <div class="w-full flex bg-gray-200 justify-between">
          <button
            class="px-2 text-sm min-w-16 text-center"
            onClick={() => submitOnButtonClickWithoutAnnotation(-1)}
          >
            <svg
              class="h-6 w-6 inline-block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              >
              </path>
            </svg>
          </button>
          <select
            class="h-full text-sm cursor-pointer"
            value={image}
            onChange={(e) =>
              setImage((e.target as HTMLInputElement)?.value.toString() || "")}
          >
            {images.map((img, index) => (
              <option key={index} value={img}>
                {index + 1} / {total}
              </option>
            ))}
          </select>
          <div class="hidden md:block text-sm">
            Only emotions{" "}
            <span class="bg-blue-500 text-white px-1 rounded-sm">
              highlighted in blue
            </span>{" "}
            will be recorded on{" "}
            <span class="bg-green-200 px-1 rounded-sm">Submit and Proceed</span>
            {" "}
            click!
          </div>
          <button
            class="px-2 text-sm min-w-16 text-center"
            onClick={() => submitOnButtonClickWithoutAnnotation(1)}
          >
            <svg
              class="h-6 w-6 inline-block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              >
              </path>
            </svg>
          </button>
        </div>
        <div class="inline-block mx-auto sm:rounded-lg overflow-hidden md:max-w-7xl sm:mt-4 md:mx-2">
          <div class="flex items-center justify-center align-middle">
            <img
              class="max-h-[520px] md:rounded-lg"
              src={`YOUR_API_ENDPOINT_HERE/${project}/images/${image}`}
              alt="Project Image to annotate"
            />
            <img
              class="h-0 w-0 hidden"
              src={`YOUR_API_ENDPOINT_HERE/${project}/images/${
                images[(images.indexOf(image) + 1) % images.length]
              }?raw=true`}
              alt="Preloaded project image to annotate"
            />
            {
              /* {Object.keys(slidersValues).length > 0 && (
              <button
                class="bg-green-200 py-2 px-6 flex-col rounded-full h-28 hover:bg-green-300 hidden 2xl:block ml-24"
                onClick={() => submitOnButtonClick()}
              >
                <div>Submit</div>
                <div>and</div>
                <div>Proceed</div>
              </button>
            )} */
            }
          </div>
          <div class="flex flex-wrap rounded-xl w-full m-0 md:mt-2 bg-gray-500 md:pt-4">
            {Object.keys(buttons).map((category) => (
              <div key={category} class="flex-grow">
                <button
                  onClick={() =>
                    toggleCategorySelection(category)}
                  class={`w-full px-2 py-1 text-white text-sm md:text-base ${
                    Object.keys(selectedCategories).includes(category)
                      ? "bg-blue-500"
                      : "bg-gray-400"
                  }`}
                >
                  {category}
                </button>
              </div>
            ))}
          </div>
          {/* {JSON.stringify(slidersValues)} */}
        </div>
      </div>
      <div class="flex flex-wrap justify-evenly md:space-x-2 mx-auto max-w-[1680px] mb-4">
        {Object.keys(selectedCategories).map((category: string) => (
          <div class="w-full">
            <div class="bg-gray-50 rounded-md md:mx-2">
              <div class="bg-blue-500 text-white w-full md:rounded-t-md py-1 md:mt-4 font-bold">
                {category}
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {buttons[category].map((emotion: string) => (
                  <Slider
                    title={emotion}
                    labels={labels}
                    min={1}
                    max={7}
                    val={Object.keys(slidersValues).includes(
                        `${category}|${emotion}`,
                      )
                      ? slidersValues[`${category}|${emotion}`] + 1
                      : 1}
                    onChange={(e) =>
                      processSliderChange(
                        category,
                        emotion,
                        Number((e.target as HTMLInputElement).value),
                      )}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div>
        <button
          class="bg-green-200 py-4 px-4 mt-4 mb-12 rounded-lg md:w-auto md:py-4 md:px-8 hover:bg-green-300"
          onClick={() => submitOnButtonClick()}
        >
          Submit and Proceed
        </button>
      </div>
    </div>
  ));
}
