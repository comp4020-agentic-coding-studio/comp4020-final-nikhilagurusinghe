"use client";

import { useState } from "react";
import DownArrow from "../icons/down-arrow";

type SliderDropdownProps = {
  label: string;
  sliderMin: number;
  sliderMax: number;
};

export default function SliderDropdown({
  label,
  sliderMin,
  sliderMax,
}: SliderDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-row backdrop-blur-sm px-2 py-2 ml-1 h-12.5 rounded-full border border-white/20 items-baseline justify-center gap-x-2">
      <span className="ml-1 font-medium">{label}</span>
      <button
        type="button"
        className="relative w-40 text-left rounded-full py-1 h-full pl-3 pr-8 bg-white/20 backdrop-blur-sm cursor-pointer"
        onClick={() => setIsOpen((prevIsOpen) => !prevIsOpen)}
      >
        hello
        <div className="absolute top-[50%] -translate-y-1/2 right-2 cursor-pointer py-2">
          <DownArrow
            height={20}
            fill="black"
            stroke="black"
            strokeWidth={0}
            className={isOpen ? "rotate-180 transition-all" : "transition-all"}
          />
        </div>
      </button>
    </div>
  );
}
