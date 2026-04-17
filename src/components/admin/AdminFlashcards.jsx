import React from "react";
import EntityCRUD from "./EntityCRUD";

export default function AdminFlashcards() {
  return (
    <EntityCRUD
      entityName="Flashcard"
      defaults={{ subject: "VOGES" }}
      fields={[
        { key: "subject", label: "Matière", type: "select", options: ["VOGES", "CESBF"] },
        { key: "chapter", label: "Chapitre", type: "text" },
        { key: "front", label: "Recto (question)", type: "textarea" },
        { key: "back", label: "Verso (réponse)", type: "textarea" },
      ]}
      displayColumns={["subject", "chapter", "front", "back"]}
    />
  );
}