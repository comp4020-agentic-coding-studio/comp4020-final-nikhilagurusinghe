"use client";

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import clsx from "clsx";
import { useRef, useState } from "react";
import TextMarquee from "./text-marquee";

export type ComboBoxOptions = { value: string }[];
export type ComboBoxProps = {
  options: ComboBoxOptions;
  ariaLabel: string;
  pluralLabel: string;
};

// https://headlessui.com/react/combobox#selecting-multiple-values
export default function ComboBox({
  options,
  ariaLabel,
  pluralLabel,
}: ComboBoxProps) {
  const MARQUEE_TEXT_LENGTH: number = 11;

  const [selectedOptions, setSelectedOptions] = useState<ComboBoxOptions>([]);
  const [blankDisplayValue, setBlankDisplayValue] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const comboboxInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions: ComboBoxOptions =
    searchQuery === ""
      ? options
      : options.filter((options) => {
          return options.value
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        });

  return (
    <Combobox
      multiple
      immediate
      value={selectedOptions}
      onChange={setSelectedOptions}
      onClose={() => {
        requestAnimationFrame(() => {
          comboboxInputRef.current?.blur();
        });
      }}
    >
      {({ open }) => (
        <>
          <ComboboxInput
            ref={comboboxInputRef}
            className="w-40 text-center border rounded-full p-2"
            aria-label={ariaLabel}
            onChange={(event) => setSearchQuery(event.target.value)}
            displayValue={(selectedOption) => {
              if (open) {
                return searchQuery;
              } else {
                return selectedOptions.length + " " + pluralLabel;
              }
            }}
          />
          <ComboboxButton className="cursor-pointer">open</ComboboxButton>
          {selectedOptions.length > 0 && (
            <button
              className="cursor-pointer"
              type="reset"
              onClick={() => {
                setSelectedOptions([]);
                setSearchQuery("");
              }}
            >
              clear
            </button>
          )}

          <ComboboxOptions
            anchor="bottom"
            className="border w-(--input-width) empty:invisible mt-1 rounded-2xl"
          >
            {filteredOptions.map((options) => (
              <ComboboxOption
                key={options.value}
                value={options}
                className="data-focus:bg-blue-100 rounded-xl cursor-pointer py-1 m-1"
              >
                {({ focus, selected }) => (
                  <div className="flex flex-row">
                    <p className="flex-1/5 justify-center items-center flex">
                      {selected && "x"}
                    </p>
                    {options.value.length >= MARQUEE_TEXT_LENGTH ? (
                      <TextMarquee marqueeText={[options.value]} className="" />
                    ) : (
                      <span className="flex-4/5 truncate">{options.value}</span>
                    )}
                  </div>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </>
      )}
    </Combobox>
  );
}
