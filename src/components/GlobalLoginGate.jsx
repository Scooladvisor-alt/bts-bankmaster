import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

const DELAY_MS = 20000;
const CONFETTI_COLORS = ["#f59e0b", "#ef4444", "#22c55e", "#3b82f6", "#ec4899", "#8b5cf6"];
const CONFETTI_KEY = "bts_confetti_shown";

// Lance une pluie de confettis colorés
function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    r: Math.random() * 7 + 4,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.15,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));

  let frame = 0;
  const MAX_FRAMES = 150;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / MAX_FRAMES);
      if (p.shape === "rect") {
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.5);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      p.vy += 0.05;
    });
    frame++;
    if (frame < MAX_FRAMES) {
      requestAnimationFrame(draw);
    } else {
      document.body.removeChild(canvas);
    }
  }
  requestAnimationFrame(draw);
}

export default function GlobalLoginGate() {
  const [showModal, setShowModal] = useState(false);
  const checkedRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    // Lance les confettis si l'utilisateur est connecté et que c'est la première visite du jour
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) {
        const today = new Date().toISOString().slice(0, 10);
        const lastSeen = sessionStorage.getItem(CONFETTI_KEY);
        if (lastSeen !== today) {
          sessionStorage.setItem(CONFETTI_KEY, today);
          setTimeout(launchConfetti, 800);
        }
      }
    });

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