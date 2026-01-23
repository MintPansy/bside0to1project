import Link from 'next/link';
import { User, BookOpen, Calendar, TrendingUp, Code, Eye, Edit, CheckCircle2 } from 'lucide-react';
import type { PersonalPortfolio, PortfolioStats } from '@/types/portfolio';

interface DashboardPortfolioCardProps {
  portfolio: PersonalPortfolio | null;
  stats: PortfolioStats | null;
  userName: string;
}

export default function DashboardPortfolioCard({
  portfolio,
  stats,
  userName,
}: DashboardPortfolioCardProps) {
  // 포트폴리오가 없는 경우
  if (!portfolio) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-dashed border-gray-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">포트폴리오</h3>
            <p className="text-sm text-gray-500">아직 포트폴리오가 없습니다</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          포트폴리오를 생성하여 학습 기록을 공유해보세요.
        </p>
        <Link
          href="/portfolio/edit"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          포트폴리오 생성하기
        </Link>
      </div>
    );
  }

  const skillsCount = portfolio.skills?.length || 0;
  const skillsPreview = portfolio.skills?.slice(0, 3) || [];
  const hasMoreSkills = skillsCount > 3;

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {userName}의 성장 여정
            </h3>
            {portfolio.is_public && (
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-medium">공개 중</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          통계
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">학습 기록</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {stats?.total_logs || 0}개
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">활동 기간</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {stats?.total_days || 0}일
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-600">일 평균</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {stats?.average_per_day?.toFixed(1) || '0.0'}개
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Code className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-gray-600">기술 스택</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {skillsCount}개
            </p>
          </div>
        </div>
      </div>

      {/* 기술 스택 미리보기 */}
      {skillsPreview.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Code className="w-4 h-4" />
            기술 스택
          </h4>
          <div className="flex flex-wrap gap-2">
            {skillsPreview.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {hasMoreSkills && (
              <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
                +{skillsCount - 3}개
              </span>
            )}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
        <Link
          href="/portfolio"
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Eye className="w-4 h-4" />
          포트폴리오 보기
        </Link>
        <Link
          href="/portfolio/edit"
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          포트폴리오 편집
        </Link>
      </div>

      {/* 공개 URL (공개 중인 경우) */}
      {portfolio.is_public && portfolio.portfolio_slug && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1">공개 URL:</p>
          <a
            href={`/profile/${portfolio.portfolio_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline break-all"
          >
            /profile/{portfolio.portfolio_slug}
          </a>
        </div>
      )}
    </div>
  );
}

