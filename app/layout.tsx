import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'LịchHọc.AI - Web App Nhắc Lịch Học Tự Động Bằng AI Vision',
  description: 'Tự động bóc tách thời khóa biểu từ ảnh bằng Gemini AI và gửi thông báo nhắc lịch học mỗi sáng.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-[#081524] text-sky-100 min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-sky-900/40 bg-[#06111e]/80 py-6 text-center text-xs text-sky-300/60">
          <p>© {new Date().getFullYear()} LịchHọc.AI - Hệ Thống Nhắc Lịch Học Tự Động Bằng AI Vision.</p>
        </footer>
      </body>
    </html>
  );
}
