import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWebPushNotification } from '@/lib/push';
import { ScheduleRow, ScheduleItem, DAY_NAMES } from '@/types/schedule';

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
    const now = new Date();
    const todayJs = now.getDay();
    const currentDayOfWeek = todayJs === 0 ? 8 : todayJs + 1;
    const dayName = DAY_NAMES[currentDayOfWeek] || 'Hôm nay';

    // 3. Query all user schedules via Supabase Admin Client
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
        pushNotificationsSent: 0,
      });
    }

    let pushSentCount = 0;
    const detailsLog: Array<{ userId: string; classesCount: number; devicesNotified: number; status: string }> = [];

    // 4. Process each schedule
    for (const schedule of schedules as ScheduleRow[]) {
      const scheduleItems: ScheduleItem[] = schedule.schedule_data || [];

      // Filter classes taking place today (or all classes if test mode)
      const targetClasses = isTestMode
        ? scheduleItems
        : scheduleItems.filter((item) => Number(item.day_of_week) === currentDayOfWeek);

      if (targetClasses.length > 0) {
        // Query active push subscriptions for this user
        const { data: subscriptions, error: subError } = await supabaseAdmin
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', schedule.user_id);

        if (subError) {
          console.error(`Lỗi khi tải push subscriptions cho user ${schedule.user_id}:`, subError);
          detailsLog.push({
            userId: schedule.user_id,
            classesCount: targetClasses.length,
            devicesNotified: 0,
            status: `Error fetching subscriptions: ${subError.message}`,
          });
          continue;
        }

        if (!subscriptions || subscriptions.length === 0) {
          detailsLog.push({
            userId: schedule.user_id,
            classesCount: targetClasses.length,
            devicesNotified: 0,
            status: 'Skipped: User has not enabled Web Push Notifications on any browser',
          });
          continue;
        }

        // Format Notification Body with full details (Subject, Time, Room)
        const sortedClasses = [...targetClasses].sort((a, b) => a.start_time.localeCompare(b.start_time));
        const bodyText = sortedClasses
          .map((item, idx) => `${idx + 1}. ${item.subject_name}: ${item.start_time} - ${item.end_time} (📍 ${item.room || 'Phòng học'})`)
          .join('\n');

        let userDevicesSent = 0;

        // Deliver Web Push to all devices of this user
        for (const sub of subscriptions) {
          try {
            await sendWebPushNotification({
              subscription: {
                endpoint: sub.endpoint,
                keys: sub.keys,
              },
              title: `📚 Lịch Học ${dayName} (${sortedClasses.length} ca học)`,
              body: bodyText,
              url: '/my-schedule',
            });
            userDevicesSent++;
            pushSentCount++;
          } catch (pushErr: any) {
            console.error(`Lỗi gửi Push tới endpoint ${sub.endpoint}:`, pushErr);

            // If subscription expired or invalid (410 Gone / 404), remove stale endpoint
            if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
              await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
            }
          }
        }

        detailsLog.push({
          userId: schedule.user_id,
          classesCount: targetClasses.length,
          devicesNotified: userDevicesSent,
          status: userDevicesSent > 0 ? 'Success' : 'Failed to deliver to devices',
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      currentDayOfWeek,
      totalSchedulesProcessed: schedules.length,
      pushNotificationsSent: pushSentCount,
      details: detailsLog,
    });
  } catch (error: any) {
    console.error('Lỗi khi thực thi Push Notification Cron Job:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi hệ thống khi chạy Cron Job Web Push' },
      { status: 500 }
    );
  }
}
