// Learning Log 타입 정의
export interface LearningLog {
  id: string;
  user_id: string;
  content: string;
  log_date: string; // YYYY-MM-DD 형식
  tags?: string[]; // 선택사항
  created_at: string;
  updated_at: string;
}

// Learning Log 생성 요청 타입
export interface CreateLearningLogRequest {
  content: string;
  log_date: string; // YYYY-MM-DD 형식
  tags?: string[];
}

// Learning Log 업데이트 요청 타입
export interface UpdateLearningLogRequest {
  content?: string;
  log_date?: string;
  tags?: string[];
}

