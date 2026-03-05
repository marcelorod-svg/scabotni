"use client";

import { Manager } from "@/lib/types";
import { managers } from "@/lib/managers";
import ManagerAvatar from "./ManagerAvatar";

interface ManagerGridProps {
  onSelectManager: (manager: Manager) => void;
  selectedManagerId?: string;
}

export default function ManagerGrid({
  onSelectManager,
  selectedManagerId,
}: ManagerGridProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
        Choose Your Manager
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {managers.map((manager) => {
          const isSelected = selectedManagerId === manager.id;
          return (
            <button
              key={manager.id}
              onClick={() => onSelectManager(manager)}
              className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                isSelected
                  ? "border-sca-accent bg-sca-accent/15 ring-2 ring-sca-accent/50"
                  : "border-slate-700/60 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50"
              }`}
              style={
                isSelected
                  ? { borderColor: manager.color, boxShadow: `0 0 20px ${manager.color}30` }
                  : undefined
              }
            >
              <div className="mb-2 flex justify-center">
                <ManagerAvatar avatarPath={manager.avatar} managerId={manager.id} size="md" />
              </div>
              <div className="font-bold text-white text-sm truncate">
                {manager.shortName}
              </div>
              <div className="text-[10px] text-slate-500 truncate italic">
                &quot;{manager.quote}&quot;
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
