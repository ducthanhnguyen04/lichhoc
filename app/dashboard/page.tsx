'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import UploadDropzone from '@/components/UploadDropzone';
import ScheduleEditor from '@/components/ScheduleEditor';
import { ScheduleItem } from '@/types/schedule';
import { Sparkles, Calendar, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [extractedData, setExtractedData] = useState<ScheduleItem[] | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleExtracted = (data: ScheduleItem[], imageUrl: string) => {
    setExtractedData(data);
    setUploadedImageUrl(imageUrl);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-900/40 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-pink-300 text-xs font-extrabold bg-pink-500/15 px-3.5 py-1.5 rounded-full border border-pink-500/30 mb-2.5">
            <span className="text-sm">🐷</span>
            <span>Lợn Út Ít AI Vision</span>
            <span className="text-sm">🌸</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-2">
            <span>Tải Ảnh Thời Khóa Biểu</span>
            <span className="text-pink-400">🐷</span>
          </h1>
          <p className="text-xs sm:text-sm text-rose-200/70 mt-1 font-medium">
            Chú Lợn Út Ít AI sẽ tự động bóc tách các môn học, phòng học và thời gian từ ảnh của bạn!
          </p>
        </div>

        <Link
          href="/my-schedule"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-[#261420] hover:bg-pink-950/70 text-rose-200 text-xs font-bold border border-pink-500/30 transition-all cute-bounce"
        >
          <BookOpen className="w-4 h-4 text-pink-400" />
          <span>Xem Lịch Đã Lưu 🐷</span>
        </Link>
      </div>

      {/* Upload Component */}
      <div className="space-y-6">
        <UploadDropzone onExtracted={handleExtracted} />
      </div>

      {/* Editable Table Component (Renders automatically after AI extraction) */}
      {extractedData && (
        <div className="space-y-4 pt-4 border-t border-pink-900/40 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ScheduleEditor
            key={uploadedImageUrl || JSON.stringify(extractedData)}
            initialItems={extractedData}
            imageUrl={uploadedImageUrl}
          />
        </div>
      )}
    </div>
  );
}
