import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

export default function FloatingPopup({ subject = "ALL", alignRight = false }) {
  const [popups, setPopups] = useState([]);
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.Popup.list();
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
      setCurrent(random);
      setVisible(true);
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
    <div
      className={`fixed top-4 z-40 pointer-events-none ${alignRight ? "right-4" : "left-4"}`}
    >
      <AnimatePresence>
        {visible && current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: -20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="pointer-events-auto relative overflow-hidden"
          >
            {/* Fond rouge/roux transparent brillant */}
            <div
              className="flex items-center bg-red-600/80 backdrop-blur border border-red-400/60 rounded-xl px-4 py-2"
              style={{ boxShadow: "0 2px 12px rgba(220,38,38,0.35)" }}
            >
              {/* Texte sur une seule ligne, widget s'adapte à la largeur */}
              <span className="text-xs font-semibold text-white whitespace-nowrap pr-5">
                {current.content}
              </span>

              {/* Bouton fermer */}
              <button
                onClick={handleClose}
                className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors shrink-0"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>

            {/* Effet brillance au montage */}
            <motion.div
              initial={{ x: "-100%", opacity: 0.7 }}
              animate={{ x: "200%", opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none skew-x-12"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}