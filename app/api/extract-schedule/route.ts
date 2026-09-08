import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { ScheduleItem } from '@/types/schedule';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để thực hiện tính năng này' },
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
    const { imageUrl, base64Image, mimeType } = body;

    if (!imageUrl && !base64Image) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp URL ảnh hoặc dữ liệu ảnh base64' },
        { status: 400 }
      );
    }

    let imagePartData: { mimeType: string; data: string };

    if (base64Image) {
      // Remove data URL prefix if present (e.g. data:image/jpeg;base64,...)
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
      imagePartData = {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64,
      };
    } else {
      // Fetch image from URL and convert to base64
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) {
        throw new Error('Không thể tải ảnh từ URL cung cấp');
      }
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fetchedMime = imgRes.headers.get('content-type') || 'image/jpeg';
      imagePartData = {
        mimeType: fetchedMime,
        data: buffer.toString('base64'),
      };
    }

    const promptText = `Hãy đọc ảnh thời khóa biểu này. Nhận diện chính xác văn bản (có thể bao gồm Tiếng Việt, Tiếng Anh hoặc Tiếng Trung Phồn thể). Trả về KẾT QUẢ DUY NHẤT là một chuỗi JSON hợp lệ, chứa mảng các lớp học. Cấu trúc mỗi object: { day_of_week: number (2 đến 8 tương ứng thứ 2 đến CN), start_time: 'HH:mm', end_time: 'HH:mm', subject_name: string, room: string }. Không kèm theo markdown hay text giải thích.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const imagePart = {
      inlineData: {
        data: imagePartData.data,
        mimeType: imagePartData.mimeType,
      },
    };

    // Fast candidate list prioritized by lowest latency
    const candidateModels = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];
    let result = null;
    let lastModelError: any = null;

    for (const modelName of candidateModels) {
      // Try up to 2 fast attempts per model
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          result = await model.generateContent([promptText, imagePart]);
          if (result) break;
        } catch (err: any) {
          lastModelError = err;
          const is503 = err.status === 503 || err.message?.includes('503') || err.message?.includes('high demand');
          if (is503 && attempt === 1) {
            // Ultra-short 150ms retry delay
            await new Promise((resolve) => setTimeout(resolve, 150));
            continue;
          }
          break; // Immediately move to next candidate model
        }
      }
      if (result) break;
    }

    if (!result) {
      throw new Error(
        `Máy chủ Gemini AI hiện đang quá tải (${lastModelError?.message || 'Lỗi kết nối'}). Vui lòng bấm thử lại sau 3-5 giây!`
      );
    }

    const responseText = result.response.text() || '';
    
    // Clean up potential markdown formatting like ```json ... ```
    const cleanedJsonText = responseText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let scheduleData: ScheduleItem[] = [];
    try {
      scheduleData = JSON.parse(cleanedJsonText);
    } catch (parseErr) {
      console.error('Lỗi parse JSON từ Gemini response:', responseText);
      return NextResponse.json(
        {
          success: false,
          error: 'AI không thể định dạng phản hồi dưới dạng JSON hợp lệ. Vui lòng thử lại với ảnh rõ nét hơn.',
          rawResponse: responseText,
        },
        { status: 422 }
      );
    }

    // Validate structure of parsed array
    if (!Array.isArray(scheduleData)) {
      return NextResponse.json(
        { success: false, error: 'Kết quả trả về không phải là mảng thời khóa biểu' },
        { status: 422 }
      );
    }

    // Format & sanitize schedule items
    const sanitizedSchedule: ScheduleItem[] = scheduleData.map((item) => ({
      day_of_week: Number(item.day_of_week) || 2,
      start_time: String(item.start_time || '07:00').trim(),
      end_time: String(item.end_time || '09:00').trim(),
      subject_name: String(item.subject_name || 'Chưa đặt tên môn').trim(),
      room: String(item.room || 'TBA').trim(),
    }));

    return NextResponse.json({
      success: true,
      schedule_data: sanitizedSchedule,
      imageUrl: imageUrl || null,
    });
  } catch (error: any) {
    console.error('Lỗi trong API extract-schedule:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Đã xảy ra lỗi khi đọc ảnh thời khóa biểu' },
      { status: 500 }
    );
  }
}
