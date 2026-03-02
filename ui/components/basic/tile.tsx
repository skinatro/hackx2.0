import type { HTMLAttributes } from "react";
import { memo } from "react";
import { TileData } from "@/libs/types";

type TileProps = TileData &
  HTMLAttributes<HTMLDivElement> & {
    frontColor?: string;
    backColor?: string;
    flipped?: boolean;
  };

const TileComponent = ({ tileColor, frontColor, backColor, flipped = false, className = "", style, ...rest }: TileProps) => {
  const front = frontColor ?? tileColor ?? "#0f1724";
  const back = backColor ?? (tileColor === front ? "#f8fafc" : tileColor ?? "#f8fafc");

  return (
    <div
      {...rest}
      className={`tile ${className} ${flipped ? "is-flipped" : ""}`}
      style={{ ...(style as object) }}
    >
      <div className="tile-inner preserve-3d transition-transform duration-200 ease-in-out">
        <div className="tile-face tile-front backface-hidden" style={{ background: front }} />
        <div className="tile-face tile-back backface-hidden" style={{ background: back }} />
      </div>
    </div>
  );
};

export const Tile = memo(TileComponent);
