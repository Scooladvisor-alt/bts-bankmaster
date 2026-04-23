import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import EntityCRUD from "./EntityCRUD";
import { Loader2 } from "lucide-react";

export default function AdminQuestions({ subjectFilter, modeFilter }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
      setLoadingUser(false);
    })();
  }, []);

  if (loadingUser) {
    return <div className="flex items-center gap-2 text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement…</div>;
  }

  const isTeacher = currentUser?.role === "teacher";
  // Si professeur, sa matière est forcée ; sinon on utilise le filtre de l'admin
  const effectiveSubject = isTeacher ? currentUser.teacherSubject : subjectFilter;
  const extraFilter = modeFilter ? { mode: modeFilter } : {};

  const fields = [
    {
      key: "subject",
      label: "Matière",
      type: "select",
      options: ["VOJES", "CESBF"],
      // verrouillé si prof (ne peut pas changer la matière) ou si subjectFilter admin
      locked: isTeacher || !!subjectFilter,
    },
    { key: "mode", label: "Mode QCM", type: "select", options: ["pareto", "infini", "jeu"], locked: !!modeFilter },
    { key: "question", label: "Question", type: "textarea" },
    { key: "options", label: "Options (A/B/C/D)", type: "array-options" },
    { key: "correct_index", label: "Index correct (0 = A, 1 = B, 2 = C, 3 = D)", type: "number" },
    { key: "explanation", label: "Explication (optionnel)", type: "textarea" },
  ];

  return (
    <div>
      {isTeacher && (
        <div className="mb-4 flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 text-sm font-bold text-purple-700">
          👩‍🏫 Espace Professeur —{" "}
          <span className={effectiveSubject === "VOJES" ? "text-purple-700" : "text-orange-600"}>
            {effectiveSubject}
          </span>
          <span className="font-normal text-purple-500 ml-1">· Vous gérez uniquement les questions de votre matière.</span>
        </div>
      )}
      <EntityCRUD
        entityName="Question"
        subjectFilter={effectiveSubject}
        extraFilter={extraFilter}
        defaults={{
          subject: effectiveSubject || "VOJES",
          mode: modeFilter || "pareto",
          options: ["", "", "", ""],
          correct_index: 0,
        }}
        fields={fields}
        displayColumns={["question"]}
      />
    </div>
  );
}