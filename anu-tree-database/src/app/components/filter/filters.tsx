"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ComboBox, { ComboBoxOptions } from "./combo-box";
import SliderDropdown, { SliderMinMax, SliderValues } from "./slider-dropdown";
import { Dispatch, SetStateAction, useState } from "react";
import queryString from "query-string";

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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleComboBoxChange(
    paramName: string,
    newOptions: ComboBoxOptions,
  ): void {
    const params = new URLSearchParams(searchParams);
    if (newOptions.length > 0) {
      params.set(paramName, newOptions.map(({ value }) => value).join(","));
    } else {
      params.delete(paramName);
    }

    replace(`${pathname}?${params.toString()}`);
  }

  function handleSliderChange(
    paramName: string,
    newValues: SliderValues,
    defaultValues: SliderValues,
  ): void {
    const params = new URLSearchParams(searchParams);
    if (
      newValues.startValue !== defaultValues.startValue ||
      newValues.endValue !== defaultValues.endValue
    ) {
      params.set(paramName, newValues.startValue + "," + newValues.endValue);
    } else {
      params.delete(paramName);
    }

    replace(`${pathname}?${params.toString()}`);
  }

  const generaParams: string | null = searchParams.get("genus");
  const selectedGenera: ComboBoxOptions = (
    generaParams ? generaParams.split(",") : []
  ).map((val) => ({ value: val }));
  const classificationsParams: string | null =
    searchParams.get("classification");
  const selectedClassifications: ComboBoxOptions = (
    classificationsParams ? classificationsParams.split(",") : []
  ).map((val) => ({ value: val }));
  const agesParams: string | null = searchParams.get("age");
  const selectedAges: ComboBoxOptions = (
    agesParams ? agesParams.split(",") : []
  ).map((val) => ({ value: val }));
  const structuresParams: string | null = searchParams.get("structure");
  const selectedStructures: ComboBoxOptions = (
    structuresParams ? structuresParams.split(",") : []
  ).map((val) => ({ value: val }));

  const heightsParams: string | null = searchParams.get("height");
  const heightsDefaultValue: SliderValues = {
    startValue: heightMinMax.min,
    endValue: heightMinMax.max,
  };
  const selectedHeights: SliderValues = heightsParams
    ? {
        startValue: Number(heightsParams.split(",")[0]),
        endValue: Number(heightsParams.split(",")[1]),
      }
    : heightsDefaultValue;

  const crownRadsParams: string | null = searchParams.get("radius");
  const crownRadsDefaultValue: SliderValues = {
    startValue: crownRadMinMax.min,
    endValue: crownRadMinMax.max,
  };
  const selectedCrownRads: SliderValues = crownRadsParams
    ? {
        startValue: Number(crownRadsParams.split(",")[0]),
        endValue: Number(crownRadsParams.split(",")[1]),
      }
    : crownRadsDefaultValue;

  const diametersParams: string | null = searchParams.get("radius");
  const diametersDefaultValue: SliderValues = {
    startValue: diameterMinMax.min,
    endValue: diameterMinMax.max,
  };
  const selectedDiameters: SliderValues = diametersParams
    ? {
        startValue: Number(diametersParams.split(",")[0]),
        endValue: Number(diametersParams.split(",")[1]),
      }
    : diametersDefaultValue;

  return (
    <div className="z-100 absolute w-full top-0 left-0 right-0 h-30 from-black/60 via-black/10 to-transparent text-white bg-linear-to-b overflow-x-auto overflow-y-visible scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex flex-row gap-x-2.5 mt-5 ml-4 w-auto items-center justify-start">
        <ComboBox
          options={classificationOptions}
          ariaLabel="Choose classification to filter by"
          label="classification"
          labelDescription="The classification of the tree species."
          selectedOptions={selectedClassifications}
          setSelectedOptions={(newOptions: ComboBoxOptions) =>
            handleComboBoxChange("classification", newOptions)
          }
        />
        <ComboBox
          options={generaOptions}
          ariaLabel="Choose genuses to filter by"
          label="genera"
          labelDescription="The genus of the tree species."
          selectedOptions={selectedGenera}
          setSelectedOptions={(newOptions: ComboBoxOptions) =>
            handleComboBoxChange("genus", newOptions)
          }
        />
        <SliderDropdown
          label="height"
          labelDescription="The height of the tree."
          unitsOfMeasurement="metres"
          unitAbbreviation="m"
          sliderMin={heightMinMax.min}
          sliderMax={heightMinMax.max}
          sliderValues={selectedHeights}
          setSliderValues={(newValues: SliderValues) =>
            handleSliderChange("height", newValues, heightsDefaultValue)
          }
        />
        <SliderDropdown
          label="crown radius"
          labelDescription="The radius of the tree at the widest part of its canopy."
          unitsOfMeasurement="metres"
          unitAbbreviation="m"
          sliderMin={crownRadMinMax.min}
          sliderMax={crownRadMinMax.max}
          sliderValues={selectedCrownRads}
          setSliderValues={(newValues: SliderValues) =>
            handleSliderChange("radius", newValues, crownRadsDefaultValue)
          }
        />
        <SliderDropdown
          label="trunk diameter"
          labelDescription="The radius of the tree at the widest part of its canopy."
          unitsOfMeasurement="centimetres"
          unitAbbreviation="cm"
          sliderMin={diameterMinMax.min}
          sliderMax={diameterMinMax.max}
          sliderValues={selectedDiameters}
          setSliderValues={(newValues: SliderValues) =>
            handleSliderChange("diameter", newValues, diametersDefaultValue)
          }
        />
        <ComboBox
          options={ageOptions}
          ariaLabel="Choose age to filter by"
          label="age"
          labelDescription="The age of the tree."
          selectedOptions={selectedAges}
          setSelectedOptions={(newOptions: ComboBoxOptions) =>
            handleComboBoxChange("age", newOptions)
          }
        />
        <ComboBox
          options={structureOptions}
          ariaLabel="Choose structure to filter by"
          label="structure"
          labelDescription="The structure of the tree."
          selectedOptions={selectedStructures}
          setSelectedOptions={(newOptions: ComboBoxOptions) =>
            handleComboBoxChange("structure", newOptions)
          }
        />
      </div>
    </div>
  );
}
