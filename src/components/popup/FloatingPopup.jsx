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
      style={{ maxWidth: "320px" }}
    >
      <AnimatePresence>
        {visible && current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.93 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="pointer-events-auto"
          >
            <div className="relative flex items-center gap-2 bg-yellow-50 border-2 border-yellow-300 rounded-2xl px-3 py-2.5 shadow-duo"
              style={{ boxShadow: "0 4px 0 0 rgba(202,138,4,0.35)" }}
            >
              {/* Label */}
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-yellow-700 shrink-0">
                💡
              </div>

              {/* Contenu — une seule ligne avec ellipsis */}
              <div className="text-sm font-semibold text-stone-800 whitespace-nowrap overflow-hidden text-ellipsis flex-1 pr-6">
                {current.content}
              </div>

              {/* Bouton fermer */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-yellow-200 hover:bg-yellow-300 transition-colors shrink-0"
              >
                <X className="w-3 h-3 text-yellow-800" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}