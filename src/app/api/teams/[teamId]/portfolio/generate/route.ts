import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// 자동 요약 생성 함수
function generateSummary(logs: any[], team: any): string {
  const allLearned: string[] = [];
  
  logs.forEach((log) => {
    if (log.what_learned && Array.isArray(log.what_learned)) {
      allLearned.push(...log.what_learned);
    }
  });

  // 중복 제거 및 정리
  const uniqueLearned = Array.from(new Set(allLearned.map((item) => item.trim())));
  
  // 가장 의미 있는 것 5개 선택
  const topLearned = uniqueLearned.slice(0, 5);
  
  if (topLearned.length === 0) {
    return `${team.name} 팀의 학습 여정을 기록했습니다.`;
  }

  return `우리 팀은 ${topLearned.join(', ')}을(를) 학습했습니다. 특히 프로젝트를 통해 실전 경험을 쌓았고, 앞으로 더 견고한 개발을 할 것입니다.`;
}

// 태그 집계 함수
function aggregateTags(logs: any[]): string[] {
  const tagCount: Record<string, number> = {};
  
  logs.forEach((log) => {
    if (log.tags && Array.isArray(log.tags)) {
      log.tags.forEach((tag: string) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    }
  });

  // 빈도순으로 정렬하고 상위 5개 반환
  return Object.entries(tagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);
}

// 마크다운 포트폴리오 생성 함수
function generatePortfolioMarkdown(
  team: any,
  logs: any[],
  members: any[]
): string {
  const tags = aggregateTags(logs);
  const startDate = logs.length > 0 
    ? new Date(Math.min(...logs.map((log) => new Date(log.created_at).getTime())))
    : new Date();
  const endDate = logs.length > 0
    ? new Date(Math.max(...logs.map((log) => new Date(log.created_at).getTime())))
    : new Date();

  let markdown = `# ${team.name} 포트폴리오\n\n`;
  
  markdown += `## 팀 소개\n\n`;
  if (team.description) {
    markdown += `${team.description}\n\n`;
  }
  markdown += `- 팀원 수: ${members.length}명\n`;
  markdown += `- 활동 기간: ${startDate.toLocaleDateString('ko-KR')} ~ ${endDate.toLocaleDateString('ko-KR')}\n`;
  markdown += `- 총 학습 로그: ${logs.length}개\n\n`;

  if (tags.length > 0) {
    markdown += `## 📊 배운 점 요약\n\n`;
    markdown += `${tags.map((tag) => `#${tag}`).join(' ')}\n\n`;
  }

  markdown += `## 주요 학습 로그\n\n`;
  
  logs.forEach((log, index) => {
    markdown += `### ${index + 1}. ${log.title}\n\n`;
    markdown += `**작성자**: ${log.users?.name || '알 수 없음'} | **작성일**: ${new Date(log.created_at).toLocaleDateString('ko-KR')}\n\n`;

    if (log.description) {
      markdown += `${log.description}\n\n`;
    }

    if (log.what_learned && log.what_learned.length > 0) {
      markdown += `**배운 점:**\n`;
      log.what_learned.forEach((item: string) => {
        markdown += `- ${item}\n`;
      });
      markdown += `\n`;
    }

    if (log.improvements && log.improvements.length > 0) {
      markdown += `**개선점:**\n`;
      log.improvements.forEach((item: string) => {
        markdown += `- ${item}\n`;
      });
      markdown += `\n`;
    }

    if (log.next_steps && log.next_steps.length > 0) {
      markdown += `**다음 스텝:**\n`;
      log.next_steps.forEach((item: string) => {
        markdown += `- ${item}\n`;
      });
      markdown += `\n`;
    }

    markdown += `***\n\n`;
  });

  if (tags.length > 0) {
    markdown += `## 기술 스택\n\n`;
    markdown += `${tags.map((tag) => `- ${tag}`).join('\n')}\n\n`;
  }

  const summary = generateSummary(logs, team);
  markdown += `## 최종 후기\n\n${summary}\n`;

  return markdown;
}

// POST /api/teams/[teamId]/portfolio/generate - 포트폴리오 생성
export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient();
    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { teamId } = params;

    // 사용자가 팀 멤버인지 확인
    const { data: member } = await supabase
      .schema('public')
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', session.user.id)
      .single();

    const { data: team } = await supabase
      .schema('public')
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (!member && team?.created_by !== session.user.id) {
      return NextResponse.json(
        { error: '팀 멤버만 포트폴리오를 생성할 수 있습니다' },
        { status: 403 }
      );
    }

    if (!team) {
      return NextResponse.json(
        { error: '팀을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 모든 학습 로그 조회
    const { data: logs } = await supabase
      .schema('public')
      .from('learning_logs')
      .select(`
        *,
        users:created_by (
          id,
          name,
          email
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: true });

    // 팀원 목록 조회
    const { data: members } = await supabase
      .schema('public')
      .from('team_members')
      .select('*')
      .eq('team_id', teamId);

    // 마크다운 포트폴리오 생성
    const content = generatePortfolioMarkdown(team, logs || [], members || []);
    const summary = generateSummary(logs || [], team);

    // 포트폴리오 저장
    const portfolioTitle = `${team.name} 포트폴리오`;

    const { data: portfolio, error } = await supabase
      .schema('public')
      .from('portfolios')
      .insert({
        team_id: teamId,
        title: portfolioTitle,
        summary: summary,
        content: content,
        is_public: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // public_url 업데이트 (실제 ID 사용)
    const finalPublicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portfolio/${portfolio.id}`;
    await supabase
      .schema('public')
      .from('portfolios')
      .update({ public_url: finalPublicUrl })
      .eq('id', portfolio.id);

    return NextResponse.json({
      ...portfolio,
      public_url: finalPublicUrl,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

