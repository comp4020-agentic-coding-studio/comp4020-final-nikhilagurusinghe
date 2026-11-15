import { Popup } from "react-leaflet";
import LinkIcon from "../icons/link";
import Link from "next/link";
import HeartIcon from "../icons/heart";
import { useEffect, useRef, useState, useTransition } from "react";
import { likeTree, unlikeTree } from "@/app/data/like-tree";

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
  likedByMe: boolean;
  signedIn: boolean;
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
  likedByMe,
  signedIn,
}: TreePopupProps) {
  const [likeCount, setLikeCount] = useState<number>(likes ?? 0);
  const [liked, setLiked] = useState<boolean>(likedByMe);
  const [likeMessage, setLikeMessage] = useState<string | null>(null);
  const [likePending, startLikeTransition] = useTransition();
  // While a like/unlike is in flight, a live update can carry a total from
  // before it landed; ignore those so the optimistic count doesn't flicker.
  const likeInFlight = useRef<boolean>(false);

  // Live count: an SSE stream for this tree while the popup is open. It sends
  // the current total on connect and every change after, from anyone.
  useEffect(() => {
    const source = new EventSource(`/api/trees/${id}/likes/stream`);
    source.onmessage = (event) => {
      if (likeInFlight.current) return;
      const { likes: liveLikes } = JSON.parse(event.data) as { likes: number };
      setLikeCount(liveLikes);
    };
    return () => source.close();
  }, [id]);

  function handleLike(): void {
    if (likePending) return;
    if (!signedIn) {
      setLikeMessage("sign in to like trees");
      return;
    }

    // Flip the heart and the count straight away, then settle on the server's
    // answer.
    const wasLiked = liked;
    const previousCount = likeCount;
    setLiked(!wasLiked);
    setLikeCount((count) => Math.max(count + (wasLiked ? -1 : 1), 0));
    setLikeMessage(null);
    likeInFlight.current = true;

    startLikeTransition(async () => {
      try {
        const result = wasLiked ? await unlikeTree(id) : await likeTree(id);
        if ("error" in result) {
          setLiked(wasLiked);
          setLikeCount(previousCount);
          setLikeMessage("sign in to like trees");
        } else {
          setLiked(result.likedByMe);
          setLikeCount(result.likes);
        }
      } catch {
        setLiked(wasLiked);
        setLikeCount(previousCount);
        setLikeMessage("couldn't save that, try again");
      } finally {
        likeInFlight.current = false;
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
          aria-label={
            liked
              ? `Unlike this tree, ${likeCount} likes so far`
              : `Like this tree, ${likeCount} likes so far`
          }
          aria-pressed={liked}
          disabled={likePending}
          className="group cursor-pointer disabled:cursor-default flex flex-row text-sm font-bold w-fit items-center gap-x-2 backdrop-blur-md bg-white/20 py-1 px-3 text-white rounded-full whitespace-nowrap truncate"
          onClick={handleLike}
        >
          <HeartIcon
            height={15}
            stroke={liked ? "red" : "#d0d0d0"}
            strokeWidth={3}
            fill={liked ? "red" : "none"}
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
      {likeMessage && <output className="mt-2 text-sm">{likeMessage}</output>}
    </main>
  );
}
