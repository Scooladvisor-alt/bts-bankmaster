import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

// Directions d'entrée aléatoires pour varier à chaque apparition
const DIRECTIONS = [
  { initial: { opacity: 0, x: 80, y: -20, scale: 0.85 }, label: "right-top" },
  { initial: { opacity: 0, x: -80, y: -20, scale: 0.85 }, label: "left-top" },
  { initial: { opacity: 0, x: 0, y: -50, scale: 0.85 }, label: "top" },
  { initial: { opacity: 0, x: 60, y: 30, scale: 0.85 }, label: "right-bottom" },
];

export default function FloatingPopup({ subject = "ALL", alignRight = false }) {
  const [popups, setPopups] = useState([]);
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState(DIRECTIONS[0]);
  const [shimmer, setShimmer] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.Popup.list();
      // Sur la page d'accueil (subject="ALL") : tous les popups
      // Sur une page matière : seulement ALL + ceux de cette matière exacte
      const filtered = subject === "ALL"
        ? list
        : list.filter(p => p.subject === "ALL" || p.subject === subject);
      setPopups(filtered);
    })();
  }, [subject]);

  useEffect(() => {
    if (popups.length === 0) return;

    const show = () => {
      const random = popups[Math.floor(Math.random() * popups.length)];
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      setCurrent(random);
      setDirection(dir);
      setVisible(true);
      setShimmer(false);
      // Déclenche l'animation de brillance après l'apparition
      setTimeout(() => setShimmer(true), 400);
      setTimeout(() => setShimmer(false), 1600);
      timerRef.current = setTimeout(() => setVisible(false), 7000);
    };

    const first = setTimeout(show, 5000);
    const interval = setInterval(show, 30000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [popups]);

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <div className={`fixed top-3 z-40 pointer-events-none ${alignRight ? "right-3" : "left-3"}`} style={{ maxWidth: "calc(100vw - 24px)" }}>
      <AnimatePresence>
        {visible && current && (
          <motion.div
            key={current.id + direction.label}
            initial={direction.initial}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="pointer-events-auto"
          >
            {/* Liquid glass — fond or translucide, bordure brillante or */}
            <div className="relative overflow-hidden rounded-2xl"
              style={{
                background: "rgba(255, 215, 80, 0.18)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: "1.5px solid rgba(255, 215, 50, 0.8)",
                boxShadow: "0 8px 32px rgba(180,130,0,0.12), inset 0 1px 0 rgba(255,250,180,0.8)",
              }}
            >
              {/* Shimmer overlay */}
              <AnimatePresence>
                {shimmer && (
                  <motion.div
                    initial={{ x: "-100%", opacity: 0.6 }}
                    animate={{ x: "200%", opacity: 0 }}
                    exit={{}}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{
                      background: "linear-gradient(105deg, transparent 30%, rgba(255,250,180,0.7) 50%, transparent 70%)",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Bouton fermer */}
              <button
                onClick={handleClose}
                className="absolute top-2.5 right-2.5 z-20 rounded-full p-0.5 hover:bg-yellow-200/40 transition-colors"
              >
                <X className="w-3 h-3 text-amber-700" />
              </button>

              <div className="px-3 pt-2.5 pb-3 pr-7">
                <div className="text-[8px] uppercase tracking-widest font-bold mb-1" style={{ color: "#b8860b" }}>
                  Le savais-tu ?
                </div>
                <div className="text-xs font-semibold text-stone-800 whitespace-nowrap overflow-hidden text-ellipsis">
                  {current.content}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}