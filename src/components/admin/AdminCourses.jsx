import React from "react";
import EntityCRUD from "./EntityCRUD";

export default function AdminCourses() {
  return (
    <EntityCRUD
      entityName="Course"
      defaults={{ subject: "VOGES", order: 0 }}
      fields={[
        { key: "subject", label: "Matière", type: "select", options: ["VOGES", "CESBF"] },
        { key: "title", label: "Titre", type: "text" },
        { key: "order", label: "Ordre d'affichage", type: "number" },
        { key: "content", label: "Contenu (markdown supporté)", type: "textarea" },
      ]}
      displayColumns={["subject", "title", "order"]}
    />
  );
}