import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import FloatingPopup from "@/components/popup/FloatingPopup";
import RoleModal from "@/components/landing/RoleModal";
import { Sparkles, Zap, Brain, Settings } from "lucide-react";

export default function Landing() {
  const [showRoleModal, setShowRoleModal] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 relative overflow-hidden">
      <FloatingPopup subject="ALL" />

      {/* Blobs déco */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

      <button
        onClick={() => setShowRoleModal(true)}
        className="absolute top-4 left-4 z-10 bg-white/70 backdrop-blur rounded-full p-2 text-stone-500 hover:text-stone-800"
        aria-label="Paramètres"
      >
        <Settings className="w-4 h-4" />
      </button>

      {showRoleModal && <RoleModal onClose={() => setShowRoleModal(false)} />}

      <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-yellow-200 text-yellow-900 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" /> Spécial BTS Banque
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-stone-900 leading-tight">
            Révise vite.
            <br />
            <span className="text-primary">Réussis fort.</span>
          </h1>
          <p className="mt-6 text-lg text-stone-600 max-w-xl mx-auto">
            Plateforme de révision pour la classe de Antonin 🐐. 
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <SubjectCard
            to="/voges"
            label="VOGES"
            emoji="📊"
            tagline="Veille, organisationnelle, juridique & sectorielle"
            gradient="from-purple-500 via-purple-600 to-indigo-600"
            delay={0.1}
          />
          <SubjectCard
            to="/cesbf"
            label="CESBF"
            emoji="🏦"
            tagline="Conseil/Expertise en Solution Bancaire & Financière"
            gradient="from-orange-400 via-orange-500 to-red-500"
            delay={0.2}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid grid-cols-3 gap-3 max-w-2xl mx-auto text-center"
        >
          <Feature icon={Zap} label="Rapide" desc="Pareto : 20% = 80%" />
          <Feature icon={Brain} label="Efficace" desc="Neurosciences" />
          <Feature icon={Sparkles} label="Ludique" desc="Mode jeu" />
        </motion.div>
      </div>
    </div>
  );
}

const SubjectCard = ({ to, label, emoji, tagline, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: "spring", stiffness: 100 }}
  >
    <Link to={to}>
      <div
        className={`group relative bg-gradient-to-br ${gradient} rounded-3xl p-8 shadow-duo-lg border-b-[6px] border-black/20 hover:-translate-y-1 transition-transform cursor-pointer h-52 flex flex-col justify-between`}
      >
        <div>
          <div className="text-6xl mb-3">{emoji}</div>
          <div className="text-white/80 text-xs font-bold uppercase tracking-widest">
            Réviser
          </div>
          <div className="font-display text-white text-4xl font-bold mt-1">
            {label}
          </div>
          <div className="text-white/90 text-sm mt-3 font-medium">{tagline}</div>
        </div>
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur rounded-full px-3 py-1 text-white text-xs font-bold">
          GO →
        </div>
      </div>
    </Link>
  </motion.div>
);

const Feature = ({ icon: Icon, label, desc }) => (
  <div className="bg-white rounded-2xl p-4 shadow-duo border border-stone-100">
    <Icon className="w-5 h-5 mx-auto text-primary mb-1" />
    <div className="font-bold text-sm">{label}</div>
    <div className="text-xs text-stone-500">{desc}</div>
  </div>
);