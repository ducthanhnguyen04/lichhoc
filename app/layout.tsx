import type { Metadata, Viewport } from 'next';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tah - Web App Nhắc Lịch Học Tự Động Bằng AI Vision',
  description: 'Tự động bóc tách thời khóa biểu từ ảnh bằng Gemini AI và gửi thông báo nhắc lịch học mỗi sáng.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/apple-touch-icon.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tah',
  },
};

export const viewport: Viewport = {
  themeColor: '#38bdf8',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-[#081524] text-sky-100 min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-sky-900/40 bg-[#06111e]/80 py-6 text-center text-xs text-sky-300/60">
          <p>© {new Date().getFullYear()} Tah - Hệ Thống Nhắc Lịch Học Tự Động Bằng AI Vision.</p>
        </footer>
      </body>
    </html>
  );
}
