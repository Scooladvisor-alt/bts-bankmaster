import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Star, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Confettis ──
function Confetti() {
  const colors = ["#fbbf24", "#f472b6", "#34d399", "#60a5fa", "#a78bfa", "#fb923c", "#f87171", "#4ade80"];
  const pieces = useRef(
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      x: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 2 + Math.random() * 2,
      size: 7 + Math.random() * 10,
      rotate: Math.random() * 720,
      isCircle: Math.random() > 0.5,
    }))
  ).current;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9997] overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -30, x: `${p.x}vw`, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ y: "105vh", opacity: [1, 1, 1, 0], rotate: p.rotate, scale: [1, 1.2, 0.8, 1] }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: "absolute",
            top: 0,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

// ── Modal de félicitations ──
function FelicitationModal({ felicitation, onDismiss }) {
  return (
    <>
      <Confetti />
      {/* Overlay sombre */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm"
        onClick={onDismiss}
      />
      {/* Card centrale */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-6 pointer-events-none"
      >
        <div className="pointer-events-auto w-full max-w-sm">
          {/* Icône trophée animée au-dessus */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
            className="flex justify-center mb-4"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center shadow-2xl border-4 border-white">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-yellow-300">
            {/* Header doré */}
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 px-5 py-4 text-center relative">
              <div className="flex justify-center gap-1 mb-1">
                {[0, 1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.08, type: "spring" }}
                  >
                    <Star className="w-5 h-5 text-white fill-white" />
                  </motion.div>
                ))}
              </div>
              <h2 className="font-display text-2xl font-bold text-white tracking-wide drop-shadow">
                Félicitations ! 🎉
              </h2>
              <button
                onClick={onDismiss}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Message */}
            <div className="px-6 py-5">
              <p className="text-stone-800 text-base leading-relaxed font-medium text-center mb-5">
                {felicitation.message}
              </p>

              {/* Expéditeur */}
              <div className="flex items-center gap-3 bg-stone-50 rounded-2xl px-4 py-3 border border-stone-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0 shadow">
                  <span className="text-white font-bold text-sm">
                    {(felicitation.fromName || "?")[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Message de</div>
                  <div className="text-sm font-bold text-stone-800">{felicitation.fromName}</div>
                </div>
              </div>

              {/* Bouton fermer */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onDismiss}
                className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-display font-bold text-base shadow-lg hover:opacity-90 transition-opacity"
              >
                Merci ! 🙏
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Composant principal ──
export default function FelicitationToast() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const timerRef = useRef(null);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    const check = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) return;

      const user = await base44.auth.me();
      // Seuls les élèves (role "user" ou pas de role) reçoivent des félicitations
      if (!user || (user.role && user.role !== "user")) return;

      // Récupère TOUTES les félicitations destinées à cet utilisateur
      const all = await base44.entities.Felicitation.filter({ toUserId: user.id }, "-created_date", 50);
      // Filtre côté client les non vues (évite le bug du filtre booléen en BDD)
      const unseen = (all || []).filter(f => !f.seen);

      if (unseen.length > 0) {
        setQueue(unseen);
      }
    };

    // Petit délai pour laisser l'app charger
    setTimeout(check, 1500);
  }, []);

  // Affiche le prochain dès que la queue change et qu'il n'y a pas d'actif
  useEffect(() => {
    if (queue.length > 0 && !current) {
      const next = queue[0];
      setQueue(prev => prev.slice(1));
      setCurrent(next);

      // Marque comme vu
      base44.entities.Felicitation.update(next.id, { seen: true });

      // Auto-fermeture après 20s
      timerRef.current = setTimeout(dismiss, 20000);
    }
  }, [queue, current]);

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent(null);
    // Laisse 600ms avant d'afficher le suivant éventuel
    setTimeout(() => {
      setQueue(prev => {
        if (prev.length > 0) {
          const next = prev[0];
          const rest = prev.slice(1);
          setCurrent(next);
          base44.entities.Felicitation.update(next.id, { seen: true });
          timerRef.current = setTimeout(dismiss, 20000);
          return rest;
        }
        return prev;
      });
    }, 600);
  };

  return (
    <AnimatePresence>
      {current && (
        <FelicitationModal
          key={current.id}
          felicitation={current}
          onDismiss={dismiss}
        />
      )}
    </AnimatePresence>
  );
}