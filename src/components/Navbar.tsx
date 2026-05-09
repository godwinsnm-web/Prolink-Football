import { useLocation, Link } from 'wouter';
import { useAuth } from '../AuthContext';
import { LogOut, LayoutDashboard, CalendarDays, Users, Trophy } from 'lucide-react';

export default function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center gap-2 group cursor-pointer text-emerald-400 font-bold text-xl uppercase tracking-tighter">
                <Trophy className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span>ProLink <span className="text-white">Football</span></span>
              </a>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link href="/">
                <a className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-emerald-400 ${location === '/' ? 'text-emerald-400' : 'text-slate-300'}`}>
                  <CalendarDays className="w-4 h-4" /> Events
                </a>
              </Link>
              <Link href="/players">
                <a className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-emerald-400 ${location === '/players' ? 'text-emerald-400' : 'text-slate-300'}`}>
                  <Users className="w-4 h-4" /> Top 20 Players
                </a>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link href="/admin">
                  <a className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-emerald-400 ${location === '/admin' ? 'text-emerald-400' : 'text-slate-300'}`}>
                    <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                  </a>
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400 hidden sm:inline-block">
                  Welcome, <span className="text-white font-medium">{user.username}</span>
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link href="/login">
                <a className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </a>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
