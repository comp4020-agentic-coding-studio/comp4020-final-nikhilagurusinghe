import clsx from "clsx";
import { IconComponentProps } from "./icon-component-props";

export default function LinkIcon({
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
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      style={{ height }}
      viewBox="0 0 24 24"
      aria-hidden={true}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
      />
    </svg>
  );
}
