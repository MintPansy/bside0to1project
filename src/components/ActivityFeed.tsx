'use client';

import Link from 'next/link';
import { FileText, FolderKanban, Users, Clock } from 'lucide-react';

interface Activity {
  type: 'log' | 'portfolio' | 'team';
  id: string;
  title: string;
  user?: string;
  team: string;
  teamId?: string;
  createdAt: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'log':
        return { Icon: FileText, color: 'bg-blue-500', textColor: 'text-blue-600' };
      case 'portfolio':
        return { Icon: FolderKanban, color: 'bg-yellow-500', textColor: 'text-yellow-600' };
      case 'team':
        return { Icon: Users, color: 'bg-green-500', textColor: 'text-green-600' };
      default:
        return { Icon: FileText, color: 'bg-gray-500', textColor: 'text-gray-600' };
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'log':
        return `${activity.user}님이 '${activity.title}' 로그를 작성했습니다`;
      case 'portfolio':
        return `'${activity.title}' 포트폴리오가 생성되었습니다`;
      case 'team':
        return `'${activity.title}' 팀이 생성되었습니다`;
      default:
        return activity.title;
    }
  };

  const getActivityLink = (activity: Activity) => {
    if (activity.type === 'log' && activity.teamId) {
      return `/teams/${activity.teamId}/logs/${activity.id}`;
    }
    if (activity.type === 'portfolio' && activity.teamId) {
      return `/teams/${activity.teamId}/portfolio/${activity.id}`;
    }
    if (activity.type === 'team') {
      return `/teams/${activity.id}`;
    }
    return '#';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        {activities.map((activity, index) => {
          const { Icon, color, textColor } = getActivityIcon(activity.type);
          return (
            <Link
              key={`${activity.type}-${activity.id}-${index}`}
              href={getActivityLink(activity)}
              className="group flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
            >
              {/* 좌측 컬러 아이콘 */}
              <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* 중앙 내용 */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                  {getActivityText(activity)}
                </p>
                {activity.team && (
                  <p className="text-sm text-gray-500 mt-1">{activity.team}</p>
                )}
              </div>

              {/* 우측 시간 */}
              <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(activity.createdAt)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

