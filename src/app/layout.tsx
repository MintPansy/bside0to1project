import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnTeam - 팀 프로젝트 성장 포트폴리오",
  description: "팀 프로젝트에서 배운 점들을 자동으로 정리하고 포트폴리오로 변환하는 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}

