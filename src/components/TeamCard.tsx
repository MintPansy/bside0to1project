'use client';

import Link from 'next/link';
import { Users, FileText, Clock, ArrowRight } from 'lucide-react';

interface TeamCardProps {
  team: any;
  index: number;
}

// 팀별 색상 배열
const teamColors = [
  { borderColor: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700' },
  { borderColor: '#10b981', bg: 'bg-green-50', text: 'text-green-700' },
  { borderColor: '#8b5cf6', bg: 'bg-purple-50', text: 'text-purple-700' },
  { borderColor: '#f97316', bg: 'bg-orange-50', text: 'text-orange-700' },
  { borderColor: '#ec4899', bg: 'bg-pink-50', text: 'text-pink-700' },
  { borderColor: '#6366f1', bg: 'bg-indigo-50', text: 'text-indigo-700' },
];

export default function TeamCard({ team, index }: TeamCardProps) {
  const color = teamColors[index % teamColors.length];
  
  // 시간 포맷팅
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    return new Date(date).toLocaleDateString('ko-KR');
  };

  return (
    <Link
      href={`/teams/${team.id}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-t-4 border-l border-r border-b border-gray-200 hover:scale-[1.02]"
      style={{ borderTopColor: color.borderColor }}
    >
      <div className="p-6">
        {/* 팀 이름 */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {team.name}
        </h3>
        
        {/* 팀 설명 */}
        {team.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {team.description}
          </p>
        )}

        {/* 통계 배지 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color.bg} ${color.text}`}>
            <Users className="w-3 h-3" />
            <span>{team.memberCount}명</span>
          </div>
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color.bg} ${color.text}`}>
            <FileText className="w-3 h-3" />
            <span>{team.logCount}개 로그</span>
          </div>
        </div>

        {/* 마지막 업데이트 */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>업데이트: {formatTimeAgo(team.lastUpdated)}</span>
          </div>
        </div>

        {/* 팀 보기 버튼 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
            팀 보기
          </span>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}

