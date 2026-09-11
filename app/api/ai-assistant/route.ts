import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { DAY_NAMES } from '@/types/schedule';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để sử dụng trợ lý AI' },
        { status: 401 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY chưa được cấu hình' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp câu hỏi' },
        { status: 400 }
      );
    }

    // Fetch user schedule from Supabase
    const { data: scheduleRow, error: dbError } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (dbError) {
      throw dbError;
    }

    const scheduleData = scheduleRow?.schedule_data || [];

    // Calculate dates relative to Vietnam timezone (UTC+7) or current local server time
    const now = new Date();
    // UTC+7 adjustment offset
    const utc7Now = new Date(now.getTime() + (7 * 60 + now.getTimezoneOffset()) * 60000);

    const getDayInfo = (date: Date) => {
      const jsDay = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const dayOfWeek = jsDay === 0 ? 8 : jsDay + 1; // 2 = Thứ 2, ..., 8 = Chủ Nhật
      const formattedDate = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      return {
        dateStr: formattedDate,
        dayOfWeek,
        dayName: DAY_NAMES[dayOfWeek],
      };
    };

    const todayInfo = getDayInfo(utc7Now);

    const tomorrowDate = new Date(utc7Now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowInfo = getDayInfo(tomorrowDate);

    const dayAfterTomorrowDate = new Date(utc7Now);
    dayAfterTomorrowDate.setDate(dayAfterTomorrowDate.getDate() + 2);
    const dayAfterTomorrowInfo = getDayInfo(dayAfterTomorrowDate);

    const formattedScheduleText = scheduleData.length === 0
      ? 'Chưa có thời khóa biểu nào được lưu.'
      : scheduleData
          .map(
            (item: any) =>
              `- ${DAY_NAMES[item.day_of_week] || `Thứ ${item.day_of_week}`}: Môn "${item.subject_name}", Giờ: ${item.start_time} - ${item.end_time}, Phòng: ${item.room || 'Chưa rõ'}`
          )
          .join('\n');

    const systemPrompt = `Bạn là Trợ Lý Lịch Học AI thông minh, thân thiện và chu đáo của ứng dụng Tah.
Nhiệm vụ của bạn là giải đáp thắc mắc về lịch học của sinh viên một cách ngắn gọn, chính xác, dễ hiểu bằng Tiếng Việt.

THÔNG TIN THỜI GIAN HIỆN TẠI (Múi giờ Việt Nam GMT+7):
- Hôm nay: ${todayInfo.dayName} (Ngày ${todayInfo.dateStr})
- Ngày mai: ${tomorrowInfo.dayName} (Ngày ${tomorrowInfo.dateStr})
- Ngày kia (ngày sau ngày mai): ${dayAfterTomorrowInfo.dayName} (Ngày ${dayAfterTomorrowInfo.dateStr})

THỜI KHÓA BIỂU CỦA NGUỜI DÙNG:
${formattedScheduleText}

CÂU HỎI CỦA NGUỜI DÙNG: "${query}"

HƯỚNG DẪN TRẢ LỜI:
1. Phân tích câu hỏi người dùng liên quan đến mốc thời gian nào:
   - "Hôm nay": Tra cứu lịch của ${todayInfo.dayName} (${todayInfo.dateStr}).
   - "Ngày mai": Tra cứu lịch của ${tomorrowInfo.dayName} (${tomorrowInfo.dateStr}).
   - "Ngày kia": Tra cứu lịch của ${dayAfterTomorrowInfo.dayName} (${dayAfterTomorrowInfo.dateStr}).
   - Nếu hỏi ngày thứ cụ thể (vd: "Thứ 2", "Thứ 6"): Tra cứu đúng thứ đó trong thời khóa biểu.
2. Nêu rõ ràng tên môn học, thời gian (từ mấy giờ đến mấy giờ), và phòng học tương ứng.
3. Nếu ngày đó không có môn học nào, trả lời lịch sự rằng ngày đó bạn được nghỉ hoặc không có lịch học.
4. Giữ giọng văn tự nhiên, thân thiện, ngắn gọn (khoảng 2-4 câu ngắn) để tối ưu cho việc đọc lại bằng giọng nói (TTS). Không dùng cú pháp ký tự lạ hay markdown phức tạp.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];
    let result = null;
    let lastModelError: any = null;

    for (const modelName of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          result = await model.generateContent(systemPrompt);
          if (result) break;
        } catch (err: any) {
          lastModelError = err;
          const is503 =
            err.status === 503 ||
            err.message?.includes('503') ||
            err.message?.includes('high demand');
          if (is503 && attempt === 1) {
            await new Promise((resolve) => setTimeout(resolve, 150));
            continue;
          }
          break;
        }
      }
      if (result) break;
    }

    if (!result) {
      throw new Error(
        `AI hiện đang quá tải (${lastModelError?.message || 'Lỗi kết nối'}). Vui lòng thử lại sau giây lát!`
      );
    }

    const answer = result.response.text() || 'Rất tiếc, AI chưa thể đưa ra câu trả lời lúc này.';

    return NextResponse.json({
      success: true,
      query,
      answer,
      todayInfo,
      tomorrowInfo,
      dayAfterTomorrowInfo,
    });
  } catch (error: any) {
    console.error('Lỗi trong API ai-assistant:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Đã xảy ra lỗi khi xử lý câu hỏi AI' },
      { status: 500 }
    );
  }
}
