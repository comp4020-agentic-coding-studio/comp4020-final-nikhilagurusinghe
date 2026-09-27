"use client";

import { useState } from "react";
import DownArrow from "../icons/down-arrow";
import ReactSlider from "react-slider";
import clsx from "clsx";

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
  const START_TRACK_CLASS = "track-0";
  const CENTER_TRACK_CLASS = "track-1";
  const END_TRACK_CLASS = "track-2";
  const START_THUMB_CLASS = "thumb-0";
  const END_THUMB_CLASS = "thumb-1";

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="relative h-12.5">
      <div className="flex flex-row  items-baseline justify-center backdrop-blur-sm gap-x-2 h-full w-full px-2 py-2 ml-1 rounded-full border border-white/20">
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
              className={
                isOpen ? "rotate-180 transition-all" : "transition-all"
              }
            />
          </div>
        </button>
      </div>
      {isOpen && (
        <div className="absolute flex flex-col border border-white/20 backdrop-blur-sm bottom-0 left-1 translate-y-[calc(100%-5px)] w-full h-auto rounded-2xl pt-7 px-7 pb-2 gap-y-5">
          <ReactSlider
            defaultValue={[0, 100]}
            ariaLabel={["Lower slider thumb", "Upper slider thumb"]}
            ariaValuetext={(state) => `${label} slider value ${state.valueNow}`}
            renderThumb={({ key, ...props }, state) => (
              <div
                key={key}
                {...props}
                className={clsx(
                  "relative select-none text-xs font-semibold drop-shadow-md/0 backdrop-blur-sm -translate-y-[calc(50%-3px)] w-auto aspect-square h-7.5 bg-white/80 rounded-full flex flex-col items-center justify-center cursor-pointer",
                  key === END_THUMB_CLASS && "right-0 translate-x-1/2",
                  key === START_THUMB_CLASS && "left-0 -translate-x-1/2"
                )}
              >
                {state.valueNow}
              </div>
            )}
            renderTrack={({ key, ...props }, state) => (
              <div
                key={key}
                {...props}
                className={clsx(
                  "h-1.5 rounded-full backdrop-blur-md",
                  key === CENTER_TRACK_CLASS && "bg-(--highlight-colour) z-1",
                  (key === START_TRACK_CLASS || key === END_TRACK_CLASS) &&
                    "bg-white/60",
                )}
              />
            )}
            minDistance={10}
          />
          <span className="text-center w-full">in metres</span>
        </div>
      )}
    </div>
  );
}
