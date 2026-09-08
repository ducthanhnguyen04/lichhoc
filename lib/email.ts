import { Resend } from 'resend';
import { ScheduleItem, DAY_NAMES } from '@/types/schedule';

interface SendReminderOptions {
  toEmail: string;
  dayOfWeek: number;
  todayClasses: ScheduleItem[];
}

export async function sendScheduleReminderEmail({
  toEmail,
  dayOfWeek,
  todayClasses,
}: SendReminderOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'Lịch Học Smart <onboarding@resend.dev>';
  const dayName = DAY_NAMES[dayOfWeek] || 'Hôm nay';

  // Format today's date (DD/MM/YYYY)
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

  // Sort classes by start_time
  const sortedClasses = [...todayClasses].sort((a, b) => a.start_time.localeCompare(b.start_time));

  // Generate HTML Template
  const classesHtml = sortedClasses
    .map(
      (item, idx) => `
      <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span style="background-color: #0284c7; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px;">
            Môn học #${idx + 1}
          </span>
          <span style="color: #38bdf8; font-family: monospace; font-size: 13px; font-weight: bold;">
            ⏰ ${item.start_time} - ${item.end_time}
          </span>
        </div>
        <h3 style="color: #f8fafc; font-size: 16px; font-weight: bold; margin: 0 0 6px 0;">
          ${item.subject_name}
        </h3>
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">
          📍 <strong>Phòng học / Địa điểm:</strong> <span style="color: #e2e8f0; font-weight: 600;">${item.room || 'Chưa cập nhật'}</span>
        </p>
      </div>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lịch Học Hôm Nay</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.5px;">
            📚 Lịch Học ${dayName} (${dateStr})
          </h1>
          <p style="color: #e0f2fe; font-size: 14px; margin: 0; opacity: 0.9;">
            Bạn có <strong>${todayClasses.length} môn học</strong> diễn ra trong ngày hôm nay!
          </p>
        </div>

        <!-- Body Content -->
        <div style="padding: 24px;">
          <p style="color: #cbd5e1; font-size: 14px; margin-top: 0; margin-bottom: 20px;">
            Xin chào! Hệ thống <strong>ThanhDev</strong> nhắc bạn danh sách các lớp học cần tham dự hôm nay:
          </p>

          ${classesHtml}

          <div style="text-align: center; margin-top: 28px; margin-bottom: 12px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://lichhoc.vercel.app'}/my-schedule" style="background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 28px; border-radius: 10px; display: inline-block;">
              Xem Lịch Học Trên Web App
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #1e293b; padding: 16px 24px; text-align: center; background-color: #090d16;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            Email này được gửi tự động bởi <strong>ThanhDev</strong> lúc 07:00 AM.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  if (!apiKey) {
    console.warn(`[WARN] RESEND_API_KEY chưa được cấu hình. Giả lập gửi mail tới ${toEmail}:`, {
      dayOfWeek,
      classesCount: todayClasses.length,
    });
    return { success: true, simulated: true };
  }

  const resend = new Resend(apiKey);

  const response = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: `[ThanhDev] 📚 Nhắc lịch học ${dayName} (${dateStr}) - ${todayClasses.length} môn học`,
    html: htmlContent,
  });

  if (response.error) {
    throw new Error(`Resend Error: ${response.error.message}`);
  }

  return { success: true, id: response.data?.id };
}

interface SendConfirmationOptions {
  toEmail: string;
  scheduleItems: ScheduleItem[];
}

export async function sendScheduleConfirmationEmail({
  toEmail,
  scheduleItems,
}: SendConfirmationOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'Lịch Học Smart <onboarding@resend.dev>';

  // Group items by day_of_week
  const groupedByDay: { [key: number]: ScheduleItem[] } = {};
  scheduleItems.forEach((item) => {
    const day = item.day_of_week || 2;
    if (!groupedByDay[day]) groupedByDay[day] = [];
    groupedByDay[day].push(item);
  });

  const sortedDays = Object.keys(groupedByDay)
    .map(Number)
    .sort((a, b) => a - b);

  const daysHtml = sortedDays
    .map((dayNum) => {
      const dayName = DAY_NAMES[dayNum] || `Thứ ${dayNum}`;
      const items = groupedByDay[dayNum].sort((a, b) => a.start_time.localeCompare(b.start_time));
      const itemsHtml = items
        .map(
          (item) => `
          <div style="background-color: #1e293b; border-left: 4px solid #0284c7; padding: 12px 16px; margin-bottom: 8px; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: #f8fafc; font-size: 15px;">${item.subject_name}</strong>
              <span style="color: #38bdf8; font-family: monospace; font-size: 13px; font-weight: bold;">⏰ ${item.start_time} - ${item.end_time}</span>
            </div>
            <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">📍 Phòng: <span style="color: #e2e8f0;">${item.room || 'Chưa cập nhật'}</span></p>
          </div>
        `
        )
        .join('');

      return `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #38bdf8; font-size: 16px; margin: 0 0 10px 0; border-bottom: 1px solid #334155; padding-bottom: 6px;">
            📅 ${dayName} (${items.length} môn)
          </h3>
          ${itemsHtml}
        </div>
      `;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cập Nhật Thời Khóa Biểu Thành Công</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.5px;">
            🎉 Đã Lưu Thời Khóa Biểu Mới!
          </h1>
          <p style="color: #ecfdf5; font-size: 14px; margin: 0; opacity: 0.9;">
            Hệ thống AI đã cập nhật thành công <strong>${scheduleItems.length} môn học</strong> vào tài khoản của bạn.
          </p>
        </div>

        <!-- Body Content -->
        <div style="padding: 24px;">
          <p style="color: #cbd5e1; font-size: 14px; margin-top: 0; margin-bottom: 20px;">
            Xin chào! Dưới đây là danh sách toàn bộ thời khóa biểu chi tiết vừa được cập nhật:
          </p>

          ${daysHtml}

          <div style="text-align: center; margin-top: 28px; margin-bottom: 12px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://lichhoc.vercel.app'}/my-schedule" style="background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 28px; border-radius: 10px; display: inline-block;">
              Quản Lý Thời Khóa Biểu Trên Web
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #1e293b; padding: 16px 24px; text-align: center; background-color: #090d16;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            Email xác nhận được gửi tự động bởi hệ thống <strong>ThanhDev</strong>.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

  if (!apiKey) {
    console.warn(`[WARN] RESEND_API_KEY chưa được cấu hình. Giả lập gửi mail xác nhận tới ${toEmail}`);
    return { success: true, simulated: true };
  }

  const resend = new Resend(apiKey);

  const response = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: `[ThanhDev] 🎉 Xác nhận thời khóa biểu mới (${scheduleItems.length} môn học)`,
    html: htmlContent,
  });

  if (response.error) {
    throw new Error(`Resend Error: ${response.error.message}`);
  }

  return { success: true, id: response.data?.id };
}
