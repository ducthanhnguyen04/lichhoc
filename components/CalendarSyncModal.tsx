'use client';

import { useState } from 'react';
import { ScheduleItem, DAY_NAMES } from '@/types/schedule';
import { downloadIcsCalendar, downloadClearAllIcsCalendar, generateGoogleCalendarUrl } from '@/lib/calendar';
import { Calendar, Download, ExternalLink, Check, Smartphone, Bell, X, Sparkles, Trash2 } from 'lucide-react';

interface CalendarSyncModalProps {
  scheduleItems: ScheduleItem[];
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CalendarSyncModal({ scheduleItems, userId, isOpen, onClose }: CalendarSyncModalProps) {
  const [downloaded, setDownloaded] = useState(false);
  const [clearedOld, setClearedOld] = useState(false);

  if (!isOpen) return null;

  const handleDownloadIcs = () => {
    downloadIcsCalendar(scheduleItems, 'lich-hoc.ics', userId);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 4000);
  };

  const handleClearOldIcs = () => {
    downloadClearAllIcsCalendar(userId);
    setClearedOld(true);
    setTimeout(() => setClearedOld(false), 4000);
  };

  // Group items by day_of_week for Google Calendar list
  const sortedItems = [...scheduleItems].sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
    return a.start_time.localeCompare(b.start_time);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-card border border-slate-700/80 shadow-2xl overflow-hidden rounded-2xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-cyan-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Đồng bộ thông báo điện thoại</span>
          </div>
          <h2 className="text-xl font-bold">Thêm Lịch Học Vào Điện Thoại</h2>
          <p className="text-xs text-cyan-100/90 mt-1">
            Điện thoại sẽ tự động báo thức & nhắc thông báo trước giờ học 15 phút!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Option 1: .ics Export for Apple / Samsung / Outlook */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Tải File Lịch .ics Cho Điện Thoại</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Phù hợp cho <strong>iPhone (Apple Calendar)</strong>, <strong>Samsung Calendar</strong>, <strong>Outlook</strong>. Chỉ 1 click để thêm/cập nhật toàn bộ môn học vào điện thoại!
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={handleDownloadIcs}
                className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
                  downloaded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20'
                }`}
              >
                {downloaded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã tải file lich-hoc.ics!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Tải File .ics Mới ({scheduleItems.length} môn)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleClearOldIcs}
                className="w-full sm:w-auto py-3 px-3 rounded-xl font-semibold text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center space-x-1.5 transition-all"
                title="Tải file hủy toàn bộ lịch cũ trên iPhone"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>{clearedOld ? 'Đã tải file xóa!' : 'File Xóa Lịch Cũ'}</span>
              </button>
            </div>
          </div>

          {/* Option 2: Google Calendar Links */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-bold text-white">
                  Cách 2: Thêm từng môn vào Google Calendar
                </h3>
                <p className="text-xs text-slate-400">
                  Nhấn vào nút môn học để mở thẳng ứng dụng Google Calendar trên điện thoại/máy tính:
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1">
              {sortedItems.map((item, idx) => {
                const gcalUrl = generateGoogleCalendarUrl(item);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold text-slate-200 block truncate">{item.subject_name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {DAY_NAMES[item.day_of_week]} | {item.start_time} - {item.end_time}
                      </span>
                    </div>

                    <a
                      href={gcalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-semibold shrink-0 transition-all border border-blue-500/30"
                    >
                      <span>Thêm</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions Box */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-start space-x-2">
            <Bell className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              <strong>Mẹo:</strong> Sau khi tải file `.ics` trên điện thoại, bạn bấm vào file vừa tải về ➔ chọn <strong>"Thêm tất cả" (Add All)</strong> vào ứng dụng Lịch máy để bật chuông báo thức trước mỗi ca học!
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
