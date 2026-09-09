'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (data.session) {
          router.push('/dashboard');
          router.refresh();
        } else {
          setSuccessMsg('🐷 Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản nhé!');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto glass-card p-8 shadow-2xl relative overflow-hidden rounded-3xl">
      {/* Dynamic Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Tabs */}
      <div className="flex border-b border-pink-900/40 mb-6">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 pb-3 text-xs font-extrabold transition-all relative cute-bounce ${
            !isSignUp
              ? 'text-pink-300 border-b-2 border-pink-400'
              : 'text-rose-200/50 hover:text-rose-200'
          }`}
        >
          🐷 Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(true);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 pb-3 text-xs font-extrabold transition-all relative cute-bounce ${
            isSignUp
              ? 'text-pink-300 border-b-2 border-pink-400'
              : 'text-rose-200/50 hover:text-rose-200'
          }`}
        >
          🌸 Đăng ký tài khoản
        </button>
      </div>

      {/* Form Alert Messages */}
      {errorMsg && (
        <div className="mb-4 p-3.5 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs flex items-start space-x-2.5 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 bg-pink-500/20 border border-pink-500/40 rounded-2xl text-pink-200 text-xs flex items-start space-x-2.5 font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-pink-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-rose-200/80 mb-1.5">
            Địa chỉ Email của bạn
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400/60" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hocsinh@truong.edu.vn"
              className="w-full pl-10 pr-4 py-2.5 glass-input text-xs font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-rose-200/80 mb-1.5">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400/60" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 glass-input text-xs font-semibold"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 shadow-lg shadow-pink-500/25 transition-all cute-bounce disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <>
              <span>{isSignUp ? '🐷 Đăng ký ngay' : '🐷 Đăng nhập ngay'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
