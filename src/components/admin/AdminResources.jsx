import React from "react";
import EntityCRUD from "./EntityCRUD";

export default function AdminResources() {
  return (
    <EntityCRUD
      entityName="Resource"
      defaults={{ subject: "VOGES", type: "lien" }}
      fields={[
        { key: "subject", label: "Matière", type: "select", options: ["VOGES", "CESBF"] },
        { key: "type", label: "Type", type: "select", options: ["video", "podcast", "diagramme", "lien"] },
        { key: "title", label: "Titre", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "url", label: "URL", type: "text" },
      ]}
      displayColumns={["subject", "type", "title", "url"]}
    />
  );
}