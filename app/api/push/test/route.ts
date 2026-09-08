import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWebPushNotification } from '@/lib/push';
import { ScheduleItem, DAY_NAMES } from '@/types/schedule';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // Query User's Push Subscriptions
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user.id);

    if (subError) {
      return NextResponse.json(
        { success: false, error: `Lỗi đọc đăng ký push: ${subError.message}` },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Chưa tìm thấy đăng ký Web Push nào của bạn trên hệ thống. Hãy bấm nút "Bật Thông Báo Web Push Ngay" trước.',
        },
        { status: 400 }
      );
    }

    // Query User's Real Schedule Data
    const { data: scheduleRow } = await supabaseAdmin
      .from('schedules')
      .select('schedule_data')
      .eq('user_id', user.id)
      .maybeSingle();

    const scheduleItems: ScheduleItem[] = scheduleRow?.schedule_data || [];

    const now = new Date();
    const todayJs = now.getDay();
    const currentDayOfWeek = todayJs === 0 ? 8 : todayJs + 1;
    const dayName = DAY_NAMES[currentDayOfWeek] || 'Hôm nay';

    const todayClasses = scheduleItems.filter((item) => Number(item.day_of_week) === currentDayOfWeek);
    const targetClasses = todayClasses.length > 0 ? todayClasses : scheduleItems;

    const sortedClasses = [...targetClasses].sort((a, b) => a.start_time.localeCompare(b.start_time));
    const title = todayClasses.length > 0
      ? `📚 Lịch Học ${dayName} (${sortedClasses.length} ca học)`
      : `📚 Danh Sách Môn Học LịchHọc.Ai (${sortedClasses.length} môn)`;

    const bodyText = sortedClasses.length > 0
      ? sortedClasses
          .map((item, idx) => `${idx + 1}. ${item.subject_name}: ${item.start_time} - ${item.end_time} (📍 ${item.room || 'Phòng học'})`)
          .join('\n')
      : 'Chưa tìm thấy môn học nào trong thời khóa biểu của bạn.';

    let sentCount = 0;
    const errors: string[] = [];

    for (const sub of subscriptions) {
      try {
        await sendWebPushNotification({
          subscription: {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          title,
          body: bodyText,
          url: '/my-schedule',
        });
        sentCount++;
      } catch (pushErr: any) {
        console.error('Lỗi khi gửi Push Test:', pushErr);
        errors.push(pushErr.message || 'Lỗi gửi push');

        if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    }

    if (sentCount === 0) {
      return NextResponse.json(
        { success: false, error: `Lỗi gửi push: ${errors.join('; ')}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `🎉 Đã gửi thông báo với đúng tên môn, giờ học & phòng học tới ${sentCount} thiết bị của bạn!`,
    });
  } catch (err: any) {
    console.error('Test Push API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống khi gửi Push Test' },
      { status: 500 }
    );
  }
}
