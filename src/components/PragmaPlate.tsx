"use client";

export default function PragmaPlate() {
  return (
    <a
      href="https://pragma-intelligence.com"
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-12 rounded-xl border border-slate-700/60 bg-slate-800/30 p-6 hover:border-sca-accent/40 hover:bg-slate-800/50 transition-all group"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">
            Powered by
          </div>
          <div className="font-bold text-xl text-white group-hover:text-sca-accent transition-colors">
            PRAGMA Intelligence
          </div>
          <div className="text-sm text-slate-400 mt-1 italic">
            Build smarter. Scale faster.
          </div>
        </div>
        <span className="text-2xl text-slate-500 group-hover:text-sca-accent transition-colors">
          →
        </span>
      </div>
    </a>
  );
}
