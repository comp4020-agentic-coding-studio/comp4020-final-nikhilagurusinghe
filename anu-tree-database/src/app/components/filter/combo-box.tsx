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
import TextMarquee from "../text-marquee";
import DownArrowIcon from "../icons/down-arrow";
import CheckmarkIcon from "../icons/checkmark";
import CrossIcon from "../icons/cross";

export type ComboBoxOptions = { value: string }[];
export type ComboBoxProps = {
  options: ComboBoxOptions;
  ariaLabel: string;
  label: string;
  labelDescription: string;
};

// https://headlessui.com/react/combobox#selecting-multiple-values
export default function ComboBox({
  options,
  ariaLabel,
  label,
  labelDescription,
}: ComboBoxProps) {
  const MARQUEE_TEXT_LENGTH: number = 11;

  const [selectedOptions, setSelectedOptions] = useState<ComboBoxOptions>([]);
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
    <div className="flex flex-row gap-x-2 h-12.5 backdrop-blur-sm px-2 py-2 rounded-full border border-white/20 items-center justify-between">
      <span className="ml-1 font-medium text-nowrap" title={labelDescription}>
        {label}
      </span>
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
            <div className="flex flex-row items-center justify-center">
              <div className="relative h-full">
                <ComboboxInput
                  ref={comboboxInputRef}
                  className={clsx(
                    "w-40 h-8 text-left rounded-full py-1 pl-3 pr-8 bg-white/20 backdrop-blur-sm",
                    open ? "cursor-text" : "cursor-pointer",
                  )}
                  aria-label={ariaLabel}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  displayValue={(selectedOption) => {
                    if (open) {
                      return searchQuery;
                    } else {
                      return `${selectedOptions.length} selected`;
                    }
                  }}
                />
                <ComboboxButton className="absolute top-[50%] -translate-y-1/2 right-2 cursor-pointer py-2">
                  <DownArrowIcon
                    height={20}
                    fill="white"
                    stroke="white"
                    strokeWidth={0}
                    className={
                      open ? "rotate-180 transition-all" : "transition-all"
                    }
                  />
                </ComboboxButton>
              </div>
              {selectedOptions.length > 0 && (
                <button
                  className="cursor-pointer ml-1 w-auto h-full mr-0.5 p-1.5 bg-white/20 backdrop-blur-sm rounded-full aspect-square"
                  type="reset"
                  onClick={() => {
                    setSelectedOptions([]);
                    setSearchQuery("");
                  }}
                >
                  <CrossIcon
                    height={17.5}
                    fill="white"
                    stroke="white"
                    strokeWidth={2}
                  />
                </button>
              )}
            </div>

            <ComboboxOptions
              anchor="bottom"
              portal={true}
              className="z-6767 scrollbar-none max-h-[40dvh]! border text-white border-white/20 w-(--input-width) empty:invisible mt-1 rounded-2xl backdrop-blur-sm"
            >
              {optionsToDisplay.map((options) => (
                <ComboboxOption
                  key={options.value}
                  value={options}
                  className="data-focus:bg-white/50 data-focus:backdrop-blur-sm rounded-xl cursor-pointer py-1 m-1"
                >
                  {({ focus, selected }) => (
                    <div className="flex flex-row px-2">
                      <p className="flex-1/4 justify-center items-center flex">
                        {selected && (
                          <CheckmarkIcon
                            height={17.5}
                            fill="white"
                            stroke="white"
                            strokeWidth={0}
                          />
                        )}
                      </p>
                      {options.value.length >= MARQUEE_TEXT_LENGTH ? (
                        <TextMarquee
                          marqueeText={[options.value]}
                          className=""
                        />
                      ) : (
                        <span className="flex-3/4 truncate">
                          {options.value}
                        </span>
                      )}
                    </div>
                  )}
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </>
        )}
      </Combobox>
    </div>
  );
}
