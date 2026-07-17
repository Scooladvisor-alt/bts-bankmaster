import React from "react";
import { motion } from "framer-motion";

// ── Hamac qui balance doucement ──
function Hammock() {
  return (
    <motion.div
      animate={{ rotate: [-1.6, 1.6, -1.6] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
      style={{ transformOrigin: "top center" }}
    >
      <svg viewBox="0 0 300 200" className="w-[300px] max-w-[80vw] h-auto">
        {/* les deux palmiers */}
        <g stroke="#78350f" strokeWidth="6" strokeLinecap="round">
          <line x1="60" y1="180" x2="60" y2="70" />
          <line x1="240" y1="180" x2="240" y2="70" />
        </g>
        {/* palmes */}
        <g fill="#16a34a">
          {[
            [60, 60], [240, 60],
          ].map(([cx, cy], i) => (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                  key={a}
                  cx={cx + Math.cos((a * Math.PI) / 180) * 22}
                  cy={cy + Math.sin((a * Math.PI) / 180) * 22}
                  rx="20" ry="7"
                  transform={`rotate(${a} ${cx} ${cy})`}
                />
              ))}
            </g>
          ))}
        </g>

        {/* corde du hamac */}
        <g stroke="#92400e" strokeWidth="2.5">
          <line x1="60" y1="72" x2="100" y2="110" />
          <line x1="240" y1="72" x2="200" y2="110" />
        </g>
        {/* le hamac */}
        <path
          d="M100 110 Q150 150 200 110"
          fill="none"
          stroke="#0f766e"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M100 110 Q150 138 200 110"
          fill="#14b8a6"
          stroke="#0f766e"
          strokeWidth="2"
        />
        {/* Armand qui dort (petit bonhomme) */}
        <g>
          <ellipse cx="150" cy="120" rx="34" ry="9" fill="#fcd34d" opacity="0.9" />
          <circle cx="150" cy="116" r="11" fill="#fbbf24" />
          {/* couverture */}
          <path d="M126 122 Q150 132 174 122 L174 130 Q150 140 126 130 Z" fill="#dc2626" />
          {/* Z de sommeil */}
        </g>
        <text x="168" y="104" fill="#64748b" fontFamily="Fredoka, sans-serif" fontSize="14" fontWeight="700">z</text>
        <text x="178" y="94" fill="#94a3b8" fontFamily="Fredoka, sans-serif" fontSize="18" fontWeight="700">z</text>
        <text x="190" y="82" fill="#cbd5e1" fontFamily="Fredoka, sans-serif" fontSize="22" fontWeight="700">z</text>
      </svg>
    </motion.div>
  );
}

// ── Soleil doux ──
function Sun() {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-10 right-8 md:right-24"
    >
      <div className="text-6xl md:text-7xl drop-shadow-sm">☀️</div>
    </motion.div>
  );
}

// ── Nuages qui dérivent ──
function Clouds() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-16 left-[8%] text-4xl md:text-5xl opacity-80"
        animate={{ x: [0, 80, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >☁️</motion.div>
      <motion.div
        className="absolute top-28 left-[60%] text-3xl md:text-4xl opacity-70"
        animate={{ x: [0, -60, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >☁️</motion.div>
      <motion.div
        className="absolute top-10 left-[38%] text-2xl opacity-60"
        animate={{ x: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >☁️</motion.div>
    </div>
  );
}

export default function Holidays() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-b from-green-50 via-sky-50 to-white flex flex-col items-center justify-center px-6">
      <Sun />
      <Clouds />

      {/* Carte centrale */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 16 }}
        className="relative z-10 w-full max-w-md bg-white rounded-[28px] shadow-xl border-2 border-green-100 px-8 py-10 text-center"
      >
        {/* badge */}
        <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-6">
          🌴 Vacances
        </div>

        <Hammock />

        <h1
          className="font-display text-3xl md:text-4xl font-bold text-stone-800 mt-4 leading-tight"
          style={{ fontFamily: "var(--font-fredoka)" }}
        >
          Chut… Antonin dort.
        </h1>

        <p className="text-stone-500 text-sm md:text-base leading-relaxed mt-3 font-medium">
          La plateforme fait une petite sieste le temps des vacances.
          <br />
          Pas de révisions — repose-toi bien, on se retrouve à la rentrée, frais et dispo&nbsp;! 😴
        </p>

        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-stone-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          On revient bientôt
        </div>
      </motion.div>

      {/* herbe discrète en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-100/80 to-transparent" />
    </div>
  );
}