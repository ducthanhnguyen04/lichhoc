import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateIcsContent } from '@/lib/calendar';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new NextResponse('Thiếu tham số userId', { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('schedules')
      .select('schedule_data')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Lỗi khi truy vấn lịch cho iCal feed:', error);
      return new NextResponse('Lỗi truy vấn cơ sở dữ liệu', { status: 500 });
    }

    const scheduleItems = data?.schedule_data || [];
    const icsContent = generateIcsContent(scheduleItems, userId);

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="lich-hoc.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('Lỗi trong API iCal feed:', err);
    return new NextResponse('Lỗi hệ thống iCal feed', { status: 500 });
  }
}
