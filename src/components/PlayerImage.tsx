"use client";

import { useState } from "react";

interface PlayerImageProps {
  playerId: string;
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Loads player photo from /public/images/players/{playerId}.jpg
 * Falls back to /public/images/players/{playerId}.png if .jpg fails,
 * then shows a clean monogram placeholder as last resort.
 *
 * HOW TO ADD PHOTOS:
 * 1. Add the image to your repo at: public/images/players/{playerId}.jpg
 *    (or .png — both work)
 * 2. Player IDs are defined in src/lib/playerData.ts
 *
 * CURRENT PLAYER IDs:
 *   pele, maradona, ronaldo_r9, zidane, messi, beckenbauer,
 *   cruyff, ronaldo_cr7, mbappe, vinicius, bellingham, modric, haaland
 *
 * RECOMMENDED IMAGE SPECS:
 *   - Size: 300×400px or similar portrait ratio
 *   - Format: JPG (smaller file size) or PNG
 *   - Subject: player face/bust, ideally on neutral/dark background
 */
export default function PlayerImage({ playerId, name, className = "", style }: PlayerImageProps) {
  const [src, setSrc] = useState(`/images/players/${playerId}.jpg`);
  const [triedPng, setTriedPng] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (!triedPng) {
      // Try .png before giving up
      setTriedPng(true);
      setSrc(`/images/players/${playerId}.png`);
    } else {
      setFailed(true);
    }
  };

  // Monogram fallback: initials from name
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-900 ${className}`}
        style={style}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-slate-600 font-black font-mono text-2xl leading-none">
            {initials}
          </span>
          <span className="text-[8px] font-mono text-slate-700 uppercase tracking-widest">
            SIN FOTO
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`object-cover object-top ${className}`}
      style={style}
      onError={handleError}
      loading="lazy"
    />
  );
}
