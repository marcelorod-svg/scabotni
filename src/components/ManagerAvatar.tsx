"use client";

import { useState } from "react";
import Image from "next/image";
import { avatarFallbacks } from "@/lib/managers";

interface ManagerAvatarProps {
  avatarPath: string;
  managerId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-10 h-10 text-xl",
  md: "w-14 h-14 text-2xl",
  lg: "w-16 h-16 text-3xl",
};

export default function ManagerAvatar({
  avatarPath,
  managerId,
  size = "md",
  className = "",
}: ManagerAvatarProps) {
  const [useFallback, setUseFallback] = useState(false);
  const fallback = avatarFallbacks[managerId] ?? "👤";

  if (useFallback) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-slate-700/50 border border-slate-600/50 ${sizeClasses[size]} ${className}`}
        aria-hidden
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-full overflow-hidden border border-slate-600/50 bg-slate-800/50 flex-shrink-0 ${sizeClasses[size]} ${className}`}
    >
      <Image
        src={avatarPath}
        alt=""
        fill
        sizes="64px"
        className="object-cover"
        onError={() => setUseFallback(true)}
      />
    </div>
  );
}
