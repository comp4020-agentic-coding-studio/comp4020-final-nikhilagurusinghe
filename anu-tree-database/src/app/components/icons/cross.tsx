import clsx from "clsx";
import { IconComponentProps } from "./icon-component-props";

export default function Cross({
  height,
  stroke,
  strokeWidth,
  fill,
  className,
}: IconComponentProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("w-auto", className)}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      style={{ height }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
}
