import { ScheduleItem, DAY_NAMES } from '@/types/schedule';

/**
 * Format a Date object to iCalendar UTC string format: YYYYMMDDTHHMMSSZ or Local YYYYMMDDTHHMMSS
 */
function formatDateToIcs(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Get the next Date object for a given day_of_week (2=Mon, ..., 8=Sun) and time string "HH:mm"
 */
function getNextDateForDay(dayOfWeek: number, timeStr: string): Date {
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr || '7', 10);
  const minutes = parseInt(minutesStr || '0', 10);

  // Convert JS day (0=Sun, 1=Mon, ..., 6=Sat) to system day (2=Mon, ..., 8=Sun)
  const today = new Date();
  const todayJs = today.getDay(); // 0=Sun, 1=Mon...
  const todaySystem = todayJs === 0 ? 8 : todayJs + 1;

  let daysUntilTarget = dayOfWeek - todaySystem;
  if (daysUntilTarget < 0) {
    daysUntilTarget += 7;
  }

  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget);
  targetDate.setHours(hours, minutes, 0, 0);
  return targetDate;
}

/**
 * Generate iCalendar (.ics) string for all schedule items with stable slot UIDs
 * Stable UIDs + STATUS:CANCELLED for remaining slots ensures Apple Calendar / Outlook
 * OVERWRITES existing subjects and AUTOMATICALLY DELETES removed subjects on iPhone!
 */
export function generateIcsContent(scheduleItems: ScheduleItem[], userId?: string): string {
  const userKey = userId || 'user';
  const MAX_SLOTS = Math.max(scheduleItems.length, 25); // Cover up to 25 slots to clear removed subjects

  const activeEvents = scheduleItems.map((item, index) => {
    const startDate = getNextDateForDay(item.day_of_week, item.start_time);
    const endDate = getNextDateForDay(item.day_of_week, item.end_time);

    // Handle case where end_time <= start_time
    if (endDate <= startDate) {
      endDate.setHours(startDate.getHours() + 2);
    }

    const dtStart = formatDateToIcs(startDate);
    const dtEnd = formatDateToIcs(endDate);
    const dayName = DAY_NAMES[item.day_of_week] || `Thứ ${item.day_of_week}`;

    // STABLE SLOT UID: Ensures slot X ALWAYS overwrites slot X on iPhone regardless of subject name changes
    const slotNumber = index + 1;
    const eventUid = `lichhoc-${userKey}-slot-${slotNumber}@lichhoc.ai`;

    return [
      'BEGIN:VEVENT',
      `UID:${eventUid}`,
      `DTSTAMP:${formatDateToIcs(new Date())}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `RRULE:FREQ=WEEKLY`, // Recur weekly
      `SUMMARY:${item.subject_name.replace(/[,;\\]/g, '\\$&')}`,
      `LOCATION:${(item.room || 'Phòng học').replace(/[,;\\]/g, '\\$&')}`,
      `DESCRIPTION:Lịch học hàng tuần vào ${dayName}. Tự động tạo bởi LịchHọc.AI`,
      `STATUS:CONFIRMED`,
      'BEGIN:VALARM',
      'TRIGGER:-PT2H', // Alarm 2 hours before class
      'ACTION:DISPLAY',
      'DESCRIPTION:Nhắc lịch học (trước 2 tiếng)',
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:PT0M', // Alarm at exact start time
      'ACTION:DISPLAY',
      'DESCRIPTION:Đến giờ vào lớp!',
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  });

  // Cancelled events for unused slots (from scheduleItems.length + 1 to MAX_SLOTS)
  const cancelledEvents: string[] = [];
  for (let slotNumber = scheduleItems.length + 1; slotNumber <= MAX_SLOTS; slotNumber++) {
    const eventUid = `lichhoc-${userKey}-slot-${slotNumber}@lichhoc.ai`;
    cancelledEvents.push(
      [
        'BEGIN:VEVENT',
        `UID:${eventUid}`,
        `DTSTAMP:${formatDateToIcs(new Date())}`,
        `STATUS:CANCELLED`,
        `SUMMARY:Môn học đã xóa`,
        'END:VEVENT',
      ].join('\r\n')
    );
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LichHoc AI//Schedule Exporter//VN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Lịch Học Smart',
    'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
    'X-PUBLISHED-TTL:PT1H', // Tells calendar apps to refresh feed hourly
    ...activeEvents,
    ...cancelledEvents,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Trigger download of .ics file in browser
 */
export function downloadIcsCalendar(scheduleItems: ScheduleItem[], filename = 'lich-hoc.ics', userId?: string) {
  if (!scheduleItems || scheduleItems.length === 0) return;
  const content = generateIcsContent(scheduleItems, userId);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a .ics file that cancels all previous 25 schedule slots on iPhone / Outlook
 */
export function downloadClearAllIcsCalendar(userId?: string) {
  const userKey = userId || 'user';
  const now = new Date();
  const dtStart = formatDateToIcs(now);
  const dtEnd = formatDateToIcs(new Date(now.getTime() + 3600000));

  const cancelledEvents: string[] = [];
  for (let slotNumber = 1; slotNumber <= 25; slotNumber++) {
    const eventUid = `lichhoc-${userKey}-slot-${slotNumber}@lichhoc.ai`;
    cancelledEvents.push(
      [
        'BEGIN:VEVENT',
        `UID:${eventUid}`,
        `DTSTAMP:${formatDateToIcs(now)}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `STATUS:CANCELLED`,
        `SUMMARY:Hủy môn học slot ${slotNumber}`,
        'END:VEVENT',
      ].join('\r\n')
    );
  }

  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LichHoc AI//Schedule Exporter//VN',
    'CALSCALE:GREGORIAN',
    'METHOD:CANCEL',
    'X-WR-CALNAME:Lịch Học Smart',
    ...cancelledEvents,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'xoa-lich-cu-iphone.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar URL for an individual schedule item
 */
export function generateGoogleCalendarUrl(item: ScheduleItem): string {
  const startDate = getNextDateForDay(item.day_of_week, item.start_time);
  const endDate = getNextDateForDay(item.day_of_week, item.end_time);

  if (endDate <= startDate) {
    endDate.setHours(startDate.getHours() + 2);
  }

  const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const startStr = formatGCalDate(startDate);
  const endStr = formatGCalDate(endDate);

  const title = encodeURIComponent(item.subject_name);
  const location = encodeURIComponent(item.room || 'Phòng học');
  const details = encodeURIComponent(
    `Lịch học ${DAY_NAMES[item.day_of_week] || ''} hàng tuần từ ${item.start_time} - ${item.end_time}. Tạo bởi ThanhDev`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}&recur=RRULE:FREQ=WEEKLY`;
}
