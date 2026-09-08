import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendScheduleReminderEmail } from '@/lib/email';
import { ScheduleRow, ScheduleItem } from '@/types/schedule';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Cron Authorization Secret
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const secretQuery = searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret) {
      const isHeaderValid = authHeader === `Bearer ${expectedSecret}`;
      const isQueryValid = secretQuery === expectedSecret;
      if (!isHeaderValid && !isQueryValid) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized CRON execution' },
          { status: 401 }
        );
      }
    }

    // Check for test mode query param
    const isTestMode = searchParams.get('test') === 'true';

    // 2. Determine Today's Day of Week
    // JS getDay(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Our DB standard: 2 = Monday, 3 = Tuesday, ..., 7 = Saturday, 8 = Sunday
    const now = new Date();
    const todayJs = now.getDay();
    const currentDayOfWeek = todayJs === 0 ? 8 : todayJs + 1;

    // 3. Query all user schedules via Supabase Admin Client (Service Role)
    const supabaseAdmin = createAdminClient();
    const { data: schedules, error: dbError } = await supabaseAdmin
      .from('schedules')
      .select('*');

    if (dbError) {
      throw new Error(`Lỗi khi truy vấn database: ${dbError.message}`);
    }

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Không tìm thấy dữ liệu thời khóa biểu nào trong cơ sở dữ liệu.',
        usersProcessed: 0,
        emailsSent: 0,
      });
    }

    let emailsSentCount = 0;
    const detailsLog: Array<{ userId: string; email: string; classesCount: number; status: string }> = [];

    // 4. Process each schedule
    for (const schedule of schedules as ScheduleRow[]) {
      const scheduleItems: ScheduleItem[] = schedule.schedule_data || [];
      
      // Filter classes taking place today (or all classes if test mode)
      const targetClasses = isTestMode
        ? scheduleItems
        : scheduleItems.filter((item) => Number(item.day_of_week) === currentDayOfWeek);

      if (targetClasses.length > 0) {
        // Fetch user email from Supabase Auth Admin
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
          schedule.user_id
        );

        if (userError || !userData?.user?.email) {
          console.error(`Không tìm thấy email cho user_id ${schedule.user_id}:`, userError);
          detailsLog.push({
            userId: schedule.user_id,
            email: 'Unknown',
            classesCount: targetClasses.length,
            status: 'Failed: Email not found',
          });
          continue;
        }

        const userEmail = userData.user.email;

        // Send Email
        try {
          await sendScheduleReminderEmail({
            toEmail: userEmail,
            dayOfWeek: currentDayOfWeek,
            todayClasses: targetClasses,
          });

          emailsSentCount++;
          detailsLog.push({
            userId: schedule.user_id,
            email: userEmail,
            classesCount: targetClasses.length,
            status: 'Success',
          });
        } catch (emailErr: any) {
          console.error(`Lỗi khi gửi mail cho ${userEmail}:`, emailErr);
          detailsLog.push({
            userId: schedule.user_id,
            email: userEmail,
            classesCount: targetClasses.length,
            status: `Failed: ${emailErr.message}`,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      currentDayOfWeek,
      totalSchedulesProcessed: schedules.length,
      emailsSentCount,
      details: detailsLog,
    });
  } catch (error: any) {
    console.error('Lỗi khi thực thi Cron Job:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi hệ thống khi chạy Cron Job' },
      { status: 500 }
    );
  }
}
