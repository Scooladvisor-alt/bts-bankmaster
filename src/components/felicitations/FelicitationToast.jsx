import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Confetti() {
  const colors = ["#fbbf24", "#f472b6", "#34d399", "#60a5fa", "#a78bfa", "#fb923c"];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.5 + Math.random() * 1.5,
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: [1, 1, 0], rotate: p.rotate + 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            top: 0,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

export default function FelicitationToast() {
  const [pending, setPending] = useState([]);
  const [current, setCurrent] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const checkFelicitations = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) return;
      const user = await base44.auth.me();
      if (!user || user.role !== "user") return;

      const list = await base44.entities.Felicitation.filter({ toUserId: user.id, seen: false }, "-created_date", 20);
      if (list && list.length > 0) {
        setPending(list);
      }
    };
    checkFelicitations();
  }, []);

  useEffect(() => {
    if (pending.length > 0 && !current) {
      const next = pending[0];
      setCurrent(next);
      setShowConfetti(true);
      setPending(prev => prev.slice(1));

      // Mark as seen
      base44.entities.Felicitation.update(next.id, { seen: true });

      // Auto-close after 12s
      timerRef.current = setTimeout(() => {
        setCurrent(null);
        setShowConfetti(false);
      }, 12000);
    }
  }, [pending, current]);

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent(null);
    setShowConfetti(false);
  };

  return (
    <>
      {showConfetti && <Confetti />}
      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-yellow-300 overflow-hidden">
              {/* Bandeau doré */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[0,1,2].map(i => <Star key={i} className="w-4 h-4 text-white fill-white" />)}
                </div>
                <span className="font-display font-bold text-white text-sm tracking-wide flex-1">Félicitations !</span>
                <button onClick={dismiss} className="p-1 rounded-lg hover:bg-white/20"><X className="w-4 h-4 text-white" /></button>
              </div>

              {/* Corps */}
              <div className="px-4 py-4">
                <p className="text-stone-800 text-sm leading-relaxed font-medium mb-3">
                  {current.message}
                </p>
                <div className="flex items-center gap-2 border-t border-stone-100 pt-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{(current.fromName || "?")[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-700">{current.fromName}</div>
                    <div className="text-[10px] text-stone-400">{current.fromEmail}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}