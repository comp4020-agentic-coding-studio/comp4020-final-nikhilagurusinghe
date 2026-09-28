import genus from "@/test_data/genus";
import ComboBox from "./combo-box";
import SliderDropdown from "./slider-dropdown";

export default function Filters() {
  return (
    <div className="z-100 absolute w-full top-0 left-0 right-0 h-30 from-black/60 via-black/10 to-transparent text-white bg-linear-to-b overflow-x-auto overflow-y-visible scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex flex-row gap-x-2.5 mt-5 ml-4 w-auto items-center justify-start">
        <ComboBox
          options={genus}
          ariaLabel="Choose classification to filter by"
          label="classification"
          labelDescription="The classification of the tree species."
        />
        <ComboBox
          options={genus}
          ariaLabel="Choose genuses to filter by"
          label="genera"
          labelDescription="The genus of the tree species."
        />
        <SliderDropdown
          label="height"
          labelDescription="The height of the tree."
          unitsOfMeasurement="metres"
          unitAbbreviation="m"
          sliderMin={0}
          sliderMax={50}
        />
        <SliderDropdown
          label="crown radius"
          labelDescription="The radius of the tree at the widest part of its canopy."
          unitsOfMeasurement="metres"
          unitAbbreviation="m"
          sliderMin={0}
          sliderMax={50}
        />
        <SliderDropdown
          label="trunk diameter"
          labelDescription="The radius of the tree at the widest part of its canopy."
          unitsOfMeasurement="metres"
          unitAbbreviation="m"
          sliderMin={0}
          sliderMax={50}
        />
        <ComboBox
          options={genus}
          ariaLabel="Choose age to filter by"
          label="age"
          labelDescription="The age of the tree."
        />
        <ComboBox
          options={genus}
          ariaLabel="Choose structure to filter by"
          label="structure"
          labelDescription="The structure of the tree."
        />
      </div>
    </div>
  );
}
