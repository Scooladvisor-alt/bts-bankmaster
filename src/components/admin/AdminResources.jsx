import React from "react";
import EntityCRUD from "./EntityCRUD";

export default function AdminResources({ subjectFilter }) {
  return (
    <EntityCRUD
      entityName="Resource"
      subjectFilter={subjectFilter}
      defaults={{ subject: subjectFilter || "VOJES", type: "lien" }}
      fields={[
        { key: "subject", label: "Matière", type: "select", options: ["VOJES", "CESBF"] },
        { key: "type", label: "Type", type: "select", options: ["video", "podcast", "diagramme", "lien"] },
        { key: "title", label: "Titre", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "url", label: "URL", type: "text" },
      ]}
      displayColumns={["subject", "type", "title", "url"]}
    />
  );
}