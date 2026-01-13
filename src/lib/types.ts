export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'leader' | 'member';
  joined_at: string;
}

export interface LearningLog {
  id: string;
  team_id: string;
  created_by: string;
  title: string;
  description?: string;
  what_learned: string[];
  improvements?: string[];
  next_steps?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  team_id: string;
  title: string;
  summary?: string;
  content?: string;
  public_url?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CuratedLink {
  id: string;
  team_id: string;
  created_by: string;
  title: string;
  url: string;
  type: 'article' | 'video' | 'tutorial';
  notes?: string;
  tags?: string[];
  created_at: string;
}

