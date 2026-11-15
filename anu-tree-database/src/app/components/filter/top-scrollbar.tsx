"use client";

import clsx from "clsx";
import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

type TopScrollbarProps = {
  // The horizontally scrolling element this scrollbar drives. Its own
  // scrollbar should be hidden.
  targetRef: RefObject<HTMLElement | null>;
  className?: string;
};

// Where the thumb sits along the track and how much of it it covers, as
// fractions of the track (the same proportions as the visible part of the
// content to all of it).
type Thumb = { start: number; size: number };

// A scrollbar for a horizontally scrolling row that can sit anywhere, such as
// above the row: a browser only ever draws its own along the bottom. The thumb
// can be dragged, and pressing the track jumps towards that spot. It's hidden
// when the row doesn't overflow.
//
// It's aria-hidden: it's a mouse affordance, and the row itself still scrolls
// with a trackpad, touch, shift+wheel or by tabbing through its controls.
export default function TopScrollbar({
  targetRef,
  className,
}: TopScrollbarProps) {
  const [thumb, setThumb] = useState<Thumb | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerX: number; scrollLeft: number } | null>(null);

  // Keep the thumb in step with the row: as it scrolls, and as it or its
  // contents change size (a filter's label changing, the window resizing).
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const update = (): void => {
      const { scrollWidth, clientWidth, scrollLeft } = target;
      if (scrollWidth <= clientWidth + 1) {
        setThumb(null);
        return;
      }
      setThumb({
        start: scrollLeft / scrollWidth,
        size: clientWidth / scrollWidth,
      });
    };

    update();
    target.addEventListener("scroll", update, { passive: true });
    const resizes = new ResizeObserver(update);
    resizes.observe(target);
    for (const child of target.children) resizes.observe(child);
    return () => {
      target.removeEventListener("scroll", update);
      resizes.disconnect();
    };
  }, [targetRef]);

  // Dragging the thumb: moving it across the whole track scrolls across the
  // whole row.
  function startDrag(event: ReactPointerEvent<HTMLDivElement>): void {
    const target = targetRef.current;
    if (!target || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerX: event.clientX, scrollLeft: target.scrollLeft };
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>): void {
    const target = targetRef.current;
    const track = trackRef.current;
    if (!drag.current || !target || !track) return;
    const moved = event.clientX - drag.current.pointerX;
    target.scrollLeft =
      drag.current.scrollLeft +
      (moved / track.clientWidth) * target.scrollWidth;
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>): void {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  // Pressing the track (not the thumb) brings that part of the row into view.
  function jumpTo(event: ReactPointerEvent<HTMLDivElement>): void {
    const target = targetRef.current;
    const track = trackRef.current;
    if (!target || !track || event.button !== 0) return;
    const rect = track.getBoundingClientRect();
    const fraction = (event.clientX - rect.left) / rect.width;
    target.scrollTo({
      left: fraction * target.scrollWidth - target.clientWidth / 2,
      behavior: "smooth",
    });
  }

  return (
    <div
      aria-hidden={true}
      onPointerDown={jumpTo}
      className={clsx(
        // A taller strip than the track itself, so it's easier to grab.
        "group flex items-center py-1.5 cursor-pointer touch-none select-none",
        !thumb && "invisible",
        className,
      )}
    >
      <div
        ref={trackRef}
        className="relative w-full h-1.5 rounded-full bg-white/10"
      >
        {thumb && (
          <div
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="absolute inset-y-0 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors"
            style={{
              left: `${thumb.start * 100}%`,
              width: `${thumb.size * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}
