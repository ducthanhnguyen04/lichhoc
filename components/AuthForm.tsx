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
          setSuccessMsg('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản (hoặc đăng nhập ngay nếu không yêu cầu email verification).');
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
    <div className="w-full max-w-md mx-auto glass-card p-8 shadow-2xl relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Tabs */}
      <div className="flex border-b border-slate-700/80 mb-6">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 pb-3 text-sm font-semibold transition-all relative ${
            !isSignUp
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(true);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 pb-3 text-sm font-semibold transition-all relative ${
            isSignUp
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Đăng ký tài khoản
        </button>
      </div>

      {/* Form Alert Messages */}
      {errorMsg && (
        <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Địa chỉ Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@student.edu.vn"
              className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <>
              <span>{isSignUp ? 'Đăng ký ngay' : 'Đăng nhập vào ứng dụng'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
