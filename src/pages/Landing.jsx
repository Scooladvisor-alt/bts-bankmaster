import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import FloatingPopup from "@/components/popup/FloatingPopup";
import RoleModal from "@/components/landing/RoleModal";
import { Sparkles } from "lucide-react";
import TopBar from "@/components/layout/TopBar";

export default function Landing() {
  const [showRoleModal, setShowRoleModal] = useState(false); // eslint-disable-line

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 relative overflow-hidden">
      <FloatingPopup subject="ALL" />
      <TopBar />

      {/* Blobs déco */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

      {showRoleModal && <RoleModal onClose={() => setShowRoleModal(false)} />}

      <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">
          
          <div className="inline-flex items-center gap-2 bg-yellow-200 text-yellow-900 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" /> Spécial BTS Banque
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-stone-900 leading-tight">
            Revise vite !
            <br />
            <span className="text-primary">Réussis fort.</span>
          </h1>
          

          
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-4">
          <SubjectCard
            to="/vojes"
            label="VOJES"
            emoji="📊"
            tagline="Veille, organisationnelle, juridique & sectorielle"
            gradient="from-purple-500 via-purple-600 to-indigo-600"
            delay={0.1} />
          
          <SubjectCard
            to="/cesbf"
            label="CESBF"
            emoji="🏦"
            tagline="Conseil/Expertise en Solution Bancaire & Financière"
            gradient="from-orange-400 via-orange-500 to-red-500"
            delay={0.2} />
          
        </div>
      </div>
    {/* Bannière défilante pied de page */}
    <div className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden bg-orange-500 py-3 border-t-4 border-orange-600">
      <div className="flex whitespace-nowrap" style={{ animation: "marquee 18s linear infinite" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-8 font-fredoka font-bold text-black text-xl tracking-wide shrink-0">
            🏆 100% DE RÉUSSITE À L'EXAMEN DU BTS BANQUE
            <span className="text-orange-900">★</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
    </div>);

}

const SubjectCard = ({ to, label, emoji, tagline, gradient, delay }) =>
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay, type: "spring", stiffness: 100 }}>
  
    <Link to={to}>
      <div
      className={`group relative bg-gradient-to-br ${gradient} rounded-3xl p-8 shadow-duo-lg border-b-[6px] border-black/20 hover:-translate-y-1 transition-transform cursor-pointer h-64 flex flex-col justify-between`}>
      
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
  </motion.div>;