'use client';

import { useState } from 'react';
import { ScheduleItem, DAY_NAMES } from '@/types/schedule';
import { downloadIcsCalendar, downloadClearAllIcsCalendar, generateGoogleCalendarUrl } from '@/lib/calendar';
import { Calendar, Download, ExternalLink, Check, Smartphone, Bell, X, Trash2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-card border border-pink-900/40 shadow-2xl overflow-hidden rounded-3xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-pink-100 text-xs font-extrabold uppercase tracking-wider mb-1">
            <span className="text-sm">🐷</span>
            <span>Đồng bộ lịch điện thoại 🌸</span>
          </div>
          <h2 className="text-xl font-black">Thêm Lịch Học Vào Điện Thoại</h2>
          <p className="text-xs text-pink-100/90 mt-1 font-medium">
            Điện thoại sẽ tự động báo thức & nhắc thông báo trước giờ học 15 phút!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Option 1: .ics Export for Apple / Samsung / Outlook */}
          <div className="p-4 rounded-2xl bg-[#1d0e17]/90 border border-pink-900/40 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-300 shrink-0 mt-0.5 text-lg">
                🐷
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-xs font-extrabold text-white flex items-center space-x-2">
                  <span>Tải File Lịch .ics Cho Điện Thoại 🌸</span>
                </h3>
                <p className="text-[11px] text-rose-200/70 font-medium">
                  Phù hợp cho <strong>iPhone (Apple Calendar)</strong>, <strong>Samsung Calendar</strong>, <strong>Outlook</strong>. Chỉ 1 click để thêm toàn bộ môn học vào điện thoại!
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={handleDownloadIcs}
                className={`w-full sm:flex-1 py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all shadow-md cute-bounce ${
                  downloaded
                    ? 'bg-pink-600 text-white'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white shadow-pink-500/25'
                }`}
              >
                {downloaded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã tải file lich-hoc.ics! 🐷</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Tải File .ics Mới ({scheduleItems.length} môn) 🌸</span>
                  </>
                )}
              </button>

              <button
                onClick={handleClearOldIcs}
                className="w-full sm:w-auto py-3 px-3 rounded-2xl font-bold text-xs bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 flex items-center justify-center space-x-1.5 transition-all cute-bounce"
                title="Tải file hủy toàn bộ lịch cũ trên iPhone"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>{clearedOld ? 'Đã tải!' : 'File Xóa Lịch Cũ'}</span>
              </button>
            </div>
          </div>

          {/* Option 2: Google Calendar Links */}
          <div className="p-4 rounded-2xl bg-[#1d0e17]/90 border border-pink-900/40 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-300 shrink-0 mt-0.5">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-xs font-extrabold text-white">
                  Thêm từng môn vào Google Calendar 🌸
                </h3>
                <p className="text-[11px] text-rose-200/70 font-medium">
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
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[#150a11]/90 border border-pink-900/40 text-xs"
                  >
                    <div className="truncate pr-2">
                      <span className="font-extrabold text-rose-100 block truncate">{item.subject_name}</span>
                      <span className="text-[10px] text-pink-300/80 font-mono font-bold">
                        {DAY_NAMES[item.day_of_week]} | {item.start_time} - {item.end_time}
                      </span>
                    </div>

                    <a
                      href={gcalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 font-extrabold shrink-0 transition-all border border-pink-500/30 text-[11px] cute-bounce"
                    >
                      <span>Thêm 🌸</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions Box */}
          <div className="p-3.5 bg-pink-500/15 border border-pink-500/30 rounded-2xl text-pink-200 text-xs flex items-start space-x-2 font-medium">
            <Bell className="w-4 h-4 shrink-0 mt-0.5 text-pink-400" />
            <span>
              <strong>Mẹo:</strong> Sau khi tải file `.ics` trên điện thoại, bạn bấm vào file vừa tải về ➔ chọn <strong>"Thêm tất cả" (Add All)</strong> vào ứng dụng Lịch máy để bật chuông báo thức nhé! 🐷
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#180b13] border-t border-pink-900/40 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-[#23121d] hover:bg-pink-950/70 text-rose-200 text-xs font-bold border border-pink-500/30 transition-all cute-bounce"
          >
            Đóng 🌸
          </button>
        </div>
      </div>
    </div>
  );
}
