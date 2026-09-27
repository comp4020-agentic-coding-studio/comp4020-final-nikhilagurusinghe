import clsx from "clsx";
import { IconComponentProps } from "./icon-component-props";

export default function DownArrow({
  height,
  stroke,
  strokeWidth,
  fill,
  className
}: IconComponentProps) {
  return (
    <svg
      className={clsx("w-auto", className)}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      style={{ height }}
    >
      <path
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  );
}
