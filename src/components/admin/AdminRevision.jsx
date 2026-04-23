import React from "react";
import EntityCRUD from "./EntityCRUD";

export default function AdminRevision({ subjectFilter }) {
  return (
    <EntityCRUD
      entityName="RevisionQuestion"
      subjectFilter={subjectFilter}
      defaults={{ subject: subjectFilter || "VOJES", type: "mentale" }}
      fields={[
         { key: "subject", label: "Matière", type: "select", options: ["VOJES", "CESBF"] },
         { key: "chapter", label: "Chapitre", type: "text" },
         { key: "question", label: "Question", type: "textarea" },
         { key: "expected_answer", label: "Réponse attendue", type: "textarea" },
       ]}
      displayColumns={["subject", "chapter", "question"]}
    />
  );
}