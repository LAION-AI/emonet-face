import { JSX } from "preact";
import { useState } from "preact/hooks";

export function Slider(
  props: JSX.HTMLAttributes<HTMLInputElement> & {
    title: string;
    labels: { [key: string]: string[] };
    min: number;
    max: number;
    val: number;
  },
) {
  const { title, labels, min, max, val, ...inputProps } = props;
  const [value, setValue] = useState(val - 1);

  // Update the value state on slider change
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setValue(Number(target.value));
  };

  return (
    <div class="flex flex-col w-full items-center space-y-2 mx-auto px-4 py-2 justify-between">
      {/* max-w-md  */}
      <div class="flex flex-col w-full bg-gray-100 px-2 py-1 rounded-sm">
        <label
          class={`text-sm md:text-base font-medium text-left ${
            value == 0 ? "text-gray-400" : "text-gray-700"
          }`}
        >
          {title}
        </label>
        <div class={`w-full flex justify-center flex-wrap rounded-md py-1 ${
            value == 0 ? "text-gray-400" : "text-gray-700"
          }`}>
          {labels[title].map((item) => (<div class="mx-2">
            {item}
            </div>))}
        </div>
      </div>
      <div class="w-full mx-4 flex justify-center items-center">
        <div
          class={`rounded-full text-white h-6 w-7 text-center align-middle text-small mr-4 ${
            value == 0 ? "bg-gray-200" : "bg-blue-500"
          }`}
        >
          {value == 0 ? "" : value}
        </div>
        <input
          type="range"
          min={min - 1}
          max={max}
          value={value}
          onInput={handleChange}
          {...inputProps}
          class="slider appearance-none w-full h-2 bg-gray-300 rounded outline-none opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-0 focus:shadow-none transition-opacity duration-200 cursor-pointer"
        />
      </div>
    </div>
  );
}

{
  /* <div class="flex items-center space-x-4 max-w-md mx-auto px-4 py-2 justify-between">
<div class="flex flex-col">
  <label
    class={`text-sm md:text-base font-medium text-left ${
      value == 0 ? "text-gray-400" : "text-gray-700"
    }`}
  >
    {title}
  </label>
  <div>
    {labels[title]}
  </div>
</div>
<div class="flex items-center space-x-4">
  <div
    class={`rounded-full text-white h-6 w-6 text-center align-middle ${
      value == 0 ? "bg-gray-200" : "bg-blue-500"
    }`}
  >
    {value == 0 ? "" : value}
  </div>
  <div class="relative w-40 mr-8">
    <input
      type="range"
      min={min - 1}
      max={max}
      value={value}
      onInput={handleChange}
      {...inputProps}
      class="slider appearance-none w-full h-2 bg-gray-300 rounded outline-none opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-0 focus:shadow-none transition-opacity duration-200 cursor-pointer"
    />
  </div>
</div>
</div> */
}
