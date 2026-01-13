'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TeamMembersPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [isLeader, setIsLeader] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/teams/${teamId}`);
        if (!response.ok) {
          router.push('/dashboard');
          return;
        }
        const data = await response.json();
        setTeam(data.team);
        setMembers(data.members || []);

        // 현재 사용자가 리더인지 확인
        const currentUserResponse = await fetch('/api/auth/me');
        if (currentUserResponse.ok) {
          const currentUser = await currentUserResponse.json();
          const currentMember = data.members.find(
            (m: any) => m.user_id === currentUser.id
          );
          setIsLeader(
            currentMember?.role === 'leader' || data.team.created_by === currentUser.id
          );
        }
      } catch (err) {
        console.error('Error fetching team data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [teamId, router]);

  const handleGenerateInvite = async () => {
    setIsGeneratingInvite(true);
    try {
      const response = await fetch(`/api/teams/${teamId}/invite`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || '초대 링크 생성에 실패했습니다');
        return;
      }

      setInviteLink(result.inviteLink);
    } catch (err) {
      alert('네트워크 오류가 발생했습니다');
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert('초대 링크가 복사되었습니다');
    }
  };

  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (!confirm('정말로 이 팀원을 제거하시겠습니까?')) {
      return;
    }

    try {
      // TODO: API 엔드포인트 구현 필요
      const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('팀원 제거에 실패했습니다');
        return;
      }

      // 목록 새로고침
      const dataResponse = await fetch(`/api/teams/${teamId}`);
      if (dataResponse.ok) {
        const data = await dataResponse.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      alert('네트워크 오류가 발생했습니다');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">팀원 관리</h1>

          {isLeader && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">팀원 초대</h2>
              {inviteLink ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                    <button
                      onClick={handleCopyInviteLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      복사
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    이 링크를 팀원에게 공유하세요. 링크는 7일간 유효합니다.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleGenerateInvite}
                  disabled={isGeneratingInvite}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isGeneratingInvite ? '생성 중...' : '초대 링크 생성'}
                </button>
              )}
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">팀원 목록</h2>
            <div className="space-y-3">
              {members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.users?.name || '알 수 없음'}
                    </p>
                    <p className="text-sm text-gray-500">{member.users?.email}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {member.role === 'leader' ? '리더' : '멤버'}
                    </span>
                    {isLeader && member.role !== 'leader' && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.user_id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                      >
                        제거
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

