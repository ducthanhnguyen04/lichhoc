export const dynamic = 'force-dynamic';

import AuthForm from '@/components/AuthForm';
import { Calendar, Sparkles, Mail, Bell } from 'lucide-react';

export const metadata = {
  title: 'Đăng nhập / Đăng ký - LịchHọc.AI',
  description: 'Đăng nhập vào hệ thống nhắc lịch học tự động bằng trí tuệ nhân tạo Gemini AI',
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-10">
      {/* Page Header */}
      <div className="text-center mb-8 max-w-lg">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-4 sky-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tự Động Nhận Diện Bằng AI Vision</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Chào mừng đến với <span className="text-sky-400">LịchHọc.AI</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-sky-200/70 font-normal">
          Upload ảnh thời khóa biểu, AI tự động quét lịch & gửi thông báo nhắc học mỗi sáng.
        </p>
      </div>

      {/* Auth Card */}
      <AuthForm />

      {/* Feature Highlights */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
        <div className="p-4 rounded-xl bg-[#0e2034]/80 border border-sky-900/40 flex flex-col items-center text-center sky-bounce">
          <Calendar className="w-6 h-6 text-sky-400 mb-2" />
          <h3 className="text-xs font-bold text-sky-100">Đọc Ảnh Thông Minh</h3>
          <p className="text-[11px] text-sky-200/60 mt-1 font-normal">Hỗ trợ OCR Tiếng Việt, Tiếng Anh & Trung Phồn Thể</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0e2034]/80 border border-sky-900/40 flex flex-col items-center text-center sky-bounce">
          <Mail className="w-6 h-6 text-sky-400 mb-2" />
          <h3 className="text-xs font-bold text-sky-100">Thông Báo Nhắc Học</h3>
          <p className="text-[11px] text-sky-200/60 mt-1 font-normal">Tự động tổng hợp tên môn, giờ học & phòng học mỗi ngày</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0e2034]/80 border border-sky-900/40 flex flex-col items-center text-center sky-bounce">
          <Bell className="w-6 h-6 text-sky-400 mb-2" />
          <h3 className="text-xs font-bold text-sky-100">Bảo Mật An Toàn</h3>
          <p className="text-[11px] text-sky-200/60 mt-1 font-normal">Row Level Security đảm bảo chỉ duy nhất bạn xem được lịch</p>
        </div>
      </div>
    </div>
  );
}
