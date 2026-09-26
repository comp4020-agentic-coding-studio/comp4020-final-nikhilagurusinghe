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
          <div>
            <ComboboxInput
              ref={comboboxInputRef}
              className="w-40 text-center"
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
            <button
              className="cursor-pointer"
              type="reset"
              onClick={() => setSelectedOptions([])}
            >
              clear
            </button>
          </div>

          <ComboboxOptions
            anchor="bottom"
            className="border w-(--input-width) empty:invisible"
          >
            {filteredOptions.map((options) => (
              <ComboboxOption
                key={options.value}
                value={options}
                className="data-focus:bg-blue-100 cursor-pointer pl-5"
              >
                {({ focus, selected }) => (
                  <div
                    className={clsx("group flex gap-2", focus && "bg-blue-100")}
                  >
                    {selected && "x"}
                    {options.value}
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
