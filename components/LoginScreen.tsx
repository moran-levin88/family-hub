"use client";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const { signIn, notAllowed } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-200 mb-5">
        🏠
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">משפחת לוין</h1>
      <p className="text-slate-500 text-sm mb-8">התחברו כדי לגשת ללוח המשפחתי</p>

      {notAllowed && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 max-w-xs">
          החשבון הזה לא מורשה לגשת ללוח המשפחתי
        </div>
      )}

      <button
        onClick={signIn}
        className="bg-white border border-slate-200 shadow-sm rounded-xl px-6 py-3.5 flex items-center gap-3 font-semibold text-slate-700 active:scale-95 transition-transform"
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C40.205 36.444 44 30.833 44 24c0-1.341-.138-2.65-.389-3.917z"/>
        </svg>
        התחברות עם Google
      </button>
    </div>
  );
}
