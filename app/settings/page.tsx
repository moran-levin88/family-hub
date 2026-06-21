"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMembers } from "@/hooks/useMembers";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, CalendarCheck, CalendarX, X, LogOut } from "lucide-react";

function SettingsContent() {
  const { members, loaded, addMember, deleteMember } = useMembers();
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const [newName, setNewName] = useState("");
  const [banner, setBanner] = useState<"connected" | "error" | null>(null);

  useEffect(() => {
    if (searchParams.get("connected") === "1") setBanner("connected");
    if (searchParams.get("error") === "1") setBanner("error");
  }, [searchParams]);

  const handleAddMember = async () => {
    const name = newName.trim();
    if (!name) return;
    await addMember(name);
    setNewName("");
  };

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">הגדרות</h1>
      <p className="text-slate-500 text-sm mb-6">חברי המשפחה וחיבור Google Calendar</p>

      {user && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            {user.photoURL && (
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 truncate text-sm">{user.displayName}</p>
              <p className="text-slate-400 text-xs truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-red-500 font-semibold py-2 px-3 rounded-xl hover:bg-red-50 shrink-0"
          >
            <LogOut size={14} />
            התנתקות
          </button>
        </div>
      )}

      {banner && (
        <div
          className={`mb-5 rounded-2xl p-4 flex items-center justify-between text-sm font-medium ${
            banner === "connected"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <span>
            {banner === "connected"
              ? "✅ Google Calendar חובר בהצלחה!"
              : "❌ אירעה שגיאה בחיבור. נסו שוב."}
          </span>
          <button onClick={() => setBanner(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <section className="mb-8">
        <h2 className="font-bold text-slate-700 text-base mb-3">חברי המשפחה</h2>

        {!loaded ? (
          <div className="text-slate-400 text-sm text-center py-6">טוען...</div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
                    {member.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{member.name}</p>
                    <p
                      className={`text-xs mt-0.5 flex items-center gap-1 ${
                        member.googleTokens?.access_token
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      {member.googleTokens?.access_token ? (
                        <>
                          <CalendarCheck size={12} />
                          Google Calendar מחובר
                        </>
                      ) : (
                        <>
                          <CalendarX size={12} />
                          לא מחובר
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/api/auth/google?memberId=${member.id}`}
                    className={`text-xs rounded-xl px-3 py-2 font-semibold whitespace-nowrap ${
                      member.googleTokens?.access_token
                        ? "bg-slate-100 text-slate-600"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {member.googleTokens?.access_token ? "חבר מחדש" : "חבר Calendar"}
                  </a>
                  <button
                    onClick={() => deleteMember(member.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {members.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">
                עדיין אין חברי משפחה. הוסיפו את הראשון!
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
            placeholder="שם חבר/ת משפחה"
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleAddMember}
            disabled={!newName.trim()}
            className="bg-blue-600 text-white rounded-xl px-4 py-3 font-semibold flex items-center gap-1.5 text-sm disabled:opacity-40 active:scale-95 transition-transform"
          >
            <Plus size={18} />
            הוסף
          </button>
        </div>
      </section>

      <section className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">איך זה עובד?</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-700">
          <li>הוסיפו את שמות חברי המשפחה</li>
          <li>כל אחד לוחץ על "חבר Calendar" ומתחבר עם חשבון Google שלו</li>
          <li>מעכשיו כל אירוע חדש יתווסף אוטומטית לכל הקלנדרים המחוברים</li>
        </ol>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
