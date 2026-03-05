"use client";

import { motion } from "framer-motion";
import { thinkingLabels } from "@/lib/egoContent";
import type { ManagerId } from "@/lib/types";
import ManagerAvatar from "./ManagerAvatar";
import { managers } from "@/lib/managers";

interface ThinkingLoaderProps {
  managerId: ManagerId;
}

function getManager(managerId: ManagerId) {
  return managers.find((m) => m.id === managerId);
}

export default function ThinkingLoader({ managerId }: ThinkingLoaderProps) {
  const manager = getManager(managerId);
  const label = thinkingLabels[managerId];

  if (!manager) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-slate-700/60 bg-slate-800/30 p-8 flex flex-col items-center justify-center min-h-[240px]"
      style={{
        borderColor: `${manager.color}50`,
        boxShadow: `0 0 30px ${manager.color}15`,
      }}
    >
      <ManagerAvatar avatarPath={manager.avatar} managerId={manager.id} size="lg" />
      <motion.div
        className="mt-4 w-10 h-10 border-2 border-sca-accent border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="mt-4 text-slate-400 text-sm text-center max-w-xs font-medium">
        {label}
      </p>
    </motion.div>
  );
}
