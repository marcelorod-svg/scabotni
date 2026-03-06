"use client";
import { useState, useEffect } from "react";

// Cache global: se evalúa una sola vez por session, no en cada render.
let _cached: boolean | null = null;

export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (_cached !== null) return _cached;
    _cached = window.matchMedia("(max-width: 768px)").matches;
    return _cached;
  });
  return mobile;
}
