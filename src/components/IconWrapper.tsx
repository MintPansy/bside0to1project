'use client';

import { 
  Users, 
  FileText, 
  FolderKanban, 
  TrendingUp,
  ArrowRight,
  Clock,
  Plus,
  type LucideIcon 
} from 'lucide-react';
import { ComponentPropsWithoutRef } from 'react';

type IconName = 'Users' | 'FileText' | 'FolderKanban' | 'TrendingUp' | 'ArrowRight' | 'Clock' | 'Plus';

const iconMap: Record<IconName, LucideIcon> = {
  Users,
  FileText,
  FolderKanban,
  TrendingUp,
  ArrowRight,
  Clock,
  Plus,
};

interface IconWrapperProps extends ComponentPropsWithoutRef<'svg'> {
  icon: IconName;
}

export default function IconWrapper({ icon, ...props }: IconWrapperProps) {
  const Icon = iconMap[icon];
  if (!Icon) {
    return null;
  }
  return <Icon {...props} />;
}
