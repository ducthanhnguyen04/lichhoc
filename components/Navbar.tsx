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
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#081524]/85 border-b border-sky-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group sky-bounce">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">
              LịchHọc<span className="text-sky-400 font-extrabold">.AI</span>
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 sky-bounce ${
                    pathname === '/dashboard'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm shadow-sky-500/10'
                      : 'text-sky-200/80 hover:text-white hover:bg-sky-950/40'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Tải Lịch Học (AI)</span>
                </Link>

                <Link
                  href="/my-schedule"
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 sky-bounce ${
                    pathname === '/my-schedule'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm shadow-sky-500/10'
                      : 'text-sky-200/80 hover:text-white hover:bg-sky-950/40'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span>Lịch Học Của Tôi</span>
                </Link>
              </>
            ) : null}
          </nav>

          {/* User Account Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-sky-900/40">
                <div className="flex items-center space-x-2 text-sky-200 bg-[#0f2136] px-3.5 py-1.5 rounded-xl text-xs font-medium border border-sky-500/20">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span className="max-w-[160px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl text-sky-300/70 hover:text-sky-400 hover:bg-sky-950/60 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/20 transition-all sky-bounce"
              >
                Đăng nhập / Đăng ký
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-sky-300 hover:text-white hover:bg-sky-950"
            >
              <Layers className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0a1828] border-b border-sky-900/40 px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <>
              <div className="px-3 py-2 text-xs text-sky-300 border-b border-sky-900/40 mb-2 truncate">
                Đăng nhập: <span className="text-white font-medium">{user.email}</span>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-sky-200 hover:bg-sky-950/60"
              >
                Tải Lịch Học (AI Vision)
              </Link>
              <Link
                href="/my-schedule"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-sky-200 hover:bg-sky-950/60"
              >
                Lịch Học Của Tôi
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-sky-400 hover:bg-sky-950/60 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block text-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600"
            >
              Đăng nhập / Đăng ký
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
