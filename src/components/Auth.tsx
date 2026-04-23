import React from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

export const AuthStatus: React.FC = () => {
  const [user, setUser] = React.useState(auth.currentUser);

  React.useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  const login = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  if (!user) {
    return (
      <button
        onClick={login}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-600/20 cursor-pointer"
        id="login-button"
      >
        <LogIn size={18} />
        <span>Login</span>
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100" id="auth-status">
      <div className="flex items-center gap-3 overflow-hidden">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || ''} className="w-9 h-9 rounded-full border-2 border-white shadow-sm shrink-0" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
            <UserIcon size={16} className="text-slate-500" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate leading-tight">{user.displayName}</p>
          <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-tight">Active Session</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="text-slate-400 hover:text-red-500 p-2 transition-colors cursor-pointer shrink-0"
        title="Logout"
        id="logout-button"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
};
