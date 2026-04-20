import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import DuoButton from "@/components/ui-duo/DuoButton";
import { Loader2 } from "lucide-react";

export default function CreateTestData() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const createTestData = async () => {
    setLoading(true);
    setStatus("Création en cours...");
    try {
      // Test Question Jeu
      await base44.entities.Question.create({
        subject: "VOJES",
        mode: "jeu",
        chapter: "Test Chapitre Jeu",
        question: "Test Question Jeu?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct_index: 0,
        explanation: "Test explication",
        difficulty: "moyen"
      });
      setStatus("✅ Question Jeu créée");

      // Test Flashcard (Vrai ou Faux)
      await base44.entities.Flashcard.create({
        subject: "VOJES",
        chapter: "Test Chapitre VOF",
        front: "Ceci est un test?",
        back: "VRAI — C'est bien un test"
      });
      setStatus("✅ Flashcard créée");

      // Test RevisionQuestion
      await base44.entities.RevisionQuestion.create({
        subject: "VOJES",
        chapter: "Test Chapitre Revision",
        question: "Teste-moi?",
        expected_answer: "C'est un test",
        type: "mentale"
      });
      setStatus("✅ Question Révision créée - Données de test OK!");
    } catch (e) {
      setStatus("❌ Erreur: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6">
      <div className="font-bold text-amber-900 mb-3">🧪 Créer des données de test</div>
      <div className="text-sm text-amber-800 mb-3">
        Clique pour créer une question Jeu, Flashcard, et Question Révision de test.
      </div>
      <DuoButton
        variant="primary"
        onClick={createTestData}
        disabled={loading}
        className="text-sm"
      >
        {loading ? <><Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> En cours...</> : "Créer données de test"}
      </DuoButton>
      {status && <div className="mt-2 text-sm font-bold text-amber-900">{status}</div>}
    </div>
  );
}