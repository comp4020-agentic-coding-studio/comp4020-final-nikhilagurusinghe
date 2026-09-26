import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useState } from "react";

export type ComboBoxOptions = { value: string }[];
export type ComboBoxProps = { options: ComboBoxOptions; ariaLabel: string };

// https://headlessui.com/react/combobox#selecting-multiple-values
export default function ComboBox({ options, ariaLabel }: ComboBoxProps) {
  const [selectedOptions, setSelectedOptions] = useState<ComboBoxOptions>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
      value={selectedOptions}
      onChange={setSelectedOptions}
      onClose={() => setSearchQuery("")}
    >
      {selectedOptions.length > 0 && (
        <ul>
          {selectedOptions.map((options) => (
            <li key={options.value}>{options.value}</li>
          ))}
        </ul>
      )}
      <ComboboxInput
        aria-label={ariaLabel}
        onChange={(event) => setSearchQuery(event.target.value)}
      />
      <ComboboxOptions anchor="bottom" className="border empty:invisible">
        {filteredOptions.map((options) => (
          <ComboboxOption
            key={options.value}
            value={options}
            className="data-focus:bg-blue-100"
          >
            {options.value}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
  );
}
