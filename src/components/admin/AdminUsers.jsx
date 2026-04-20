import React, { useEffect, useState } from "react";
import { getAdminUsers } from "@/lib/localUser";
import { Users, Clock, Calendar } from "lucide-react";

function formatTime(seconds) {
  if (!seconds) return "0 min";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(getAdminUsers());
  }, []);

  const totalSeconds = users.reduce((acc, u) => acc + (u.totalSeconds || 0), 0);

  return (
    <div>
      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900">{users.length}</div>
            <div className="text-xs text-stone-500 font-medium">Utilisateurs</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900">{formatTime(totalSeconds)}</div>
            <div className="text-xs text-stone-500 font-medium">Temps total (tous)</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900">
              {users.length > 0 ? formatTime(Math.round(totalSeconds / users.length)) : "—"}
            </div>
            <div className="text-xs text-stone-500 font-medium">Moy. par utilisateur</div>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 text-stone-400">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-medium">Aucun utilisateur enregistré pour le moment.</p>
          <p className="text-sm mt-1">Les utilisateurs apparaîtront ici lorsqu'ils se connecteront depuis ce navigateur.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-widest">Prénom</th>
                <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-widest">Première visite</th>
                <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-widest">Dernière visite</th>
                <th className="text-left px-4 py-3 font-bold uppercase text-[11px] tracking-widest">Temps total</th>
              </tr>
            </thead>
            <tbody>
              {users.sort((a, b) => (b.totalSeconds || 0) - (a.totalSeconds || 0)).map((u, i) => (
                <tr key={i} className="border-t border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3 font-bold text-stone-900">{u.name}</td>
                  <td className="px-4 py-3 text-stone-500">{formatDate(u.firstSeen)}</td>
                  <td className="px-4 py-3 text-stone-500">{formatDate(u.lastSeen)}</td>
                  <td className="px-4 py-3">
                    <span className="bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full text-xs">
                      {formatTime(u.totalSeconds || 0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-stone-400 mt-3 text-center">
        ⚠️ Les données sont stockées localement dans ce navigateur. Un utilisateur sur un autre appareil n'apparaît pas ici.
      </p>
    </div>
  );
}