import { useState } from "react";

export type ComboBoxOptions = { value: string }[];

// https://headlessui.com/react/combobox#selecting-multiple-values
export default function ComboBox( options: ComboBoxOptions ) {

  const [selectedOptions, setSelectedOptions] = useState<ComboBoxOptions>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredOptions: ComboBoxOptions = 
    searchQuery === "" 
      ? options
      : options.filter((options) => {
        return options.value.toLowerCase().includes(searchQuery.toLowerCase())
      });



  return (
    <>
    </>
  );
}