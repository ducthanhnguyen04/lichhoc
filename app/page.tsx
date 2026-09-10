import Link from 'next/link';
import HeroButtons from '@/components/HeroButtons';
import { Sparkles, UploadCloud, Bell, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl space-y-6 pt-6">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold animate-pulse sky-bounce">
          <Sparkles className="w-4 h-4" />
          <span>Tích hợp Google Gemini AI Vision Model</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
          Quên Lịch Học? <br />
          <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
            Để AI Nhắc Bạn Mỗi Sáng
          </span>
        </h1>

        <p className="text-base sm:text-lg text-sky-200/80 max-w-2xl mx-auto leading-relaxed font-normal">
          Tải ảnh thời khóa biểu lên. Trí tuệ nhân tạo Gemini sẽ tự động nhận diện tên môn, phòng học, giờ học và gửi thông báo Web Push trực tiếp vào thiết bị của bạn mỗi sáng.
        </p>

        <HeroButtons />
      </section>

      {/* 3 Step Workflow */}
      <section className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold text-center text-white mb-10">
          Quy Trình 3 Bước Đơn Giản
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 relative overflow-hidden group hover:border-sky-400/50 transition-all sky-bounce">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-sky-400" />
              <span>Tải Ảnh Lịch Học</span>
            </h3>
            <p className="text-xs text-sky-200/70 leading-relaxed font-normal">
              Kéo thả hoặc tải ảnh thời khóa biểu (JPG, PNG) của bạn lên hệ thống.
            </p>
          </div>

          <div className="glass-card p-6 relative overflow-hidden group hover:border-sky-400/50 transition-all sky-bounce">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-sky-400" />
              <span>AI Quét & Bóc Tách</span>
            </h3>
            <p className="text-xs text-sky-200/70 leading-relaxed font-normal">
              Gemini Vision trích xuất dữ liệu. Bạn có thể kiểm tra và chỉnh sửa lại trước khi lưu.
            </p>
          </div>

          <div className="glass-card p-6 relative overflow-hidden group hover:border-sky-400/50 transition-all sky-bounce">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-sky-400" />
              <span>Nhận Thông Báo Mỗi Sáng</span>
            </h3>
            <p className="text-xs text-sky-200/70 leading-relaxed font-normal">
              Tự động gửi thông báo Web Push trực tiếp vào thiết bị của bạn trước khi bắt đầu tiết học.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
