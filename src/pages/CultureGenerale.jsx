import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Globe } from "lucide-react";

export default function CultureGenerale() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 relative">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 font-bold text-sm mb-6 py-2 pr-3"
        >
          <ChevronLeft className="w-4 h-4" /> Accueil
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-orange-400 shadow-duo shrink-0">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Matière
            </div>
            <h1 className="font-display text-4xl font-bold text-stone-900">
              Culture Générale
            </h1>
            <div className="text-stone-600 text-sm">Modules à venir…</div>
          </div>
        </motion.div>

        <div className="bg-white rounded-3xl p-8 text-center shadow-duo border border-orange-100">
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="font-display text-2xl font-bold text-stone-800 mb-2">Bientôt disponible</h2>
          <p className="text-stone-500 text-sm">
            Les modules de Culture Générale seront ajoutés prochainement.
          </p>
        </div>
      </div>
    </div>
  );
}