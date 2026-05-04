import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

// Chrono global de 20 secondes — actif partout sur le site
// Si l'utilisateur n'est pas connecté après 20s, affiche une modale de connexion
const DELAY_MS = 20000;

export default function GlobalLoginGate() {
  const [showModal, setShowModal] = useState(false);
  const checkedRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    timerRef.current = setTimeout(async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        setShowModal(true);
      }
    }, DELAY_MS);

    return () => clearTimeout(timerRef.current);
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AnimatePresence>
      {showModal && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9990] backdrop-blur-sm"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-[9991] flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-green-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-5 text-center">
                <div className="text-5xl mb-2">🔐</div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Connecte-toi pour continuer
                </h2>
              </div>

              {/* Body */}
              <div className="px-6 py-5 text-center">
                <p className="text-stone-600 text-sm leading-relaxed mb-5">
                  Pour accéder à toutes les fonctionnalités de révision et sauvegarder ta progression, tu dois te connecter.
                </p>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogin}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-display font-bold text-base shadow-lg hover:opacity-90 transition-opacity border-b-4 border-green-700 active:border-b-0 active:translate-y-1"
                >
                  Se connecter →
                </motion.button>

                <button
                  onClick={() => setShowModal(false)}
                  className="mt-3 text-xs text-stone-400 hover:text-stone-600 transition-colors underline"
                >
                  Continuer sans compte (fonctionnalités limitées)
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}