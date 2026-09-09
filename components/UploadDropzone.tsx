'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UploadCloud, Image as ImageIcon, Loader2, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { ScheduleItem } from '@/types/schedule';

interface UploadDropzoneProps {
  onExtracted: (scheduleData: ScheduleItem[], imageUrl: string) => void;
}

export default function UploadDropzone({ onExtracted }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFile = async (file: File) => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setErrorMsg('Vui lòng chỉ tải lên ảnh định dạng JPG hoặc PNG!');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Dung lượng ảnh vượt quá 10MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    setStatusText('Đang tải ảnh lên bộ nhớ an toàn (Supabase Storage)...');

    // Preview image
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Bạn cần đăng nhập để thực hiện tải ảnh.');
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage 'schedule-images' bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('schedule-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Lỗi tải ảnh lên Supabase Storage: ${uploadError.message}`);
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('schedule-images')
        .getPublicUrl(uploadData.path);

      setStatusText('Đang phân tích thời khóa biểu bằng AI Vision (Gemini 1.5 Flash)...');

      // Call API /api/extract-schedule
      const response = await fetch('/api/extract-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: publicUrl,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'AI gặp sự cố khi đọc thời khóa biểu');
      }

      setStatusText('Bóc tách thành công!');
      onExtracted(resData.schedule_data, publicUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Đã xảy ra lỗi không xác định.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!loading) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            fileInputRef.current?.click();
          }
        }}
        className={`glass-card p-8 text-center cursor-pointer transition-all border-2 border-dashed relative overflow-hidden group ${
          isDragging
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-slate-700/80 hover:border-cyan-500/60 hover:bg-slate-800/90'
        } ${loading ? 'pointer-events-none opacity-90' : ''}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/jpg"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-white">{statusText}</p>
              <p className="text-xs text-slate-400">Trí tuệ nhân tạo đang tự động phân tích thứ, giờ học & phòng học...</p>
            </div>
          </div>
        ) : previewUrl ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative max-h-60 overflow-hidden rounded-xl border border-slate-700">
              <img src={previewUrl} alt="Thời khóa biểu preview" className="object-contain max-h-60 w-auto" />
            </div>
            <div className="flex items-center space-x-2 text-xs text-cyan-400 font-semibold bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
              <CheckCircle className="w-4 h-4" />
              <span>Bấm vào đây để chọn hoặc tải lại ảnh khác</span>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-500/50 transition-all shadow-lg">
              <UploadCloud className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <p className="text-base font-bold text-white mb-1">
                Kéo thả ảnh thời khóa biểu vào đây, hoặc <span className="text-cyan-400 underline">bấm để tải lên</span>
              </p>
              <p className="text-xs text-slate-400">
                Chỉ chấp nhận ảnh JPG, PNG (Tối đa 10MB)
              </p>
            </div>
            <div className="inline-flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/60">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hỗ trợ Tiếng Việt, Tiếng Anh & Trung Phồn Thể</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
