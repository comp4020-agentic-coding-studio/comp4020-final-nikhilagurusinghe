"use client";

import ComboBox, { ComboBoxOptions } from "./combo-box";
import SliderDropdown, { SliderMinMax, SliderValues } from "./slider-dropdown";
import { useState } from "react";

type FilterProps = {
  classificationOptions: ComboBoxOptions;
  generaOptions: ComboBoxOptions;
  heightMinMax: SliderMinMax;
  crownRadMinMax: SliderMinMax;
  diameterMinMax: SliderMinMax;
  ageOptions: ComboBoxOptions;
  structureOptions: ComboBoxOptions;
};

export default function Filters({
  classificationOptions,
  generaOptions,
  heightMinMax,
  crownRadMinMax,
  diameterMinMax,
  ageOptions,
  structureOptions,
}: FilterProps) {
  const [selectedClassifications, setSelectedClassifications] =
    useState<ComboBoxOptions>([]);
  const [selectedGenera, setSelectedGenera] = useState<ComboBoxOptions>([]);
  const [selectedHeights, setSelectedHeights] = useState<SliderValues>({startValue: heightMinMax.min, endValue: heightMinMax.max});
  const [selectedCrownRads, setSelectedCrownRads] = useState<SliderValues>({startValue: crownRadMinMax.min, endValue: crownRadMinMax.max});
  const [selectedDiameters, setSelectedDiameters] = useState<SliderValues>({startValue: diameterMinMax.min, endValue: diameterMinMax.max});
  const [selectedAges, setSelectedAges] = useState<ComboBoxOptions>([]);
  const [selectedStructures, setSelectedStructures] = useState<ComboBoxOptions>([]);

  return (
    <div className="z-100 absolute w-full top-0 left-0 right-0 h-30 from-black/60 via-black/10 to-transparent text-white bg-linear-to-b overflow-x-auto overflow-y-visible scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex flex-row gap-x-2.5 mt-5 ml-4 w-auto items-center justify-start">
        <ComboBox
          options={classificationOptions}
          ariaLabel="Choose classification to filter by"
          label="classification"
          labelDescription="The classification of the tree species."
          selectedOptions={selectedClassifications}
          setSelectedOptions={setSelectedClassifications}
        />
        <ComboBox
          options={generaOptions}
          ariaLabel="Choose genuses to filter by"
          label="genera"
          labelDescription="The genus of the tree species."
          selectedOptions={selectedGenera}
          setSelectedOptions={setSelectedGenera}
        />
        <SliderDropdown
          label="height"
          labelDescription="The height of the tree."
          unitsOfMeasurement="metres"
          unitAbbreviation="m"
          sliderMin={heightMinMax.min}
          sliderMax={heightMinMax.max}
          sliderValues={selectedHeights}
          setSliderValues={setSelectedHeights}
        />
        <SliderDropdown
          label="crown radius"
          labelDescription="The radius of the tree at the widest part of its canopy."
          unitsOfMeasurement="metres"
          unitAbbreviation="m"
          sliderMin={crownRadMinMax.min}
          sliderMax={crownRadMinMax.max}
          sliderValues={selectedCrownRads}
          setSliderValues={setSelectedCrownRads}
        />
        <SliderDropdown
          label="trunk diameter"
          labelDescription="The radius of the tree at the widest part of its canopy."
          unitsOfMeasurement="centimetres"
          unitAbbreviation="cm"
          sliderMin={diameterMinMax.min}
          sliderMax={diameterMinMax.max}
          sliderValues={selectedDiameters}
          setSliderValues={setSelectedDiameters}
        />
        <ComboBox
          options={ageOptions}
          ariaLabel="Choose age to filter by"
          label="age"
          labelDescription="The age of the tree."
          selectedOptions={selectedAges}
          setSelectedOptions={setSelectedAges}
        />
        <ComboBox
          options={structureOptions}
          ariaLabel="Choose structure to filter by"
          label="structure"
          labelDescription="The structure of the tree."
          selectedOptions={selectedStructures}
          setSelectedOptions={setSelectedStructures}
        />
      </div>
    </div>
  );
}
