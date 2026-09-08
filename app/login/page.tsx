export const dynamic = 'force-dynamic';

import AuthForm from '@/components/AuthForm';
import { Calendar, Sparkles, Mail, Bell } from 'lucide-react';

export const metadata = {
  title: 'Đăng nhập / Đăng ký - Lịch Học Smart AI',
  description: 'Đăng nhập vào hệ thống nhắc lịch học tự động bằng trí tuệ nhân tạo Gemini AI',
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-8 max-w-lg">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tự Động Nhận Diện Bằng AI Vision</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Chào mừng đến với <span className="text-cyan-400">ThanhDev</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Upload ảnh thời khóa biểu, AI tự động quét lịch & gửi Email nhắc học 07:00 AM mỗi sáng.
        </p>
      </div>

      {/* Auth Card */}
      <AuthForm />

      {/* Feature Highlights */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col items-center text-center">
          <Calendar className="w-6 h-6 text-cyan-400 mb-2" />
          <h3 className="text-xs font-bold text-slate-200">Đọc Ảnh Thông Minh</h3>
          <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ OCR Tiếng Việt, Tiếng Anh & Trung Phồn Thể</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col items-center text-center">
          <Mail className="w-6 h-6 text-blue-400 mb-2" />
          <h3 className="text-xs font-bold text-slate-200">Email Nhắc Học 7 AM</h3>
          <p className="text-[11px] text-slate-400 mt-1">Tự động tổng hợp tên môn, giờ học & phòng học mỗi ngày</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col items-center text-center">
          <Bell className="w-6 h-6 text-emerald-400 mb-2" />
          <h3 className="text-xs font-bold text-slate-200">Bảo Mật An Toàn</h3>
          <p className="text-[11px] text-slate-400 mt-1">Row Level Security đảm bảo chỉ duy nhất bạn xem được lịch</p>
        </div>
      </div>
    </div>
  );
}
