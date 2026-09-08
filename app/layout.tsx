import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'LịchHọc.Ai - Web App Nhắc Lịch Học Tự Động Bằng AI Vision',
  description: 'Tự động quét thời khóa biểu từ ảnh bằng Gemini AI và gửi thông báo nhắc lịch học mỗi sáng 7:00 AM.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-slate-900 text-slate-100 min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-800 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ThanhDev - Hệ Thống Nhắc Lịch Học Tự Động Bằng Trí Tuệ Nhân Tạo.</p>
        </footer>
      </body>
    </html>
  );
}
