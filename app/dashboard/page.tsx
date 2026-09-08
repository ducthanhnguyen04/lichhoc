'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import UploadDropzone from '@/components/UploadDropzone';
import ScheduleEditor from '@/components/ScheduleEditor';
import { ScheduleItem } from '@/types/schedule';
import { Sparkles, Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-semibold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Vision Processing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Tải Ảnh Thời Khóa Biểu
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Hệ thống sẽ tự động bóc tách các môn học, thời gian và phòng học từ hình ảnh của bạn.
          </p>
        </div>

        <Link
          href="/my-schedule"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-all"
        >
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Xem Lịch Đã Lưu</span>
        </Link>
      </div>

      {/* Upload Component */}
      <div className="space-y-6">
        <UploadDropzone onExtracted={handleExtracted} />
      </div>

      {/* Editable Table Component (Renders automatically after AI extraction) */}
      {extractedData && (
        <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ScheduleEditor
            initialItems={extractedData}
            imageUrl={uploadedImageUrl}
          />
        </div>
      )}
    </div>
  );
}
