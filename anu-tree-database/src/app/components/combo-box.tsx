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
import DownArrow from "./icons/down-arrow";
import Checkmark from "./icons/checkmark";

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

  const optionsToDisplay =
    filteredOptions.length === 0 ? options : filteredOptions;

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
        <div className="flex flex-row gap-x-2">
          <div className="relative">
            <ComboboxInput
              ref={comboboxInputRef}
              className="w-40 text-left rounded-full py-1 pl-3 pr-8"
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
            <ComboboxButton className="absolute top-[52%] -translate-y-1/2 right-2 cursor-pointer py-2"><DownArrow height={20} fill="black" stroke="black" strokeWidth={0} className={open ? "rotate-180 transition-all" : "transition-all"} /></ComboboxButton>
            </div>
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
          </div>

          <ComboboxOptions
            anchor="bottom"
            className="border w-(--input-width) empty:invisible mt-1 rounded-2xl"
          >
            {optionsToDisplay.map((options) => (
              <ComboboxOption
                key={options.value}
                value={options}
                className="data-focus:bg-blue-100 rounded-xl cursor-pointer py-1 m-1"
              >
                {({ focus, selected }) => (
                  <div className="flex flex-row px-2">
                    <p className="flex-1/4 justify-center items-center flex">
                      {selected && <Checkmark height={17.5} fill="black" stroke="black" strokeWidth={0} />}
                    </p>
                    {options.value.length >= MARQUEE_TEXT_LENGTH ? (
                      <TextMarquee marqueeText={[options.value]} className="" />
                    ) : (
                      <span className="flex-3/4 truncate">{options.value}</span>
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
