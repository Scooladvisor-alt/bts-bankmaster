import React from "react";
import EntityCRUD from "./EntityCRUD";

export default function AdminPopups({ subjectFilter }) {
  return (
    <EntityCRUD
      entityName="Popup"
      defaults={{ subject: subjectFilter || "ALL", emoji: "💡" }}
      fields={[
        { key: "subject", label: "Matière", type: "select", options: ["ALL", "VOJES", "CESBF"] },
        { key: "emoji", label: "Emoji", type: "text" },
        { key: "content", label: "Contenu (texte court)", type: "textarea" },
      ]}
      displayColumns={["subject", "emoji", "content"]}
    />
  );
}