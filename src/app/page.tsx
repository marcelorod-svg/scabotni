"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MatchList from "@/components/MatchList";
import ManagerGrid from "@/components/ManagerGrid";
import ManagerPrediction from "@/components/ManagerPrediction";
import UserScoreInput from "@/components/UserScoreInput";
import ShareableCard from "@/components/ShareableCard";
import PragmaPlate from "@/components/PragmaPlate";
import ThinkingLoader from "@/components/ThinkingLoader";
import EgoCheckModal from "@/components/EgoCheckModal";
import BottomNav, { type TabId } from "@/components/BottomNav";
import CentralDeDatos from "@/components/CentralDeDatos";
import Vestuario from "@/components/Vestuario";
import { mockMatches } from "@/lib/mockData";
import { getManagerPrediction } from "@/lib/managers";
import type { Match, Manager, UserPrediction } from "@/lib/types";

type FlowStep = "list" | "managers" | "thinking" | "prediction" | "contradict" | "done";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("predictions");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [prediction, setPrediction] = useState<ReturnType<
    typeof getManagerPrediction
  > | null>(null);
  const [userPredictions, setUserPredictions] = useState<
    Record<string, UserPrediction>
  >({});
  const [step, setStep] = useState<FlowStep>("list");
  const [showEgoModal, setShowEgoModal] = useState(false);

  useEffect(() => {
    if (step !== "thinking" || !selectedManager) return;
    const t = setTimeout(() => setStep("prediction"), 2000);
    return () => clearTimeout(t);
  }, [step, selectedManager]);

  const handleSelectMatch = useCallback((match: Match) => {
    setSelectedMatch(match);
    setSelectedManager(null);
    setPrediction(null);
    setStep("managers");
  }, []);

  const handleSelectManager = useCallback(
    (manager: Manager) => {
      if (!selectedMatch) return;
      setSelectedManager(manager);
      const pred = getManagerPrediction(manager.id, selectedMatch.id, "default", selectedMatch);
      setPrediction(pred);
      setStep("thinking");
    },
    [selectedMatch]
  );

  const handleFollow = useCallback(() => {
    if (!selectedMatch || !selectedManager || !prediction) return;
    const key = `${selectedMatch.id}-${selectedManager.id}`;
    setUserPredictions((prev) => ({
      ...prev,
      [key]: {
        matchId: selectedMatch.id,
        managerId: selectedManager.id,
        followedManager: true,
        homeScore: prediction.homeScore,
        awayScore: prediction.awayScore,
        savedAt: new Date().toISOString(),
      },
    }));
    setStep("done");
  }, [selectedMatch, selectedManager, prediction]);

  const handleContradict = useCallback(() => {
    setShowEgoModal(true);
  }, []);

  const handleEgoProceed = useCallback(() => {
    setShowEgoModal(false);
    setStep("contradict");
  }, []);

  const handleEgoClose = useCallback(() => {
    setShowEgoModal(false);
  }, []);

  const handleSaveContradict = useCallback(
    (homeScore: number, awayScore: number) => {
      if (!selectedMatch || !selectedManager) return;
      const key = `${selectedMatch.id}-${selectedManager.id}`;
      setUserPredictions((prev) => ({
        ...prev,
        [key]: {
          matchId: selectedMatch.id,
          managerId: selectedManager.id,
          followedManager: false,
          homeScore,
          awayScore,
          savedAt: new Date().toISOString(),
        },
      }));
      setStep("done");
    },
    [selectedMatch, selectedManager]
  );

  const handleBackToList = useCallback(() => {
    setSelectedMatch(null);
    setSelectedManager(null);
    setPrediction(null);
    setStep("list");
  }, []);

  const handleBackToManagers = useCallback(() => {
    setSelectedManager(null);
    setPrediction(null);
    setStep("managers");
  }, []);

  const userPred = selectedMatch && selectedManager
    ? userPredictions[`${selectedMatch.id}-${selectedManager.id}`]
    : undefined;

  return (
    <div className="min-h-screen pb-20">
      <header className="border-b border-slate-800 bg-sca-dark/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Sca<span className="text-sca-accent">BOT</span>ni
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === "predictions" && "Football predictions with theatrical AI managers"}
            {activeTab === "central" && "Historia del Mundial · 1930 — 2022"}
            {activeTab === "vestuario" && "Las figuras del fútbol mundial"}
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "predictions" && (
            <motion.div
              key="predictions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {step === "list" && (
                <MatchList matches={mockMatches} onSelectMatch={handleSelectMatch} />
              )}

              {step === "managers" && selectedMatch && (
                <div className="space-y-6">
                  <button
                    onClick={handleBackToList}
                    className="text-sm text-slate-500 hover:text-white flex items-center gap-1"
                  >
                    ← Back to matches
                  </button>
                  <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
                    <div className="font-semibold text-white">
                      {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                    </div>
                    <div className="text-xs text-slate-500">{selectedMatch.league}</div>
                  </div>
                  <ManagerGrid
                    onSelectManager={handleSelectManager}
                    selectedManagerId={selectedManager?.id}
                  />
                </div>
              )}

              {step === "thinking" && selectedManager && (
                <div className="space-y-6">
                  <button
                    onClick={handleBackToManagers}
                    className="text-sm text-slate-500 hover:text-white flex items-center gap-1"
                  >
                    ← Pick another manager
                  </button>
                  <AnimatePresence mode="wait">
                    <ThinkingLoader managerId={selectedManager.id} />
                  </AnimatePresence>
                </div>
              )}

              {step === "prediction" &&
                selectedMatch &&
                selectedManager &&
                prediction && (
                  <motion.div
                    key="prediction"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-6"
                  >
                    <button
                      onClick={handleBackToManagers}
                      className="text-sm text-slate-500 hover:text-white flex items-center gap-1"
                    >
                      ← Pick another manager
                    </button>
                    <ManagerPrediction
                      match={selectedMatch}
                      prediction={prediction}
                      onFollow={handleFollow}
                      onContradict={handleContradict}
                      showUserInput={!userPred}
                    />
                  </motion.div>
                )}

              {step === "contradict" && selectedMatch && selectedManager && (
                <div className="space-y-6">
                  <button
                    onClick={() => setStep("prediction")}
                    className="text-sm text-slate-500 hover:text-white flex items-center gap-1"
                  >
                    ← Back
                  </button>
                  <UserScoreInput
                    match={selectedMatch}
                    onSave={handleSaveContradict}
                    onCancel={() => setStep("prediction")}
                  />
                </div>
              )}

              {step === "done" &&
                selectedMatch &&
                selectedManager &&
                prediction &&
                userPred && (
                  <div className="space-y-6">
                    <ManagerPrediction
                      match={selectedMatch}
                      prediction={prediction}
                      onFollow={handleFollow}
                      onContradict={handleContradict}
                      userPrediction={{
                        homeScore: userPred.homeScore,
                        awayScore: userPred.awayScore,
                        followed: userPred.followedManager,
                      }}
                      showUserInput={false}
                    />
                    <ShareableCard
                      match={selectedMatch}
                      manager={selectedManager}
                      prediction={prediction}
                      userPrediction={{
                        homeScore: userPred.homeScore,
                        awayScore: userPred.awayScore,
                        followed: userPred.followedManager,
                      }}
                    />
                    <button
                      onClick={handleBackToList}
                      className="w-full py-3 rounded-xl font-bold border border-sca-accent text-sca-accent hover:bg-sca-accent/10 transition-colors"
                    >
                      Predict another match
                    </button>
                  </div>
                )}

              <PragmaPlate />
            </motion.div>
          )}

          {activeTab === "central" && (
            <motion.div
              key="central"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <CentralDeDatos />
            </motion.div>
          )}

          {activeTab === "vestuario" && (
            <motion.div
              key="vestuario"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Vestuario />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {selectedManager && (
        <EgoCheckModal
          isOpen={showEgoModal}
          managerId={selectedManager.id}
          onProceed={handleEgoProceed}
          onClose={handleEgoClose}
        />
      )}
    </div>
  );
}
