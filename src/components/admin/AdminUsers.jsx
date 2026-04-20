import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("users");
    const userList = stored ? Object.values(JSON.parse(stored)) : [];
    setUsers(userList);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-stone-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 text-stone-600">
          <tr>
            <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-widest">Nom</th>
            <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-widest">Dernière visite</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="2" className="text-center py-6 text-stone-400 text-sm">Aucun utilisateur</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.name} className="border-t border-stone-100 hover:bg-stone-50">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3 text-stone-500">
                  {user.lastVisit ? new Date(user.lastVisit).toLocaleDateString("fr-FR") : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}