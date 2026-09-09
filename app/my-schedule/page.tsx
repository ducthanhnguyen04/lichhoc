'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { ScheduleRow, ScheduleItem, DAY_NAMES } from '@/types/schedule';
import ScheduleEditor from '@/components/ScheduleEditor';
import CalendarSyncModal from '@/components/CalendarSyncModal';
import PushNotificationToggle from '@/components/PushNotificationToggle';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pink-900/40 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-pink-300 text-xs font-bold bg-pink-500/15 px-3.5 py-1.5 rounded-full border border-pink-500/30 mb-2.5">
            <span className="text-sm">🐷</span>
            <span>Thời Khóa Biểu Của Tôi</span>
            <span className="text-sm">🌸</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-2">
            <span>Lịch Học Của Tôi</span>
            <span className="text-pink-400">🐷</span>
          </h1>
          <p className="text-xs sm:text-sm text-rose-200/70 mt-1 font-medium">
            Lợn Út Ít AI 🐷 tự động nhắc nhở lịch học chu đáo mỗi sáng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {scheduleRow && scheduleRow.schedule_data && scheduleRow.schedule_data.length > 0 && (
            <>
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-xs font-extrabold shadow-lg shadow-pink-500/25 transition-all cute-bounce"
              >
                <Smartphone className="w-4 h-4" />
                <span>Đồng Bộ Lịch Điện Thoại 🐷</span>
              </button>
            </>
          )}

          {scheduleRow && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-[#261420] hover:bg-pink-950/70 text-pink-300 text-xs font-bold border border-pink-500/30 transition-all cute-bounce"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? 'Thoát Chỉnh Sửa' : 'Chỉnh Sửa Lịch 🌸'}</span>
              </button>

              <button
                onClick={handleDeleteAll}
                disabled={deleting}
                className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30 transition-all disabled:opacity-50 cute-bounce"
                title="Xóa toàn bộ lịch học"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Đang xóa...' : 'Xóa Lịch'}</span>
              </button>
            </>
          )}

          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-xs font-extrabold shadow-lg shadow-pink-500/25 transition-all cute-bounce"
          >
            <Plus className="w-4 h-4" />
            <span>Tải Ảnh Mới 🐷</span>
          </Link>
        </div>
      </div>

      {/* Web Push Notification Toggle Card */}
      <PushNotificationToggle />

      {loading ? (
        <div className="py-16 text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-pink-400 mx-auto" />
          <p className="text-rose-200/70 text-sm font-medium">Lợn Út Ít đang tải lịch học của bạn... 🐷</p>
        </div>
      ) : errorMsg ? (
        <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs flex items-center space-x-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : !scheduleRow || !scheduleRow.schedule_data || scheduleRow.schedule_data.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4 max-w-lg mx-auto rounded-3xl">
          <div className="w-20 h-20 rounded-3xl bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto text-4xl shadow-inner">
            🐷
          </div>
          <h3 className="text-xl font-extrabold text-white">Bạn chưa có lịch học nào cả 🌸</h3>
          <p className="text-xs text-rose-200/70 leading-relaxed font-medium">
            Hãy tải ảnh thời khóa biểu lên để chú Lợn AI Út Ít tự động bóc tách và gửi nhắc nhở học tập mỗi sáng nhé!
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-pink-500/30 transition-all cute-bounce"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tải Ảnh Ngay Bằng AI 🐷</span>
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
                  className={`glass-card p-5 space-y-4 transition-all relative rounded-3xl ${
                    isToday
                      ? 'border-pink-500/80 ring-2 ring-pink-500/40 bg-[#2b1523]/95 shadow-lg shadow-pink-950/50'
                      : 'hover:border-pink-500/40'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between border-b border-pink-900/40 pb-3">
                    <h3 className={`text-base font-extrabold flex items-center space-x-2 ${isToday ? 'text-pink-300' : 'text-white'}`}>
                      <span>🌸</span>
                      <span>{DAY_NAMES[dayNum]}</span>
                    </h3>
                    {isToday && (
                      <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-pink-500/25 text-pink-300 border border-pink-500/40">
                        Hôm nay 🐷
                      </span>
                    )}
                  </div>

                  {/* Class List */}
                  <div className="space-y-3">
                    {dayItems.length === 0 ? (
                      <p className="text-xs text-rose-300/40 italic py-2">Không có lịch học 🌸</p>
                    ) : (
                      dayItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-[#1a0c15]/90 border border-pink-900/40 space-y-2 hover:border-pink-500/40 transition-all shadow-sm"
                        >
                          <div className="font-extrabold text-xs text-rose-100 line-clamp-2">
                            {item.subject_name}
                          </div>
                          <div className="flex items-center justify-between text-xs text-rose-200/70 pt-1.5 border-t border-pink-950/60">
                            <div className="flex items-center space-x-1 text-pink-300 font-mono font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{item.start_time} - {item.end_time}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-rose-200 font-semibold">
                              <MapPin className="w-3.5 h-3.5 text-pink-400" />
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
