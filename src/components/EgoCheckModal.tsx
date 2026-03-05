"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getRandomEgoPhrase } from "@/lib/egoContent";
import type { ManagerId } from "@/lib/types";
import ManagerAvatar from "./ManagerAvatar";
import { managers } from "@/lib/managers";

interface EgoCheckModalProps {
  isOpen: boolean;
  managerId: ManagerId;
  onProceed: () => void;
  onClose: () => void;
}

function getManager(managerId: ManagerId) {
  return managers.find((m) => m.id === managerId);
}

export default function EgoCheckModal({
  isOpen,
  managerId,
  onProceed,
  onClose,
}: EgoCheckModalProps) {
  const manager = getManager(managerId);
  const phrase = getRandomEgoPhrase(managerId);

  if (!manager) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-sca-surface shadow-2xl pointer-events-auto overflow-hidden"
              style={{
                boxShadow: `0 0 40px ${manager.color}20`,
              }}
            >
              {/* Header */}
              <div
                className="px-6 py-4 flex items-center gap-4"
                style={{ background: `${manager.color}15`, borderBottom: `1px solid ${manager.color}30` }}
              >
                <ManagerAvatar avatarPath={manager.avatar} managerId={manager.id} size="md" />
                <div>
                  <h3 className="font-bold text-white">{manager.name}</h3>
                  <p className="text-xs text-slate-500">Ego Check</p>
                </div>
              </div>

              {/* Phrase */}
              <div className="px-6 py-6">
                <p className="text-lg text-slate-200 leading-relaxed italic">
                  &ldquo;{phrase}&rdquo;
                </p>
              </div>

              {/* Buttons */}
              <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onProceed}
                  className="flex-1 py-3 px-4 rounded-xl font-bold border-2 border-sca-gold text-sca-gold hover:bg-sca-gold/10 transition-colors"
                >
                  Yes, I know better
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-sca-accent text-sca-dark hover:bg-sca-accent/90 transition-colors"
                >
                  You are right, Boss
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
