import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'LịchHọc.Piggy 🐷 - Thời Khóa Biểu Cute & Nhắc Lịch Học Tự Động',
  description: 'Chú Lợn Út Ít AI 🐷 tự động bóc tách thời khóa biểu từ ảnh và nhắc nhở lịch học chu đáo mỗi ngày!',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-[#190d14] text-rose-100 min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-pink-950/60 bg-[#140a10]/80 py-6 text-center text-xs text-pink-300/70">
          <p className="flex items-center justify-center space-x-1.5 font-medium">
            <span>🐷</span>
            <span>Cùng Lợn Út Ít Chăm Học Mỗi Ngày! © {new Date().getFullYear()} LịchHọc.Piggy AI</span>
            <span>🌸</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
