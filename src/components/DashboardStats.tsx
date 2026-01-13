'use client';

import { Users, FileText, FolderKanban } from 'lucide-react';

interface DashboardStatsProps {
  totalTeams: number;
  totalLogs: number;
  totalPortfolios: number;
}

export default function DashboardStats({ totalTeams, totalLogs, totalPortfolios }: DashboardStatsProps) {
  const stats = [
    {
      label: '총 팀',
      value: totalTeams,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: '총 로그',
      value: totalLogs,
      icon: FileText,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: '포트폴리오',
      value: totalPortfolios,
      icon: FolderKanban,
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Icon className="w-8 h-8" />
              </div>
            </div>
            <div className="mb-2">
              <p className="text-white/80 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-5xl font-bold">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

