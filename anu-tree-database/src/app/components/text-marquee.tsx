import clsx from "clsx";

type TextMarqueeProps = { marqueeText: string[]; className: string };

// https://jackwhiting.co.uk/posts/creating-a-marquee-with-tailwind-css-v4
export default function TextMarquee({
  marqueeText,
  className,
}: TextMarqueeProps) {
  return (
    <div className="relative px-2 w-full overflow-x-hidden group before:pointer-events-none before:absolute before:inset-y-0 before:inset-s-0 before:z-2 before:w-2 before:from-gray-900 before:bg-linear-to-r before:to-transparent after:pointer-events-none after:absolute after:inset-y-0 after:inset-e-0 after:z-2 after:w-2 after:from-gray-900 after:bg-linear-to-l after:to-transparent">
      <div className="animate-marquee group-hover:[animation-play-state:paused] flex flex-row w-max whitespace-nowrap gap-3">
        {marqueeText.map((text) => (
          <span key={text} className={clsx("mr-4", className)}>
            {text}
          </span>
        ))}
      </div>
      <div
        className="animate-marquee-reverse absolute top-0 group-hover:[animation-play-state:paused] flex flex-col w-max whitespace-nowrap"
        aria-hidden={true}
      >
        {marqueeText.map((text) => (
          <span key={text} className={clsx("mr-4", className)}>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
