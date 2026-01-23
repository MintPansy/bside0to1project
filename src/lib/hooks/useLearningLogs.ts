'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface LearningLog {
  id: string;
  user_id: string;
  content: string;
  log_date: string;
  created_at: string;
  updated_at: string;
}

interface UseLearningLogsOptions {
  userId?: string;
  date?: string; // YYYY-MM-DD 형식
  enabled?: boolean;
}

export function useLearningLogs(options: UseLearningLogsOptions = {}) {
  const { userId, date, enabled = true } = options;
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    let query = supabase
      .from('learning_logs')
      .select('*')
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (date) {
      query = query.eq('log_date', date);
    }

    // 초기 데이터 로드
    query.then(({ data, error: fetchError }) => {
      if (fetchError) {
        setError(fetchError as any);
        setIsLoading(false);
        return;
      }
      setLogs(data || []);
      setIsLoading(false);
    });

    // 실시간 구독 설정
    const realtimeChannel = supabase
      .channel('learning_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'learning_logs',
          filter: userId ? `user_id=eq.${userId}` : undefined,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLogs((prev) => [payload.new as LearningLog, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setLogs((prev) =>
              prev.map((log) =>
                log.id === payload.new.id ? (payload.new as LearningLog) : log
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setLogs((prev) => prev.filter((log) => log.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    // 정리 함수
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [userId, date, enabled]);

  const createLog = async (data: { content: string; log_date?: string }) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('인증이 필요합니다');
    }

    const { data: log, error: insertError } = await supabase
      .from('learning_logs')
      .insert({
        user_id: user.id,
        content: data.content,
        log_date: data.log_date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return log;
  };

  const updateLog = async (id: string, data: { content: string; log_date?: string }) => {
    const supabase = createClient();
    const { data: log, error: updateError } = await supabase
      .from('learning_logs')
      .update({
        content: data.content,
        log_date: data.log_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return log;
  };

  const deleteLog = async (id: string) => {
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from('learning_logs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }
  };

  return {
    logs,
    isLoading,
    error,
    createLog,
    updateLog,
    deleteLog,
  };
}

