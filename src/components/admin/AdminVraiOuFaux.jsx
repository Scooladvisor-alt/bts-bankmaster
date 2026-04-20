import React from "react";
import EntityCRUD from "./EntityCRUD";

export default function AdminVraiOuFaux({ subjectFilter }) {
  return (
    <EntityCRUD
      entityName="Flashcard"
      subjectFilter={subjectFilter}
      defaults={{ subject: subjectFilter || "VOJES" }}
      fields={[
        { key: "subject", label: "Matière", type: "select", options: ["VOJES", "CESBF"] },
        { key: "chapter", label: "Chapitre", type: "text" },
        { key: "front", label: "Affirmation (question)", type: "textarea" },
        { key: "back", label: "Réponse : commencer par VRAI ou FAUX — explication", type: "textarea" },
      ]}
      displayColumns={["chapter", "front", "back"]}
    />
  );
}