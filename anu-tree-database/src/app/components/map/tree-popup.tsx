import { Popup } from "react-leaflet";
import LinkIcon from "../icons/link";
import Link from "next/link";
import HeartIcon from "../icons/heart";
import { useState, useTransition } from "react";
import { likeTree } from "@/app/data/like-tree";

export type TreePopupProps = {
  id: number;
  name: string | null;
  scientificName: string;
  height: number;
  crownRadius: number | null;
  diameter: number;
  age: string | null;
  health: string | null;
  structure: string;
  classification: string;
  gpsCoords: number[];
  comments: string | null;
  likes: number | null;
};

export default function TreePopup({
  id,
  name,
  scientificName,
  height,
  crownRadius,
  diameter,
  age,
  health,
  structure,
  classification,
  gpsCoords,
  comments,
  likes,
}: TreePopupProps) {
  const [likeCount, setLikeCount] = useState<number>(likes ?? 0);
  const [likeSent, setLikeSent] = useState<boolean>(false);
  const [likePending, startLikeTransition] = useTransition();

  function handleLike(): void {
    if (likeSent || likePending) return;

    // Fill the heart straight away, then reconcile with the real total.
    setLikeSent(true);
    setLikeCount((count) => count + 1);

    startLikeTransition(async () => {
      try {
        setLikeCount(await likeTree(id));
      } catch (error) {
        setLikeSent(false);
        setLikeCount(likes ?? 0);
      }
    });
  }

  return (
    <main className="flex flex-col px-1 py-2">
      <span className="mb-1">
        {name && (
          <h1 className="text-2xl/6.5 font-bold mb-1 text-(--highlight-colour)">
            {name}
          </h1>
        )}
        <h2 className="text-[17px] italic">{scientificName}</h2>
      </span>
      <span className="text-sm">
        {age && `${age.toLowerCase()} age  · `}
        {health && `${health.toLowerCase()} health · `}
        {structure.toLowerCase()} structure · {classification.toLowerCase()}
      </span>
      <span className="text-sm">
        {height}m height · {diameter}m diameter
        {crownRadius && ` · ${crownRadius}m canopy radius`}
      </span>
      {comments && <span className="mt-5 text-sm">{comments}</span>}

      <div className="flex flex-row gap-x-1 gap-y-1 w-full flex-wrap mt-5">
        <button
          type="button"
          aria-label={`Like this tree, ${likeCount} likes so far`}
          aria-pressed={likeSent}
          disabled={likeSent || likePending}
          className="group cursor-pointer disabled:cursor-default flex flex-row text-sm font-bold w-fit items-center gap-x-2 backdrop-blur-md bg-white/20 py-1 px-3 text-white rounded-full whitespace-nowrap truncate"
          onClick={handleLike}
        >
          <HeartIcon
            height={15}
            stroke={likeSent ? "red" : "#d0d0d0"}
            strokeWidth={3}
            fill={likeSent ? "red" : "none"}
            className="group-hover:scale-120 transition-all"
          />
          {likeCount} likes
        </button>

        <Link
          href={`https://www.google.com/maps/search/?api=1&query=${gpsCoords[0]},${gpsCoords[1]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <span className="flex flex-row text-sm font-bold w-fit items-center gap-x-2 backdrop-blur-md bg-white/20 py-1 px-3 text-white rounded-full whitespace-nowrap">
            <LinkIcon
              height={15}
              stroke="#d0d0d0"
              strokeWidth={3}
              fill="none"
              className="group-hover:scale-120 transition-all"
            />
            {gpsCoords[0]}, {gpsCoords[1]}
          </span>
        </Link>

        <Link
          href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(
            scientificName,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <span className="flex flex-row text-sm font-bold w-fit items-center gap-x-2 backdrop-blur-md bg-white/20 py-1 px-3 text-white rounded-full whitespace-nowrap">
            <LinkIcon
              height={15}
              stroke="#d0d0d0"
              strokeWidth={3}
              fill="none"
              className="group-hover:scale-120 transition-all"
            />
            learn more on Wikipedia
          </span>
        </Link>
      </div>
    </main>
  );
}
