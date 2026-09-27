import clsx from "clsx";

type TextMarqueeProps = { marqueeText: string[]; className: string };

// https://jackwhiting.co.uk/posts/creating-a-marquee-with-tailwind-css-v4
export default function TextMarquee({
  marqueeText,
  className,
}: TextMarqueeProps) {
  return (
    <div className="relative px-2 w-full overflow-x-hidden group">
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
