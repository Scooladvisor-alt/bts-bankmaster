import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// ── Petit mot "manuscrit" épinglé sur la vitre ──
const NOTE_LINES = [
  "On revient à la rentrée,",
  "fraîchement bronzés ☀️",
  "et les neurones rechargés.",
  "",
  "— La team BTS Banque",
];

function StickyNote() {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      animate={{ rotate: hover ? -1.5 : -3 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="absolute left-1/2 -translate-x-1/2 top-[58%] z-30 cursor-default"
      style={{ filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.45))" }}
    >
      {/* punaise */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 30%, #fca5a5, #b91c1c)",
          boxShadow: "0 2px 3px rgba(0,0,0,0.5), inset 0 -1px 1px rgba(0,0,0,0.3)",
        }}
      />
      <div
        className="px-7 py-6 w-[260px] max-w-[78vw] rounded-sm"
        style={{
          background: "linear-gradient(160deg, #fef9c3 0%, #fde68a 100%)",
          fontFamily: "'Caveat', 'Segoe Script', cursive",
          backgroundImage:
            "repeating-linear-gradient(transparent 0px, transparent 27px, rgba(180,83,9,0.12) 27px, rgba(180,83,9,0.12) 28px)",
        }}
      >
        {NOTE_LINES.map((l, i) => (
          <div
            key={i}
            className="text-amber-900 leading-[28px]"
            style={{ fontSize: l === "" ? 14 : 21, minHeight: l === "" ? 14 : 28 }}
          >
            {l}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Néon "FERMÉ" qui scintille ──
function NeonSign() {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    let t;
    const flicker = () => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 80);
      setTimeout(() => { setGlitch(true); setTimeout(() => setGlitch(false), 60); }, 200);
      t = setTimeout(flicker, 2500 + Math.random() * 3500);
    };
    t = setTimeout(flicker, 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.3 }}
      className="relative select-none"
      style={{ filter: glitch ? "brightness(0.55) blur(0.5px)" : "none" }}
    >
      {/* halo */}
      <div
        className="absolute inset-0 -z-10 blur-2xl rounded-full"
        style={{
          background: glitch
            ? "radial-gradient(circle, rgba(239,68,68,0.25), transparent 70%)"
            : "radial-gradient(circle, rgba(239,68,68,0.55), transparent 70%)",
          transition: "background 80ms",
        }}
      />
      <div
        className="font-display font-black tracking-tighter text-[22vw] md:text-[180px] leading-none"
        style={{
          color: "#fff",
          textShadow: glitch
            ? "0 0 6px #ef4444, 0 0 12px #ef4444"
            : "0 0 4px #fff, 0 0 11px #ff4444, 0 0 22px #ef4444, 0 0 42px #b91c1c, 0 0 80px #7f1d1d",
          transition: "text-shadow 80ms",
        }}
      >
        FERMÉ
      </div>
    </motion.div>
  );
}

// ── Reflet sur la vitrine (bandes diagonales animées) ──
function WindowReflection() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute -top-1/2 -left-1/4 w-[60%] h-[200%]"
        style={{
          background:
            "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.06) 47%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 53%, transparent 60%)",
        }}
        animate={{ x: ["0%", "260%"], y: ["0%", "0%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
      />
      <motion.div
        className="absolute -top-1/2 left-1/4 w-[40%] h-[200%]"
        style={{
          background:
            "linear-gradient(115deg, transparent 45%, rgba(255,255,255,0.04) 50%, transparent 55%)",
        }}
        animate={{ x: ["0%", "320%"] }}
        transition={{ duration: 13, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
      />
    </div>
  );
}

// ── Petites étoiles / poussière flottante ──
function Dust() {
  const dots = Array.from({ length: 18 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map((_, i) => {
        const left = (i * 53) % 100;
        const top = (i * 37) % 100;
        const dur = 6 + (i % 5) * 2;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-100/40"
            style={{ left: `${left}%`, top: `${top}%`, width: 2, height: 2 }}
            animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0] }}
            transition={{ duration: dur, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}

export default function Holidays() {
  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(120% 100% at 50% 18%, #1e293b 0%, #0f172a 55%, #020617 100%)",
      }}
    >
      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Cadre de la devanture */}
      <div className="relative w-full max-w-5xl mx-auto px-6 py-16 flex flex-col items-center">
        {/* Enseigne au plafond */}
        <div className="mb-2 text-[11px] tracking-[0.45em] font-bold text-amber-200/40 uppercase">
          · BTS Banque ·
        </div>

        {/* La vitrine + néon */}
        <div className="relative w-full flex flex-col items-center">
          <NeonSign />

          {/* sous-titre sobre */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-6 text-center text-slate-300/80 font-medium text-sm md:text-base tracking-wide"
          >
            Fermeture temporaire de la plateforme.
          </motion.p>
        </div>

        {/* La note épinglée */}
        <div className="relative w-full h-24 md:h-28">
          <StickyNote />
        </div>
      </div>

      {/* Reflets vitrine + poussière par-dessus */}
      <WindowReflection />
      <Dust />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 220px 60px rgba(0,0,0,0.85)" }}
      />

      {/* Pied discret */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-slate-500/40 text-[10px] tracking-[0.3em] uppercase font-semibold">
        Rideau baissé · on revient bientôt
      </div>
    </div>
  );
}