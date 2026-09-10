'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { UploadCloud, ArrowRight, BookOpen, LogIn } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export default function HeroButtons() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 min-h-[56px]">
        <div className="w-48 h-12 rounded-xl bg-sky-950/40 animate-pulse border border-sky-900/40" />
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
      <Link
        href="/dashboard"
        className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-xl shadow-sky-500/25 transition-all sky-bounce flex items-center justify-center space-x-2"
      >
        <UploadCloud className="w-5 h-5" />
        <span>Tải Ảnh Thời Khóa Biểu</span>
        <ArrowRight className="w-5 h-5 ml-1" />
      </Link>

      {user ? (
        <Link
          href="/my-schedule"
          className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold text-sky-200 bg-[#0f2136]/80 hover:bg-sky-950/60 border border-sky-500/20 transition-all flex items-center justify-center space-x-2 sky-bounce"
        >
          <BookOpen className="w-4.5 h-4.5 text-sky-400" />
          <span>Lịch Học Của Tôi</span>
        </Link>
      ) : (
        <Link
          href="/login"
          className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold text-sky-200 bg-[#0f2136]/80 hover:bg-sky-950/60 border border-sky-500/20 transition-all flex items-center justify-center space-x-2 sky-bounce"
        >
          <LogIn className="w-4.5 h-4.5 text-sky-400" />
          <span>Đăng Nhập / Đăng Ký</span>
        </Link>
      )}
    </div>
  );
}
