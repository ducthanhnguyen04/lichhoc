'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { ScheduleRow, ScheduleItem, DAY_NAMES } from '@/types/schedule';
import ScheduleEditor from '@/components/ScheduleEditor';
import CalendarSyncModal from '@/components/CalendarSyncModal';
import { Calendar, Clock, MapPin, Edit3, Plus, Sparkles, AlertCircle, Loader2, BookOpen, Smartphone, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function MySchedulePage() {
  const [scheduleRow, setScheduleRow] = useState<ScheduleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Get current day of week (JS: 0=Sun, 1=Mon, ..., 6=Sat)
  // Our system: 2=Mon, 3=Tue, ..., 7=Sat, 8=Sun
  const todayJs = new Date().getDay();
  const currentDayOfWeek = todayJs === 0 ? 8 : todayJs + 1;

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schedule');
      const data = await res.json();
      if (res.ok && data.success) {
        setScheduleRow(data.schedule);
      } else {
        setErrorMsg(data.error || 'Không thể tải lịch học');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi mạng khi tải lịch học');
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteAll = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ thời khóa biểu đã lưu không? Hành động này không thể hoàn tác.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch('/api/schedule', { method: 'DELETE' });
      const data = await res.json();

      if (res.ok && data.success) {
        setScheduleRow(null);
        setIsEditing(false);
      } else {
        alert(data.error || 'Không thể xóa lịch học');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi mạng khi xóa lịch học');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // Group items by day_of_week
  const groupedSchedule: Record<number, ScheduleItem[]> = { 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] };
  if (scheduleRow?.schedule_data) {
    scheduleRow.schedule_data.forEach((item) => {
      if (groupedSchedule[item.day_of_week]) {
        groupedSchedule[item.day_of_week].push(item);
      }
    });

    // Sort items by start_time
    Object.keys(groupedSchedule).forEach((day) => {
      groupedSchedule[Number(day)].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-cyan-400 text-xs font-semibold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lịch Học Đã Lưu</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Lịch Học Của Tôi
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Thời khóa biểu tự động nhắc nhở email 07:00 AM mỗi sáng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {scheduleRow && scheduleRow.schedule_data && scheduleRow.schedule_data.length > 0 && (
            <>

              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <Smartphone className="w-4 h-4" />
                <span>Đồng Bộ Lịch Điện Thoại</span>
              </button>
            </>
          )}

          {scheduleRow && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-sm font-semibold border border-slate-700 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? 'Thoát Chỉnh Sửa' : 'Chỉnh Sửa Lịch'}</span>
              </button>

              <button
                onClick={handleDeleteAll}
                disabled={deleting}
                className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold border border-red-500/30 transition-all disabled:opacity-50"
                title="Xóa toàn bộ lịch học"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Đang xóa...' : 'Xóa Lịch'}</span>
              </button>
            </>
          )}

          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tải Ảnh Mới</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <p className="text-slate-400 text-sm">Đang tải lịch học của bạn...</p>
        </div>
      ) : errorMsg ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : !scheduleRow || !scheduleRow.schedule_data || scheduleRow.schedule_data.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Bạn chưa có lịch học nào</h3>
          <p className="text-sm text-slate-400">
            Hãy tải ảnh thời khóa biểu lên để AI tự động nhận diện và gửi email nhắc nhở mỗi ngày!
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tải Ảnh Ngay Bằng AI</span>
          </Link>
        </div>
      ) : isEditing ? (
        <ScheduleEditor
          initialItems={scheduleRow.schedule_data}
          imageUrl={scheduleRow.image_url}
          onSaveSuccess={() => {
            setIsEditing(false);
            fetchSchedule();
          }}
        />
      ) : (
        <div className="space-y-8">
          {/* Main Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[2, 3, 4, 5, 6, 7, 8].map((dayNum) => {
              const dayItems = groupedSchedule[dayNum] || [];
              const isToday = currentDayOfWeek === dayNum;

              return (
                <div
                  key={dayNum}
                  className={`glass-card p-5 space-y-4 transition-all relative ${
                    isToday
                      ? 'border-cyan-500 ring-1 ring-cyan-500/50 bg-slate-800/90'
                      : 'hover:border-slate-600'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                    <h3 className={`text-base font-bold flex items-center space-x-2 ${isToday ? 'text-cyan-400' : 'text-white'}`}>
                      <Calendar className="w-4 h-4" />
                      <span>{DAY_NAMES[dayNum]}</span>
                    </h3>
                    {isToday && (
                      <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        Hôm nay
                      </span>
                    )}
                  </div>

                  {/* Class List */}
                  <div className="space-y-3">
                    {dayItems.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">Không có lịch học</p>
                    ) : (
                      dayItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2 hover:border-cyan-500/40 transition-all"
                        >
                          <div className="font-semibold text-sm text-slate-100 line-clamp-2">
                            {item.subject_name}
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
                            <div className="flex items-center space-x-1 text-cyan-400 font-mono">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{item.start_time} - {item.end_time}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-slate-300 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-blue-400" />
                              <span>{item.room || 'TBA'}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar Sync Modal */}
      {scheduleRow?.schedule_data && (
        <CalendarSyncModal
          scheduleItems={scheduleRow.schedule_data}
          userId={scheduleRow.user_id}
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
        />
      )}
    </div>
  );
}
