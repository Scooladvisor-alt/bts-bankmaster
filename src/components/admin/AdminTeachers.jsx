import React from "react";
import EntityCRUD from "./EntityCRUD";

export default function AdminTeachers() {
  return (
    <EntityCRUD
      entityName="Teacher"
      defaults={{ subject: "VOGES", email: "", name: "", password: "" }}
      fields={[
        { key: "name", label: "Nom", type: "text" },
        { key: "email", label: "Email", type: "text" },
        { key: "subject", label: "Matière", type: "select", options: ["VOGES", "CESBF"] },
        { key: "password", label: "Mot de passe", type: "text" },
      ]}
      displayColumns={["name", "email", "subject"]}
    />
  );
}