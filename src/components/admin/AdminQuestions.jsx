import React from "react";
import EntityCRUD from "./EntityCRUD";

export default function AdminQuestions() {
  return (
    <EntityCRUD
      entityName="Question"
      defaults={{ subject: "VOGES", mode: "pareto", options: ["", "", "", ""], correct_index: 0, difficulty: "moyen" }}
      fields={[
        { key: "subject", label: "Matière", type: "select", options: ["VOGES", "CESBF"] },
        { key: "mode", label: "Mode QCM", type: "select", options: ["pareto", "infini", "jeu"] },
        { key: "chapter", label: "Chapitre", type: "text" },
        { key: "question", label: "Question", type: "textarea" },
        { key: "options", label: "Options (A/B/C/D)", type: "array-options" },
        { key: "correct_index", label: "Index correct (0 = A, 1 = B, 2 = C, 3 = D)", type: "number" },
        { key: "explanation", label: "Explication (optionnel)", type: "textarea" },
        { key: "difficulty", label: "Difficulté", type: "select", options: ["facile", "moyen", "difficile"] },
      ]}
      displayColumns={["subject", "mode", "chapter", "question"]}
    />
  );
}