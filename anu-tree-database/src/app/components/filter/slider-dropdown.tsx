"use client";

import { useEffect, useRef, useState } from "react";
import DownArrowIcon from "../icons/down-arrow";
import ReactSlider from "react-slider";
import clsx from "clsx";
import CrossIcon from "../icons/cross";
import { createPortal } from "react-dom";

type SliderDropdownProps = {
  label: string;
  labelDescription: string;
  sliderMin: number;
  sliderMax: number;
};

type SliderValues = { startValue: number; endValue: number };
type PortalPosition = { top: number; left: number; width: number };

export default function SliderDropdown({
  label,
  labelDescription,
  sliderMin,
  sliderMax,
}: SliderDropdownProps) {
  const START_TRACK_CLASS: string = "track-0";
  const CENTER_TRACK_CLASS: string = "track-1";
  const END_TRACK_CLASS: string = "track-2";
  const START_THUMB_CLASS: string = "thumb-0";
  const START_THUMB_INDEX: number = 0;
  const END_THUMB_CLASS: string = "thumb-1";
  const END_THUMB_INDEX: number = 1;

  const dropdownDivRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [sliderValues, setSliderValues] = useState<SliderValues>({
    startValue: sliderMin,
    endValue: sliderMax,
  });
  const [portalPosition, setPortalPosition] = useState<PortalPosition>({
    top: 0,
    left: 0,
    width: 0,
  });

  function updatePortalPosition(): void {
    const dropdownDiv = dropdownDivRef.current;

    if (!dropdownDiv) return;

    const divRect = dropdownDiv.getBoundingClientRect();
    setPortalPosition({
      top: divRect.bottom,
      left: divRect.left,
      width: divRect.width,
    });
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener("resize", updatePortalPosition);
    window.addEventListener("scroll", updatePortalPosition, true);

    return () => {
      window.removeEventListener("resize", updatePortalPosition);
      window.removeEventListener("scroll", updatePortalPosition, true);
    };
  }, [isOpen]);

  const isSliderDefault: boolean =
    sliderValues.startValue === sliderMin &&
    sliderValues.endValue === sliderMax;

  let filterDescription: string = `${sliderValues.startValue}m to ${sliderValues.endValue}m`;

  if (isSliderDefault) {
    filterDescription = "all";
  } else if (sliderValues.startValue === sliderMin) {
    filterDescription = `≤ ${sliderValues.endValue}m`;
  } else if (sliderValues.endValue === sliderMax) {
    filterDescription = `≥ ${sliderValues.startValue}m`;
  }

  // TODO change the portal so that clicking outside of the dropdown closes the portal
  return (
    <>
      <div className="relative h-12.5 px-2 py-2">
        <div
          className="
        pointer-events-none absolute inset-0
        rounded-full border border-white/20 backdrop-blur-sm
      "
        />

        <div className="relative flex flex-row items-center justify-between gap-x h-full w-full">
          <div
            ref={dropdownDivRef}
            className="relative flex items-center gap-x-2"
          >
            <span
              className="ml-1 font-medium text-nowrap"
              title={labelDescription}
            >
              {label}
            </span>
            <button
              type="button"
              className="relative w-40 text-left rounded-full py-1 h-full pl-3 pr-8 bg-white/20 backdrop-blur-sm cursor-pointer"
              onClick={() => {
                updatePortalPosition();
                setIsOpen((prevIsOpen) => !prevIsOpen);
              }}
            >
              {filterDescription}
              <div className="absolute top-[50%] -translate-y-1/2 right-2 cursor-pointer py-2">
                <DownArrowIcon
                  height={20}
                  fill="white"
                  stroke="white"
                  strokeWidth={0}
                  className={
                    isOpen ? "rotate-180 transition-all" : "transition-all"
                  }
                />
              </div>
            </button>
          </div>
          {!isSliderDefault && (
            <button
              className="cursor-pointer flex flex-col items-center justify-center ml-1   mr-0.5 p-1.5 bg-white/20 backdrop-blur-sm rounded-full aspect-square"
              type="reset"
              onClick={() => {
                setIsOpen(false);
                setSliderValues({
                  startValue: sliderMin,
                  endValue: sliderMax,
                });
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
      </div>
      {isMounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed z-6767 flex flex-col border border-white/20 backdrop-blur-sm  h-auto rounded-2xl pt-7 px-7 pb-2 gap-y-5"
            style={{
              top: portalPosition.top,
              left: portalPosition.left,
              width: portalPosition.width,
            }}
          >
            <ReactSlider
              defaultValue={[sliderValues.startValue, sliderValues.endValue]}
              value={[sliderValues.startValue, sliderValues.endValue]}
              max={sliderMax}
              min={sliderMin}
              ariaLabel={["Lower slider thumb", "Upper slider thumb"]}
              ariaValuetext={(state) =>
                `${label} slider value ${state.valueNow}`
              }
              onChange={(newValueAndThumbIndex) =>
                setSliderValues({
                  startValue: newValueAndThumbIndex[0],
                  endValue: newValueAndThumbIndex[1],
                })
              }
              renderThumb={({ key, ...props }, state) => (
                <div
                  key={key}
                  {...props}
                  className={clsx(
                    "relative select-none text-xs font-semibold drop-shadow-sm/20 backdrop-blur-lg -translate-y-[calc(50%-3px)] w-auto aspect-square h-7.5 bg-white/60 rounded-full flex flex-col items-center justify-center cursor-pointer",
                    key === END_THUMB_CLASS && "right-0 translate-x-1/2",
                    key === START_THUMB_CLASS && "left-0 -translate-x-1/2",
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
                    "h-1.5 rounded-full backdrop-blur-3xl",
                    key === CENTER_TRACK_CLASS && "bg-(--highlight-colour) z-1",
                    (key === START_TRACK_CLASS || key === END_TRACK_CLASS) &&
                      "bg-white/70",
                  )}
                />
              )}
              minDistance={10}
            />
            <span className="text-white text-center w-full">in metres</span>
          </div>,
          document.body,
        )}
    </>
  );
}
