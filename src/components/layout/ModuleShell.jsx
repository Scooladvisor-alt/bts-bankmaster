import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
export default function ModuleShell({ subject, title, emoji, bgClass = "bg-gradient-to-b from-green-50 to-white", children }) {
  const navigate = useNavigate();
  return (
    <div className={`min-h-screen ${bgClass}`} style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-5 pb-24">
        <button
          onClick={() => navigate(`/${subject.toLowerCase()}`)}
          className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-bold text-sm mb-5">
          
          <ChevronLeft className="w-4 h-4" /> Retour
        </button>
        









        
        {children}
      </div>
    </div>);

}