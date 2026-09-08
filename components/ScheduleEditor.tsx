'use client';

import { useState } from 'react';
import { ScheduleItem, DAY_NAMES } from '@/types/schedule';
import { Save, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, Clock, BookOpen, MapPin, Calendar, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CalendarSyncModal from '@/components/CalendarSyncModal';

interface ScheduleEditorProps {
  initialItems: ScheduleItem[];
  imageUrl?: string | null;
  onSaveSuccess?: () => void;
}

export default function ScheduleEditor({ initialItems, imageUrl, onSaveSuccess }: ScheduleEditorProps) {
  const [items, setItems] = useState<ScheduleItem[]>(initialItems);
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

      setSuccessMsg('Đã lưu lịch học thành công! Hệ thống sẽ gửi email nhắc nhở mỗi ngày.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Kiểm Tra & Chỉnh Sửa Lịch Học ({items.length} môn)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Vui lòng rà soát lại thông tin AI đã quét. Bạn có thể sửa trực tiếp hoặc thêm/xóa môn học.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Tất Cả</span>
            </button>
          )}

          <button
            onClick={handleAddItem}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Môn Học</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Editable Table / Cards */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Chưa có môn học nào. Hãy bấm "+ Thêm Môn Học" để tạo mới!
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center hover:border-cyan-500/40 transition-all"
            >
              {/* Thứ trong tuần */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-slate-400 mb-1 sm:hidden">Thứ</label>
                <div className="relative">
                  <select
                    value={item.day_of_week}
                    onChange={(e) => handleItemChange(idx, 'day_of_week', e.target.value)}
                    className="w-full glass-input px-3 py-2 text-xs font-semibold text-cyan-300"
                  >
                    {Object.entries(DAY_NAMES).map(([key, name]) => (
                      <option key={key} value={key} className="bg-slate-900 text-white">
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tên môn học */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-medium text-slate-400 mb-1 sm:hidden">Tên môn học</label>
                <input
                  type="text"
                  placeholder="Tên môn học..."
                  value={item.subject_name}
                  onChange={(e) => handleItemChange(idx, 'subject_name', e.target.value)}
                  className="w-full glass-input px-3 py-2 text-xs font-medium"
                />
              </div>

              {/* Giờ học */}
              <div className="sm:col-span-3 flex items-center space-x-1.5">
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1 sm:hidden">Bắt đầu</label>
                  <input
                    type="text"
                    placeholder="07:30"
                    value={item.start_time}
                    onChange={(e) => handleItemChange(idx, 'start_time', e.target.value)}
                    className="w-full glass-input px-2.5 py-2 text-xs text-center font-mono"
                  />
                </div>
                <span className="text-slate-500 text-xs">-</span>
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1 sm:hidden">Kết thúc</label>
                  <input
                    type="text"
                    placeholder="09:30"
                    value={item.end_time}
                    onChange={(e) => handleItemChange(idx, 'end_time', e.target.value)}
                    className="w-full glass-input px-2.5 py-2 text-xs text-center font-mono"
                  />
                </div>
              </div>

              {/* Phòng học & Action Delete */}
              <div className="sm:col-span-2 flex items-center space-x-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1 sm:hidden">Phòng</label>
                  <input
                    type="text"
                    placeholder="Phòng..."
                    value={item.room}
                    onChange={(e) => handleItemChange(idx, 'room', e.target.value)}
                    className="w-full glass-input px-2.5 py-2 text-xs text-center"
                  />
                </div>
                <button
                  onClick={() => handleRemoveItem(idx)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
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
      <div className="border-t border-slate-700/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsSyncModalOpen(true)}
          disabled={items.length === 0}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Tải File .ics / Đồng Bộ Điện Thoại</span>
        </button>

        <button
          onClick={handleSave}
          disabled={saving || items.length === 0}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Xác Nhận & Lưu Lịch Học</span>
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
