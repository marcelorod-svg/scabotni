"use client";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useMobilePerf";

export type TabId = "predictions" | "central" | "vestuario" | "headtohead";

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  {
    id: "predictions" as TabId,
    label: "Predicciones",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    id: "central" as TabId,
    label: "Central de Datos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
        <path d="M15 15h.01M15 18h.01" />
      </svg>
    ),
  },
  {
    id: "vestuario" as TabId,
    label: "Vestuario",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
      </svg>
    ),
  },
  {
    id: "headtohead" as TabId,
    label: "Head to Head",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" />
        <path d="M9 12h6M12 9v6" />
      </svg>
    ),
  },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const isMobile = useIsMobile();

  return (
    // PATCH: en mobile, bg sólido sin backdrop-blur.
    // backdrop-blur-md en un fixed siempre activo es el blur más caro de la app.
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 ${
        isMobile
          ? "bg-sca-dark"                        // sólido, sin costo de compositing
          : "bg-sca-dark/95 backdrop-blur-md"    // desktop: igual que antes
      }`}
    >
      <div className="max-w-2xl mx-auto px-2 pb-safe">
        <div className="flex">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 left-4 right-4 h-0.5 bg-sca-accent rounded-full"
                    // PATCH: en mobile tween rápido, sin spring physics costoso.
                    transition={
                      isMobile
                        ? { type: "tween", duration: 0.15 }
                        : { type: "spring", stiffness: 500, damping: 40 }
                    }
                  />
                )}
                <span className={isActive ? "text-sca-accent" : "text-slate-500"}>
                  {tab.icon}
                </span>
                <span
                  className={`text-[10px] font-semibold tracking-wide transition-colors ${
                    isActive ? "text-sca-accent" : "text-slate-500"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
