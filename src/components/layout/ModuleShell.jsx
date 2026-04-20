import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
export default function ModuleShell({ subject, title, emoji, bgClass = "bg-gradient-to-b from-green-50 to-white", children }) {
  const navigate = useNavigate();
  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-5 pb-24">
        <button
          onClick={() => navigate(`/${subject.toLowerCase()}`)}
          className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-bold text-sm mb-5">
          
          <ChevronLeft className="w-4 h-4" /> Retour
        </button>
        <div className="flex items-center gap-3 mb-6 hidden">
          <div className="text-3xl">{emoji}</div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
              {subject}
            </div>
            <h1 className="font-display text-3xl font-bold text-stone-900">
              {title}
            </h1>
          </div>
        </div>
        {children}
      </div>
    </div>);

}