import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Palmtree, IceCream, Umbrella, Waves, PartyPopper } from "lucide-react";

const FLOATING_ITEMS = [
  { Icon: Sun, color: "#fbbf24", delay: 0,    duration: 6 },
  { Icon: Palmtree, color: "#16a34a", delay: 0.8,  duration: 7 },
  { Icon: IceCream, color: "#f472b6", delay: 1.6,  duration: 8 },
  { Icon: PartyPopper, color: "#0ea5e9", delay: 2.4, duration: 6.5 },
  { Icon: Umbrella, color: "#ef4444", delay: 3.2, duration: 7.5 },
  { Icon: Waves, color: "#38bdf8", delay: 4.0,  duration: 9 },
];

const COUNTDOWN_TARGET = new Date("2026-08-31T08:00:00+02:00");

function useCountdown() {
  const calc = () => {
    const diff = COUNTDOWN_TARGET.getTime() - Date.now();
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return { days, hours, mins, secs };
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
  }, []);
  return left;
}

export default function Holidays() {
  const left = useCountdown();

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center"
      style={{ background: "linear-gradient(180deg, #87ceeb 0%, #38bdf8 45%, #fde68a 100%)" }}>

      {/* Soleil pulsant en haut */}
      <motion.div
        className="absolute top-[-60px] right-[-40px] w-56 h-56 rounded-full"
        style={{ background: "radial-gradient(circle, #fde047 30%, rgba(253,224,71,0.3) 70%, transparent 100%)" }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Nuages */}
      {[
        { top: "12%", left: "8%",  delay: 0,   dur: 45 },
        { top: "24%", left: "70%", delay: 8,   dur: 55 },
        { top: "45%", left: "15%", delay: 16,  dur: 50 },
      ].map((c, i) => (
        <motion.div
          key={i}
          className="absolute text-white/90 select-none"
          style={{ top: c.top, left: c.left, fontSize: 60 }}
          animate={{ x: [0, 40, 0] }}
          transition={{ duration: c.dur, repeat: Infinity, ease: "easeInOut", delay: c.delay }}
        >
          ☁️
        </motion.div>
      ))}

      {/* Icônes flottantes */}
      {FLOATING_ITEMS.map(({ Icon, color, delay, duration }, i) => (
        <motion.div
          key={i}
          className="absolute opacity-30 select-none pointer-events-none"
          style={{
            top: `${15 + (i * 13) % 65}%`,
            left: `${5 + (i * 17) % 85}%`,
          }}
          animate={{ y: [0, -22, 0], rotate: [0, 12, -12, 0] }}
          transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
        >
          <Icon size={42} color={color} />
        </motion.div>
      ))}

      {/* Vagues animées en bas */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <motion.svg viewBox="0 0 1440 120" className="w-full h-24 md:h-32"
          preserveAspectRatio="none" style={{ display: "block" }}>
          <motion.path
            fill="#0ea5e9"
            fillOpacity="0.5"
            animate={{
              d: [
                "M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z",
                "M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,120 L0,120 Z",
                "M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z",
              ],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            fill="#0284c7"
            fillOpacity="0.7"
            animate={{
              d: [
                "M0,80 C240,40 480,120 720,80 C960,40 1200,120 1440,80 L1440,120 L0,120 Z",
                "M0,80 C240,120 480,40 720,80 C960,120 1200,40 1440,80 L1440,120 L0,120 Z",
                "M0,80 C240,40 480,120 720,80 C960,40 1200,120 1440,80 L1440,120 L0,120 Z",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.svg>
      </div>

      {/* Carte centrale */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="relative z-10 mx-4 w-full max-w-md"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden">

            {/* Bandeau */}
            <div className="relative px-6 pt-8 pb-6 text-center"
              style={{ background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)" }}>
              <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block mb-3"
              >
                <Umbrella size={56} className="text-white" />
              </motion.div>
              <h1 className="font-display text-4xl font-black text-white tracking-tight drop-shadow-sm">
                Fermé pour les vacances !
              </h1>
              <p className="text-white/90 text-sm font-semibold mt-2">
                🏖️ Le BTS Banque prend une pause bien méritée
              </p>
            </div>

            {/* Corps */}
            <div className="px-6 py-7 text-center">
              <p className="text-stone-700 font-semibold text-sm leading-relaxed mb-6">
                La plateforme est temporairement inaccessible.
                Profites-en pour te reposer, bronzer et recharger les batteries — on se retrouve à la rentrée pour réviser encore plus fort ! ☀️
              </p>

              {/* Compteur */}
              {left && (
                <div className="mb-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">
                    ⏳ Réouverture dans
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { v: left.days,   l: "Jours" },
                      { v: left.hours,  l: "Heures" },
                      { v: left.mins,   l: "Min" },
                      { v: left.secs,   l: "Sec" },
                    ].map((x, i) => (
                      <div key={i} className="bg-orange-50 border-2 border-orange-200 rounded-2xl py-2.5 px-1 shadow-duo">
                        <div className="font-display text-2xl font-black text-orange-600 tabular-nums">
                          {String(x.v).padStart(2, "0")}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500 mt-0.5">
                          {x.l}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-2 font-medium">
                    Rentrée prévue le 31 août 2026
                  </div>
                </div>
              )}

              {/* Suggestions vacances */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-1">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-600 mb-2">
                  🎒 Programme de vacances recommandé
                </div>
                <ul className="text-left text-stone-700 text-sm font-semibold space-y-1.5">
                  <li className="flex items-center gap-2"><span>😴</span> Dormir jusqu'à 11h</li>
                  <li className="flex items-center gap-2"><span>🏊</span> Se baigner sans penser aux QCM</li>
                  <li className="flex items-center gap-2"><span>🍦</span> Manger une glace (pas une "loss")</li>
                  <li className="flex items-center gap-2"><span>📚</span> Zéro révision (promis !)</li>
                </ul>
              </div>

              <div className="mt-5 text-stone-400 text-[11px] font-medium">
                Bons vacances à tous les réviseurs ! 🌴
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}