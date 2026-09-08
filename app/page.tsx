import Link from 'next/link';
import { Calendar, Sparkles, CheckCircle2, ArrowRight, UploadCloud, Mail, Clock, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl space-y-6 pt-8">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Tích hợp Google Gemini AI Vision Model</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
          Quên Lịch Học? <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Để AI Nhắc Bạn Mỗi Sáng
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Tải ảnh thời khóa biểu lên. Trí tuệ nhân tạo Gemini sẽ tự động nhận diện tên môn, phòng học, giờ học và gửi email nhắc nhở vào <strong>7:00 AM</strong> mỗi ngày.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 flex items-center justify-center space-x-2"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Tải Ảnh Thời Khóa Biểu</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all flex items-center justify-center"
          >
            Đăng Nhập Ngay
          </Link>
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold text-center text-white mb-10">
          Quy Trình 3 Bước Đơn Giản
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
              <span>Tải Ảnh Lịch Học</span>
            </h3>
            <p className="text-sm text-slate-400">
              Kéo thả hoặc tải ảnh thời khóa biểu (JPG, PNG) của bạn lên hệ thống.
            </p>
          </div>

          <div className="glass-card p-6 relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span>AI Quét & Sửa Đổi</span>
            </h3>
            <p className="text-sm text-slate-400">
              Gemini Vision trích xuất dữ liệu. Bạn có thể kiểm tra và chỉnh sửa lại trước khi lưu.
            </p>
          </div>

          <div className="glass-card p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <Mail className="w-5 h-5 text-emerald-400" />
              <span>Thảnh Thơi Nhận Mail</span>
            </h3>
            <p className="text-sm text-slate-400">
              Hệ thống tự động kiểm tra mỗi 07:00 AM và gửi email nhắc lớp học trong ngày cho bạn.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
