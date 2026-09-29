import genus from "@/test_data/genus";
import ComboBox, { ComboBoxOptions } from "./combo-box";
import SliderDropdown from "./slider-dropdown";
import "dotenv/config";
import {
  getAgeOptions,
  getClassificationOptions,
  getGeneraOptions,
  getMaxMinCrownRadius,
  getMaxMinDBH,
  getMaxMinHeight,
  getStructureOptions,
} from "@/app/data/get-filter-options";

export default async function Filters() {
  return (
    <div className="z-100 absolute w-full top-0 left-0 right-0 h-30 from-black/60 via-black/10 to-transparent text-white bg-linear-to-b overflow-x-auto overflow-y-visible scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex flex-row gap-x-2.5 mt-5 ml-4 w-auto items-center justify-start">
        <ComboBox
          options={await getClassificationOptions()}
          ariaLabel="Choose classification to filter by"
          label="classification"
          labelDescription="The classification of the tree species."
        />
        <ComboBox
          options={await getGeneraOptions()}
          ariaLabel="Choose genuses to filter by"
          label="genera"
          labelDescription="The genus of the tree species."
        />
        <SliderDropdown
          label="height"
          labelDescription="The height of the tree."
          unitsOfMeasurement="metres"
          unitAbbreviation="m"
          sliderMin={(await getMaxMinHeight()).min}
          sliderMax={(await getMaxMinHeight()).max}
        />
        <SliderDropdown
          label="crown radius"
          labelDescription="The radius of the tree at the widest part of its canopy."
          unitsOfMeasurement="metres"
          unitAbbreviation="m"
          sliderMin={(await getMaxMinCrownRadius()).min}
          sliderMax={(await getMaxMinCrownRadius()).max}
        />
        <SliderDropdown
          label="trunk diameter"
          labelDescription="The radius of the tree at the widest part of its canopy."
          unitsOfMeasurement="metres"
          unitAbbreviation="m"
          sliderMin={(await getMaxMinDBH()).min}
          sliderMax={(await getMaxMinDBH()).max}
        />
        <ComboBox
          options={await getAgeOptions()}
          ariaLabel="Choose age to filter by"
          label="age"
          labelDescription="The age of the tree."
        />
        <ComboBox
          options={await getStructureOptions()}
          ariaLabel="Choose structure to filter by"
          label="structure"
          labelDescription="The structure of the tree."
        />
      </div>
    </div>
  );
}
