'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Calendar, LogOut, User, Sparkles, BookOpen, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Check initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen to Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              LịchHọc<span className="text-cyan-400 font-extrabold">.AI</span>
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                    pathname === '/dashboard'
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Tải Lịch Học (AI)</span>
                </Link>

                <Link
                  href="/my-schedule"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                    pathname === '/my-schedule'
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Lịch Học Của Tôi</span>
                </Link>
              </>
            ) : null}
          </nav>

          {/* User Account Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
                <div className="flex items-center space-x-2 text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700/60">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="max-w-[160px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 transition-all hover:scale-105"
              >
                Đăng nhập / Đăng ký
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Layers className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <>
              <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-800 mb-2 truncate">
                Đăng nhập: <span className="text-white font-medium">{user.email}</span>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                Tải Lịch Học (AI Vision)
              </Link>
              <Link
                href="/my-schedule"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                Lịch Học Của Tôi
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-slate-800 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block text-center px-4 py-2.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              Đăng nhập / Đăng ký
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
