import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const body = await request.json();
    const { subscription, action } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu push subscription không hợp lệ' },
        { status: 400 }
      );
    }

    if (action === 'unsubscribe') {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint);

      if (error) {
        throw new Error(`Lỗi khi hủy đăng ký push: ${error.message}`);
      }

      return NextResponse.json({ success: true, message: 'Đã hủy đăng ký thông báo Web Push' });
    }

    // Save/upsert subscription
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        user_agent: userAgent,
      },
      { onConflict: 'endpoint' }
    );

    if (error) {
      throw new Error(`Lỗi khi lưu đăng ký push: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '🎉 Đã bật thông báo Web Push thành công trên thiết bị này!',
    });
  } catch (err: any) {
    console.error('Push Subscription API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi xử lý đăng ký thông báo' },
      { status: 500 }
    );
  }
}
