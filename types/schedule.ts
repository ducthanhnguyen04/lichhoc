export interface ScheduleItem {
  day_of_week: number; // 2: Thứ 2, 3: Thứ 3, ..., 8: Chủ Nhật
  start_time: string;  // Định dạng "HH:mm" (ví dụ: "07:30")
  end_time: string;    // Định dạng "HH:mm" (ví dụ: "09:30")
  subject_name: string; // Tên môn học
  room: string;        // Phòng học / Địa điểm
}

export interface ScheduleRow {
  id: string;
  user_id: string;
  image_url: string | null;
  schedule_data: ScheduleItem[];
  created_at: string;
  updated_at: string;
}

export const DAY_NAMES: Record<number, string> = {
  2: 'Thứ Hai',
  3: 'Thứ Ba',
  4: 'Thứ Tư',
  5: 'Thứ Năm',
  6: 'Thứ Sáu',
  7: 'Thứ Bảy',
  8: 'Chủ Nhật',
};
