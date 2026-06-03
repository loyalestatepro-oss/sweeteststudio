import { useEffect, useState } from "react";

interface VideoPreviewProps {
  frames: string[];
  className?: string;
}

/**
 * Renders a sequence of AI-generated keyframes as an animated video preview
 * with Ken Burns motion (slow zoom + pan) and crossfades between shots.
 */
export const VideoPreview = ({ frames, className }: VideoPreviewProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (frames.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, 2400);
    return () => clearInterval(id);
  }, [frames.length]);

  if (frames.length === 0) return null;

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{
        background:
          "radial-gradient(120% 80% at 30% 20%, hsl(270 60% 18%) 0%, hsl(240 40% 8%) 60%, hsl(230 30% 4%) 100%)",
      }}
    >

      {frames.map((src, i) => {
        const active = i === index;
        // Stagger Ken Burns transform per frame for cinematic variety
        const directions = [
          "scale(1.08) translate(-1%, -1%)",
          "scale(1.12) translate(1%, -2%)",
          "scale(1.15) translate(-2%, 1%)",
        ];
        return (
          <img
            key={i}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: active ? 1 : 0,
              transform: active ? directions[i % directions.length] : "scale(1)",
              transition: "opacity 800ms ease, transform 2400ms ease-out",
              willChange: "transform, opacity",
            }}
          />
        );
      })}
      {/* Cinematic letterbox + grain overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
    </div>
  );
};
