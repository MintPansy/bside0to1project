'use client';

import { LucideIcon } from 'lucide-react';
import { ComponentPropsWithoutRef } from 'react';

interface IconWrapperProps extends ComponentPropsWithoutRef<'svg'> {
  icon: LucideIcon;
}

export default function IconWrapper({ icon: Icon, ...props }: IconWrapperProps) {
  return <Icon {...props} />;
}
