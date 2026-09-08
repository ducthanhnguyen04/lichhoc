import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWebPushNotification } from '@/lib/push';

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

    let sentCount = 0;
    const errors: string[] = [];

    for (const sub of subscriptions) {
      try {
        await sendWebPushNotification({
          subscription: {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          title: '🎉 Thông Báo Web Push Thử Nghiệm',
          body: 'Chúc mừng! Bạn đã kích hoạt thành công dịch vụ nhắc nhở LịchHọc.Ai trên trình duyệt này.',
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
      message: `🎉 Đã gửi thông báo test thành công tới ${sentCount} thiết bị của bạn!`,
    });
  } catch (err: any) {
    console.error('Test Push API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống khi gửi Push Test' },
      { status: 500 }
    );
  }
}
