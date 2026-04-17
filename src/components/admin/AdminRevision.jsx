import React from "react";
import EntityCRUD from "./EntityCRUD";

export default function AdminRevision() {
  return (
    <EntityCRUD
      entityName="RevisionQuestion"
      defaults={{ subject: "VOGES", type: "mentale" }}
      fields={[
        { key: "subject", label: "Matière", type: "select", options: ["VOGES", "CESBF"] },
        { key: "type", label: "Type", type: "select", options: ["mentale", "libre"] },
        { key: "chapter", label: "Chapitre", type: "text" },
        { key: "question", label: "Question", type: "textarea" },
        { key: "expected_answer", label: "Réponse attendue", type: "textarea" },
      ]}
      displayColumns={["subject", "type", "chapter", "question"]}
    />
  );
}