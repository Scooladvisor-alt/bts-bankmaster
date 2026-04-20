import React from "react";
import EntityCRUD from "./EntityCRUD";

export default function AdminAssistant({ subjectFilter }) {
  return (
    <EntityCRUD
      entityName="AssistantLink"
      subjectFilter={subjectFilter}
      defaults={{ subject: subjectFilter || "VOJES" }}
      fields={[
        { key: "subject", label: "Matière", type: "select", options: ["VOJES", "CESBF"] },
        { key: "url", label: "URL assistant (ChatGPT custom, etc.)", type: "text" },
      ]}
      displayColumns={["subject", "url"]}
    />
  );
}