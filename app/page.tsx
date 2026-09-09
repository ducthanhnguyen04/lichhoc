import Link from 'next/link';
import { Sparkles, ArrowRight, UploadCloud, Bell, Clock, Zap, Heart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl space-y-6 pt-6">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold animate-pulse cute-bounce">
          <span className="text-base">🐷</span>
          <span>Chú Lợn AI Út Ít - Siêu Bóc Tách Thời Khóa Biểu</span>
          <span className="text-base">🌸</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
          Không Mơ Hồ Giờ Học! <br />
          <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
            Đã Có Lợn AI 🐷 Nhắc Lịch Học Mỗi Sáng
          </span>
        </h1>

        <p className="text-base sm:text-lg text-rose-100/80 max-w-2xl mx-auto leading-relaxed font-medium">
          Chỉ cần chụp ảnh thời khóa biểu. Chú Lợn AI Út Ít 🐷 sẽ tự đọc tên môn, phòng học, ca học và bắn thông báo Web Push trực tiếp tới điện thoại/máy tính mỗi sáng đúng giờ!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-3xl text-sm font-extrabold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 shadow-xl shadow-pink-500/30 transition-all cute-bounce flex items-center justify-center space-x-2"
          >
            <span className="text-lg">🐷</span>
            <span>Tải Ảnh Lịch Học Ngay</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-3xl text-sm font-bold text-rose-200 bg-[#261420]/80 hover:bg-pink-950/60 border border-pink-500/30 transition-all flex items-center justify-center cute-bounce"
          >
            🌸 Đăng Nhập / Đăng Ký
          </Link>
        </div>
      </section>

      {/* 3 Step Cute Workflow */}
      <section className="w-full max-w-5xl">
        <h2 className="text-2xl font-black text-center text-white mb-10 flex items-center justify-center space-x-2">
          <span>🐷</span>
          <span>Quy Trình 3 Bước Siêu Đơn Giản</span>
          <span>🌸</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 relative overflow-hidden group hover:border-pink-400/60 transition-all cute-bounce">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-300 flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">
              1 🐷
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-pink-400" />
              <span>Tải Ảnh Thời Khóa Biểu</span>
            </h3>
            <p className="text-xs text-rose-200/70 leading-relaxed font-medium">
              Chụp hoặc tải ảnh thời khóa biểu trường học (ảnh rõ nét) để Lợn AI Út Ít đọc giúp bạn.
            </p>
          </div>

          <div className="glass-card p-6 relative overflow-hidden group hover:border-pink-400/60 transition-all cute-bounce">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-300 flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">
              2 🌸
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-rose-400" />
              <span>Lợn AI Trích Xuất Môn</span>
            </h3>
            <p className="text-xs text-rose-200/70 leading-relaxed font-medium">
              Trí tuệ nhân tạo nhận diện Thứ, Tên môn, Phòng học & Giờ bắt đầu/kết thúc tự động.
            </p>
          </div>

          <div className="glass-card p-6 relative overflow-hidden group hover:border-pink-400/60 transition-all cute-bounce">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-300 flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">
              3 🔔
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>Gửi Nhắc Nhở Mỗi Sáng</span>
            </h3>
            <p className="text-xs text-rose-200/70 leading-relaxed font-medium">
              Tự động gửi thông báo Web Push trực tiếp vào máy tính/điện thoại trước khi đi học.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
