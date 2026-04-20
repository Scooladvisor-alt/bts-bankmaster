import React from "react";
import EntityCRUD from "./EntityCRUD";

export default function AdminCourses({ subjectFilter }) {
  return (
    <EntityCRUD
      entityName="Course"
      subjectFilter={subjectFilter}
      defaults={{ subject: subjectFilter || "VOJES", order: 0 }}
      fields={[
        { key: "subject", label: "Matière", type: "select", options: ["VOJES", "CESBF"] },
        { key: "title", label: "Titre", type: "text" },
        { key: "order", label: "Ordre d'affichage", type: "number" },
        { key: "content", label: "Contenu (markdown supporté)", type: "textarea" },
      ]}
      displayColumns={["subject", "title", "order"]}
    />
  );
}