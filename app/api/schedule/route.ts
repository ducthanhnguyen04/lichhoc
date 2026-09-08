import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { ScheduleItem } from '@/types/schedule';
import { sendScheduleConfirmationEmail } from '@/lib/email';

// GET: Lấy thời khóa biểu của user đang đăng nhập
export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để lấy lịch học' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      schedule: data || null,
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy lịch học:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi hệ thống khi tải lịch học' },
      { status: 500 }
    );
  }
}

// POST: Lưu hoặc ghi đè (upsert) thời khóa biểu của user
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để lưu lịch học' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { schedule_data, image_url } = body;

    if (!Array.isArray(schedule_data)) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu schedule_data phải là mảng hợp lệ' },
        { status: 400 }
      );
    }

    // Validate schedule items
    const validatedData: ScheduleItem[] = schedule_data.map((item: any) => ({
      day_of_week: Number(item.day_of_week) || 2,
      start_time: String(item.start_time || '07:00').trim(),
      end_time: String(item.end_time || '09:00').trim(),
      subject_name: String(item.subject_name || 'Chưa đặt tên môn').trim(),
      room: String(item.room || 'TBA').trim(),
    }));

    // Check if schedule row already exists for user
    const { data: existingSchedule } = await supabase
      .from('schedules')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let savedResult;

    if (existingSchedule) {
      // Update existing record
      const { data, error } = await supabase
        .from('schedules')
        .update({
          schedule_data: validatedData,
          image_url: image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSchedule.id)
        .select()
        .single();

      if (error) throw error;
      savedResult = data;
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('schedules')
        .insert({
          user_id: user.id,
          schedule_data: validatedData,
          image_url: image_url || null,
        })
        .select()
        .single();

      if (error) throw error;
      savedResult = data;
    }

    // Send confirmation email asynchronously to user if user.email exists
    if (user.email && validatedData.length > 0) {
      sendScheduleConfirmationEmail({
        toEmail: user.email,
        scheduleItems: validatedData,
      }).catch((emailErr) => {
        console.error('Lỗi khi tự động gửi email thông báo lịch học:', emailErr);
      });
    }

    return NextResponse.json({
      success: true,
      schedule: savedResult,
      message: 'Đã lưu lịch học thành công!',
    });
  } catch (error: any) {
    console.error('Lỗi khi lưu lịch học:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Đã xảy ra lỗi khi lưu lịch học' },
      { status: 500 }
    );
  }
}

// DELETE: Xóa toàn bộ lịch học của user đang đăng nhập
export async function DELETE() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để xóa lịch học' },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Đã xóa toàn bộ lịch học thành công!',
    });
  } catch (error: any) {
    console.error('Lỗi khi xóa lịch học:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Đã xảy ra lỗi khi xóa lịch học' },
      { status: 500 }
    );
  }
}
