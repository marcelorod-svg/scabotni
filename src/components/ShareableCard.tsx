"use client";

import { useRef } from "react";
import Image from "next/image";
import { Match, Manager, Prediction } from "@/lib/types";
import { getCountryCode } from "@/lib/teamFlags";
import ManagerAvatar from "./ManagerAvatar";

interface ShareableCardProps {
  match: Match;
  manager: Manager;
  prediction: Prediction;
  userPrediction: { homeScore: number; awayScore: number; followed: boolean };
}

export default function ShareableCard({
  match,
  manager,
  prediction,
  userPrediction,
}: ShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const shareText = `${manager.name} predicted ${prediction.homeScore}-${prediction.awayScore} for ${match.homeTeam} vs ${match.awayTeam}. My prediction: ${userPrediction.homeScore}-${userPrediction.awayScore}. — ScaBOTni`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "ScaBOTni Prediction",
          text: shareText,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
        Shareable Card
      </h3>
      <div
        ref={cardRef}
        className="rounded-2xl overflow-hidden border-2 p-6 bg-sca-dark w-full max-w-md"
        style={{
          borderColor: manager.color,
          boxShadow: `0 0 30px ${manager.color}20`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ManagerAvatar avatarPath={manager.avatar} managerId={manager.id} size="lg" />
            <div>
              <div className="font-bold text-white">{manager.name}</div>
              <div className="text-xs text-slate-500">{match.league}</div>
            </div>
          </div>
          <div className="text-xs font-bold text-sca-accent">ScaBOTni</div>
        </div>

        <div className="py-4 border-y border-slate-700/50 my-4">
          <div className="flex items-center justify-between gap-2 font-semibold text-lg text-white">
            <span className="flex items-center gap-2">
              {(match.homeCountryCode ?? getCountryCode(match.homeTeam)) && (
                <span className="w-6 h-4 rounded overflow-hidden border border-slate-600/50 flex-shrink-0">
                  <Image
                    src={`https://flagcdn.com/${(match.homeCountryCode ?? getCountryCode(match.homeTeam))!}.svg`}
                    alt=""
                    width={24}
                    height={16}
                    className="object-cover w-full h-full"
                  />
                </span>
              )}
              {match.homeTeam}
            </span>
            <span className="text-slate-500">vs</span>
            <span className="flex items-center gap-2">
              {match.awayTeam}
              {(match.awayCountryCode ?? getCountryCode(match.awayTeam)) && (
                <span className="w-6 h-4 rounded overflow-hidden border border-slate-600/50 flex-shrink-0">
                  <Image
                    src={`https://flagcdn.com/${(match.awayCountryCode ?? getCountryCode(match.awayTeam))!}.svg`}
                    alt=""
                    width={24}
                    height={16}
                    className="object-cover w-full h-full"
                  />
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Manager&apos;s prediction</span>
            <span className="font-bold text-white">
              {prediction.homeScore} — {prediction.awayScore}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Your prediction</span>
            <span className="font-bold text-sca-accent">
              {userPrediction.homeScore} — {userPrediction.awayScore}
              {userPrediction.followed && " ✓"}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            Build smarter. Scale faster. — PRAGMA Intelligence
          </p>
        </div>
      </div>

      <button
        onClick={handleShare}
        className="w-full py-3 rounded-xl font-bold bg-slate-700 text-white hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
      >
        📤 Share Card (Copy link / Native share)
      </button>
      <p className="text-xs text-slate-500 text-center">
        Take a screenshot of the card above for social media
      </p>
    </div>
  );
}
