'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, User, Sparkles, BookOpen, Layers, Heart } from 'lucide-react';
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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#190d14]/85 border-b border-pink-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group cute-bounce">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:rotate-6 transition-all text-xl">
              🐷
            </div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              LịchHọc<span className="bg-gradient-to-r from-pink-400 to-rose-300 bg-clip-text text-transparent font-extrabold">.Piggy</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-semibold">
                🌸 Út Ít
              </span>
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 cute-bounce ${
                    pathname === '/dashboard'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm shadow-pink-500/20'
                      : 'text-rose-200/80 hover:text-white hover:bg-pink-950/40'
                  }`}
                >
                  <span className="text-sm">🐷</span>
                  <span>Tải Lịch AI (Út Ít)</span>
                </Link>

                <Link
                  href="/my-schedule"
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 cute-bounce ${
                    pathname === '/my-schedule'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm shadow-pink-500/20'
                      : 'text-rose-200/80 hover:text-white hover:bg-pink-950/40'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-pink-400" />
                  <span>Lịch Học Của Tôi</span>
                </Link>
              </>
            ) : null}
          </nav>

          {/* User Account Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-pink-950">
                <div className="flex items-center space-x-2 text-rose-200 bg-[#25131e] px-3.5 py-1.5 rounded-2xl text-xs font-semibold border border-pink-500/30">
                  <span className="text-sm">🐷</span>
                  <span className="max-w-[160px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl text-rose-300/70 hover:text-pink-400 hover:bg-pink-950/60 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 shadow-md shadow-pink-500/25 transition-all cute-bounce"
              >
                🐷 Đăng nhập / Đăng ký
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-pink-300 hover:text-white hover:bg-pink-950"
            >
              <Layers className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#1f0f18] border-b border-pink-900/40 px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <>
              <div className="px-3 py-2 text-xs text-pink-300 border-b border-pink-900/40 mb-2 truncate flex items-center gap-1.5">
                <span>🐷</span> <span className="text-white font-medium">{user.email}</span>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-rose-200 hover:bg-pink-950/60"
              >
                🐷 Tải Lịch Học (Út Ít AI)
              </Link>
              <Link
                href="/my-schedule"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-rose-200 hover:bg-pink-950/60"
              >
                📚 Lịch Học Của Tôi
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-pink-400 hover:bg-pink-950/60 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block text-center px-4 py-2.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500"
            >
              🐷 Đăng nhập / Đăng ký
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
