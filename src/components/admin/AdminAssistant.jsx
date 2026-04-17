import React from "react";
import EntityCRUD from "./EntityCRUD";

export default function AdminAssistant() {
  return (
    <EntityCRUD
      entityName="AssistantLink"
      defaults={{ subject: "VOGES" }}
      fields={[
        { key: "subject", label: "Matière", type: "select", options: ["VOGES", "CESBF"] },
        { key: "url", label: "URL assistant (ChatGPT custom, etc.)", type: "text" },
      ]}
      displayColumns={["subject", "url"]}
    />
  );
}