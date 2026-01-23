// 개인 포트폴리오 타입 정의
export interface PersonalPortfolio {
  id: string;
  user_id: string;
  bio?: string;
  skills: string[];
  achievements: string[];
  is_public: boolean;
  portfolio_slug?: string;
  created_at: string;
  updated_at: string;
}

// 포트폴리오 수정 요청 타입
export interface UpdatePortfolioRequest {
  bio?: string;
  skills?: string[];
  achievements?: string[];
  is_public?: boolean;
}

// 포트폴리오 통계 타입
export interface PortfolioStats {
  total_logs: number;
  total_days: number;
  average_per_day: number;
  recent_logs: Array<{
    id: string;
    content: string;
    log_date: string;
    tags?: string[];
  }>;
  top_tags: Array<{
    tag: string;
    count: number;
  }>;
}

// 포트폴리오 상세 정보 (통계 포함)
export interface PortfolioWithStats extends PersonalPortfolio {
  stats?: PortfolioStats;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
  };
}

