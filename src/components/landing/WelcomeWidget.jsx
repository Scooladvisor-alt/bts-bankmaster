import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLocalUser, saveLocalUser, registerUserForAdmin, startTimeTracking } from "@/lib/localUser";

export default function WelcomeWidget({ onReady }) {
  const [step, setStep] = useState("loading"); // loading | ask | done
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getLocalUser();
    if (user?.name) {
      startTimeTracking();
      onReady(user.name);
      setStep("done");
    } else {
      setStep("ask");
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError("Entre ton prénom pour continuer !"); return; }
    saveLocalUser({ name: trimmed, createdAt: new Date().toISOString() });
    registerUserForAdmin(trimmed);
    startTimeTracking();
    onReady(trimmed);
    setStep("done");
  };

  if (step === "loading" || step === "done") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900/80 via-stone-900/80 to-orange-900/80 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative w-full max-w-sm mx-4"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-purple-500/30 rounded-3xl blur-2xl scale-110" />

          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(32px)",
              border: "1.5px solid rgba(255,255,255,0.2)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-purple-400 to-orange-400" />

            <div className="px-7 pt-8 pb-8">
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 text-3xl">
                  📚
                </div>
              </div>

              <h2 className="font-display text-2xl font-bold text-white text-center mb-1">
                Bienvenue sur BTS Banque !
              </h2>
              <p className="text-white/60 text-sm text-center mb-7 leading-relaxed">
                Entre ton prénom pour personnaliser ta session de révision.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    autoFocus
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    placeholder="Ton prénom…"
                    className="w-full rounded-2xl px-4 py-3.5 text-base font-semibold text-stone-800 placeholder-stone-400 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.92)",
                      border: "2px solid rgba(255,255,255,0.3)",
                    }}
                    maxLength={30}
                  />
                  {error && <p className="text-red-300 text-xs mt-1.5 pl-1">{error}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl font-display font-bold text-lg text-yellow-900 transition-all border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1"
                  style={{
                    background: "linear-gradient(135deg, #fde047 0%, #f59e0b 100%)",
                    boxShadow: "0 6px 24px rgba(245,158,11,0.35)",
                  }}
                >
                  Commencer à réviser →
                </button>
              </form>

              <p className="text-white/30 text-xs text-center mt-5">
                Aucune inscription requise · Tout est sauvegardé sur ton navigateur
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}