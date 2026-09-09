export const dynamic = 'force-dynamic';

import AuthForm from '@/components/AuthForm';
import { Calendar, Sparkles, Mail, Bell } from 'lucide-react';

export const metadata = {
  title: 'Đăng nhập / Đăng ký - LịchHọc.Piggy 🐷',
  description: 'Đăng nhập để chú Lợn AI Út Ít 🐷 giúp bạn tự động bóc tách & gửi thông báo nhắc lịch học mỗi sáng!',
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-10">
      {/* Page Header */}
      <div className="text-center mb-8 max-w-lg">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold mb-4 cute-bounce">
          <span className="text-sm">🐷</span>
          <span>Lợn Út Ít AI Nhắc Học Chăm Chỉ</span>
          <span className="text-sm">🌸</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
          Chào mừng đến với <span className="text-pink-400">LịchHọc.Piggy 🐷</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-rose-200/70 font-medium">
          Tải ảnh thời khóa biểu lên. Chú Lợn Út Ít AI sẽ đọc môn & gửi thông báo nhắc học mỗi sáng!
        </p>
      </div>

      {/* Auth Card */}
      <AuthForm />

      {/* Feature Highlights */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
        <div className="p-4 rounded-2xl bg-[#23121d]/80 border border-pink-900/40 flex flex-col items-center text-center cute-bounce">
          <span className="text-2xl mb-1">🐷</span>
          <h3 className="text-xs font-extrabold text-rose-100">AI Soi Ảnh Thông Minh</h3>
          <p className="text-[11px] text-rose-200/60 mt-1 font-medium">Hỗ trợ Tiếng Việt, Tiếng Anh & Trung Phồn Thể</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#23121d]/80 border border-pink-900/40 flex flex-col items-center text-center cute-bounce">
          <span className="text-2xl mb-1">🌸</span>
          <h3 className="text-xs font-extrabold text-rose-100">Bắn Web Push Mỗi Sáng</h3>
          <p className="text-[11px] text-rose-200/60 mt-1 font-medium">Tự động báo Tên môn, Giờ học & Phòng học</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#23121d]/80 border border-pink-900/40 flex flex-col items-center text-center cute-bounce">
          <span className="text-2xl mb-1">🎀</span>
          <h3 className="text-xs font-extrabold text-rose-100">Bảo Mật Riêng Tư</h3>
          <p className="text-[11px] text-rose-200/60 mt-1 font-medium">Lịch học của bạn được mã hóa an toàn 100%</p>
        </div>
      </div>
    </div>
  );
}
