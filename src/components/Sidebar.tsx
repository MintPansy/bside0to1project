'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  teamId?: string;
}

export default function Sidebar({ teamId }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = teamId
    ? [
        { href: `/teams/${teamId}`, label: '개요' },
        { href: `/teams/${teamId}/logs`, label: '학습 로그' },
        { href: `/teams/${teamId}/portfolio`, label: '포트폴리오' },
        { href: `/teams/${teamId}/settings`, label: '설정' },
      ]
    : [
        { href: '/dashboard', label: '대시보드' },
      ];

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-2 rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

