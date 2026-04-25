import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

const FREE_SECONDS = 60; // 1 minute gratuite

export default function LoginGate({ children }) {
  const [authed, setAuthed] = useState(null); // null = chargement
  const [blocked, setBlocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(FREE_SECONDS);
  const timerRef = useRef(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then((ok) => {
      setAuthed(ok);
      if (!ok) {
        // Démarre le compte à rebours uniquement pour les visiteurs non connectés
        timerRef.current = setInterval(() => {
          setSecondsLeft((s) => {
            if (s <= 1) {
              clearInterval(timerRef.current);
              setBlocked(true);
              return 0;
            }
            return s - 1;
          });
        }, 1000);
      }
    });
    return () => clearInterval(timerRef.current);
  }, []);

  // Toujours laisser passer si connecté
  if (authed === null) return null; // chargement silencieux
  if (authed) return <>{children}</>;

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <div className="relative">
      {/* Contenu sous-jacent — flou si bloqué */}
      <div className={blocked ? "pointer-events-none select-none filter blur-sm opacity-40" : ""}>
        {children}
      </div>

      {/* Petit compteur discret en haut à droite quand pas encore bloqué */}
      {!blocked && (
        <div className="fixed bottom-20 right-4 z-40 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur pointer-events-none">
          ⏱ {secondsLeft}s
        </div>
      )}

      {/* Modal de blocage */}
      <AnimatePresence>
        {blocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
            >
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="font-fredoka text-2xl font-bold text-stone-900 mb-2">
                Continue à réviser !
              </h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-6">
                Connecte-toi gratuitement pour accéder à toutes les questions, tous les modes de révision et sauvegarder ta progression.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl border-b-4 border-green-700 active:border-b-0 active:translate-y-0.5 transition-all text-base"
                >
                  <span className="text-lg">🚀</span> Se connecter
                </button>
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 bg-white border-2 border-stone-200 text-stone-700 font-bold py-3 rounded-2xl hover:bg-stone-50 transition-all text-sm"
                >
                  <span className="text-lg">📧</span> Connexion par email
                </button>
              </div>

              <p className="text-[11px] text-stone-400 mt-4">
                100% gratuit · Sauvegarde ta progression · Révise n'importe où
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}