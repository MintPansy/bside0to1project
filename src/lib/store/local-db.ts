/**
 * 로컬 메모리 데이터베이스 (SKIP_AUTH 모드용)
 * - Supabase 없이 로컬에서 테스트 가능
 * - 서버 재시작 시 데이터 초기화됨
 */

import { DEMO_USER } from '@/lib/auth/demo'

// 타입 정의
export type Team = {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_by: string
  created_at: string
  updated_at: string
  invite_code: string
}

export type TeamMember = {
  id: string
  team_id: string
  user_id: string
  role: 'leader' | 'member'
  joined_at: string
}

export type LearningLog = {
  id: string
  team_id: string
  created_by: string
  title: string
  description: string | null
  what_learned: string[]
  improvements: string[] | null
  next_steps: string[] | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export type Portfolio = {
  id: string
  team_id: string
  title: string
  summary: string | null
  content: string | null
  public_url: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export type User = {
  id: string
  email: string
  name: string
  avatar_url: string | null
  created_at: string
}

// 메모리 스토어
class LocalDatabase {
  teams: Map<string, Team> = new Map()
  teamMembers: Map<string, TeamMember> = new Map()
  learningLogs: Map<string, LearningLog> = new Map()
  portfolios: Map<string, Portfolio> = new Map()
  users: Map<string, User> = new Map()

  constructor() {
    // 데모 사용자 초기화
    this.users.set(DEMO_USER.id, {
      id: DEMO_USER.id,
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      avatar_url: null,
      created_at: new Date().toISOString(),
    })

    // 샘플 팀 초기화
    const sampleTeamId = 'demo-team-001'
    this.teams.set(sampleTeamId, {
      id: sampleTeamId,
      name: '샘플 프로젝트 팀',
      description: 'SKIP_AUTH 모드 테스트용 샘플 팀입니다.',
      owner_id: DEMO_USER.id,
      created_by: DEMO_USER.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      invite_code: 'DEMO123',
    })

    this.teamMembers.set('demo-member-001', {
      id: 'demo-member-001',
      team_id: sampleTeamId,
      user_id: DEMO_USER.id,
      role: 'leader',
      joined_at: new Date().toISOString(),
    })

    // 샘플 학습 로그
    this.learningLogs.set('demo-log-001', {
      id: 'demo-log-001',
      team_id: sampleTeamId,
      created_by: DEMO_USER.id,
      title: '첫 번째 학습 로그',
      description: '프로젝트 시작하며 배운 점들',
      what_learned: ['Next.js 14 App Router 학습', 'Supabase 연동 방법 익힘'],
      improvements: ['코드 리뷰 프로세스 개선 필요'],
      next_steps: ['테스트 코드 작성하기'],
      tags: ['Next.js', 'Supabase'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  // UUID 생성
  generateId(): string {
    return 'local-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
  }

  // 초대 코드 생성
  generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }
}

// 싱글톤 인스턴스
export const localDb = new LocalDatabase()

// 헬퍼 함수들
export function getTeamsByUserId(userId: string): Team[] {
  const memberTeamIds = Array.from(localDb.teamMembers.values())
    .filter(m => m.user_id === userId)
    .map(m => m.team_id)

  return Array.from(localDb.teams.values())
    .filter(t => memberTeamIds.includes(t.id) || t.owner_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getTeamById(teamId: string): Team | null {
  return localDb.teams.get(teamId) || null
}

export function createTeam(data: { name: string; description?: string; userId: string }): Team {
  const id = localDb.generateId()
  const now = new Date().toISOString()

  const team: Team = {
    id,
    name: data.name,
    description: data.description || null,
    owner_id: data.userId,
    created_by: data.userId,
    created_at: now,
    updated_at: now,
    invite_code: localDb.generateInviteCode(),
  }

  localDb.teams.set(id, team)

  // 리더로 멤버 추가
  const memberId = localDb.generateId()
  localDb.teamMembers.set(memberId, {
    id: memberId,
    team_id: id,
    user_id: data.userId,
    role: 'leader',
    joined_at: now,
  })

  return team
}

export function getTeamMembers(teamId: string): (TeamMember & { user?: User })[] {
  return Array.from(localDb.teamMembers.values())
    .filter(m => m.team_id === teamId)
    .map(m => ({
      ...m,
      user: localDb.users.get(m.user_id),
    }))
}

export function getLearningLogsByTeamId(teamId: string): (LearningLog & { user?: User })[] {
  return Array.from(localDb.learningLogs.values())
    .filter(l => l.team_id === teamId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(l => ({
      ...l,
      user: localDb.users.get(l.created_by),
    }))
}

export function createLearningLog(data: {
  teamId: string
  userId: string
  title: string
  description?: string
  what_learned: string[]
  improvements?: string[]
  next_steps?: string[]
  tags?: string[]
}): LearningLog {
  const id = localDb.generateId()
  const now = new Date().toISOString()

  const log: LearningLog = {
    id,
    team_id: data.teamId,
    created_by: data.userId,
    title: data.title,
    description: data.description || null,
    what_learned: data.what_learned,
    improvements: data.improvements || null,
    next_steps: data.next_steps || null,
    tags: data.tags || null,
    created_at: now,
    updated_at: now,
  }

  localDb.learningLogs.set(id, log)
  return log
}

export function getLearningLogById(logId: string): LearningLog | null {
  return localDb.learningLogs.get(logId) || null
}

export function updateLearningLog(logId: string, data: Partial<LearningLog>): LearningLog | null {
  const log = localDb.learningLogs.get(logId)
  if (!log) return null

  const updated = {
    ...log,
    ...data,
    updated_at: new Date().toISOString(),
  }
  localDb.learningLogs.set(logId, updated)
  return updated
}

export function deleteLearningLog(logId: string): boolean {
  return localDb.learningLogs.delete(logId)
}

export function getPortfoliosByTeamId(teamId: string): Portfolio[] {
  return Array.from(localDb.portfolios.values())
    .filter(p => p.team_id === teamId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function createPortfolio(data: {
  teamId: string
  title: string
  summary?: string
  content?: string
  is_public?: boolean
}): Portfolio {
  const id = localDb.generateId()
  const now = new Date().toISOString()

  const portfolio: Portfolio = {
    id,
    team_id: data.teamId,
    title: data.title,
    summary: data.summary || null,
    content: data.content || null,
    public_url: data.is_public ? `http://localhost:3000/portfolio/${id}` : null,
    is_public: data.is_public || false,
    created_at: now,
    updated_at: now,
  }

  localDb.portfolios.set(id, portfolio)
  return portfolio
}

export function getPortfolioById(portfolioId: string): Portfolio | null {
  return localDb.portfolios.get(portfolioId) || null
}

export function updatePortfolio(portfolioId: string, data: Partial<Portfolio>): Portfolio | null {
  const portfolio = localDb.portfolios.get(portfolioId)
  if (!portfolio) return null

  const updated = {
    ...portfolio,
    ...data,
    updated_at: new Date().toISOString(),
  }
  localDb.portfolios.set(portfolioId, updated)
  return updated
}

export function deletePortfolio(portfolioId: string): boolean {
  return localDb.portfolios.delete(portfolioId)
}
