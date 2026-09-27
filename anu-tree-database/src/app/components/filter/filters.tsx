import genus from "@/test_data/genus";
import ComboBox from "./combo-box";
import SliderDropdown from "./slider-dropdown";

export default function Filters() {
  return (
    <div className="absolute flex flex-row gap-x-2.5 h-10 mt-5 ml-4 items-center justify-center">
      <ComboBox
        options={genus}
        ariaLabel="Choose genuses to filter by"
        label="genera"
      />
      <SliderDropdown label="canopy radius" sliderMin={0} sliderMax={50} />

      <div></div>
    </div>
  );
}
