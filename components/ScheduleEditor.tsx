'use client';

import { useState, useEffect } from 'react';
import { ScheduleItem, DAY_NAMES } from '@/types/schedule';
import { Save, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, BookOpen, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CalendarSyncModal from '@/components/CalendarSyncModal';

interface ScheduleEditorProps {
  initialItems: ScheduleItem[];
  imageUrl?: string | null;
  onSaveSuccess?: () => void;
}

export default function ScheduleEditor({ initialItems, imageUrl, onSaveSuccess }: ScheduleEditorProps) {
  const [items, setItems] = useState<ScheduleItem[]>(initialItems);

  // Sync internal state when initialItems prop changes (e.g., after re-scanning an image)
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const router = useRouter();

  const handleItemChange = (index: number, field: keyof ScheduleItem, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'day_of_week' ? Number(value) : value,
    };
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        day_of_week: 2,
        start_time: '07:30',
        end_time: '09:30',
        subject_name: '',
        room: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả môn học khỏi bảng chỉnh sửa không?')) {
      setItems([]);
    }
  };

  const handleSave = async () => {
    if (items.length === 0) {
      setErrorMsg('Vui lòng thêm ít nhất một môn học trước khi lưu.');
      return;
    }

    // Validate empty subject names
    const hasEmptySubject = items.some((item) => !item.subject_name.trim());
    if (hasEmptySubject) {
      setErrorMsg('Vui lòng điền đầy đủ tên môn học cho tất cả các dòng.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedule_data: items,
          image_url: imageUrl || null,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Không thể lưu lịch học');
      }

      setSuccessMsg('🐷 Đã lưu thời khóa biểu thành công! Chú Lợn AI Út Ít sẽ gửi nhắc nhở mỗi sáng!');
      if (onSaveSuccess) onSaveSuccess();

      // Redirect to /my-schedule after brief pause
      setTimeout(() => {
        router.push('/my-schedule');
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu lịch học');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-900/40 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <span className="text-xl">🐷</span>
            <span>Kiểm Tra & Chỉnh Sửa Lịch Học ({items.length} môn)</span>
          </h2>
          <p className="text-xs text-rose-200/70 mt-1 font-medium">
            Vui lòng rà soát lại thông tin Lợn AI Út Ít đã quét. Bạn có thể sửa trực tiếp hoặc thêm/xóa môn học.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold transition-all cute-bounce"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Tất Cả</span>
            </button>
          )}

          <button
            onClick={handleAddItem}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-[#261420] hover:bg-pink-950/70 text-pink-300 border border-pink-500/30 text-xs font-bold transition-all cute-bounce"
          >
            <Plus className="w-4 h-4 text-pink-400" />
            <span>Thêm Môn 🌸</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs flex items-center space-x-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-pink-500/20 border border-pink-500/40 rounded-2xl text-pink-200 text-xs flex items-center space-x-2 font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-pink-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Editable Table / Cards */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="text-center py-8 text-rose-300/60 text-sm font-medium">
            🐷 Chưa có môn học nào. Hãy bấm "+ Thêm Môn 🌸" để tạo mới!
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#1d0e17]/80 border border-pink-900/40 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center hover:border-pink-500/40 transition-all shadow-sm"
            >
              {/* Thứ trong tuần */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-rose-300/70 mb-1 sm:hidden">Thứ</label>
                <div className="relative">
                  <select
                    value={item.day_of_week}
                    onChange={(e) => handleItemChange(idx, 'day_of_week', e.target.value)}
                    className="w-full glass-input px-3 py-2 text-xs font-bold text-pink-300"
                  >
                    {Object.entries(DAY_NAMES).map(([key, name]) => (
                      <option key={key} value={key} className="bg-[#1f0f18] text-pink-200">
                        🌸 {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tên môn học */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-rose-300/70 mb-1 sm:hidden">Tên môn học</label>
                <input
                  type="text"
                  placeholder="Tên môn học..."
                  value={item.subject_name}
                  onChange={(e) => handleItemChange(idx, 'subject_name', e.target.value)}
                  className="w-full glass-input px-3 py-2 text-xs font-semibold"
                />
              </div>

              {/* Giờ học */}
              <div className="sm:col-span-3 flex items-center space-x-1.5">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-rose-300/70 mb-1 sm:hidden">Bắt đầu</label>
                  <input
                    type="text"
                    placeholder="07:30"
                    value={item.start_time}
                    onChange={(e) => handleItemChange(idx, 'start_time', e.target.value)}
                    className="w-full glass-input px-2.5 py-2 text-xs text-center font-mono font-bold"
                  />
                </div>
                <span className="text-pink-400/60 text-xs font-bold">-</span>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-rose-300/70 mb-1 sm:hidden">Kết thúc</label>
                  <input
                    type="text"
                    placeholder="09:30"
                    value={item.end_time}
                    onChange={(e) => handleItemChange(idx, 'end_time', e.target.value)}
                    className="w-full glass-input px-2.5 py-2 text-xs text-center font-mono font-bold"
                  />
                </div>
              </div>

              {/* Phòng học & Action Delete */}
              <div className="sm:col-span-2 flex items-center space-x-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-rose-300/70 mb-1 sm:hidden">Phòng</label>
                  <input
                    type="text"
                    placeholder="Phòng..."
                    value={item.room}
                    onChange={(e) => handleItemChange(idx, 'room', e.target.value)}
                    className="w-full glass-input px-2.5 py-2 text-xs text-center font-semibold"
                  />
                </div>
                <button
                  onClick={() => handleRemoveItem(idx)}
                  className="p-2 rounded-xl text-rose-400/70 hover:text-red-400 hover:bg-pink-950 transition-colors shrink-0"
                  title="Xóa môn này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Save & Sync Buttons */}
      <div className="border-t border-pink-900/40 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsSyncModalOpen(true)}
          disabled={items.length === 0}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-xs font-bold text-pink-300 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cute-bounce"
        >
          <Smartphone className="w-4 h-4 text-pink-400" />
          <span>Tải File .ics / Đồng Bộ Điện Thoại 🐷</span>
        </button>

        <button
          onClick={handleSave}
          disabled={saving || items.length === 0}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 shadow-lg shadow-pink-500/25 transition-all cute-bounce disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>🐷 Lưu Thời Khóa Biểu</span>
            </>
          )}
        </button>
      </div>

      <CalendarSyncModal
        scheduleItems={items}
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
}
