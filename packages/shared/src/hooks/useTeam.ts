import { useEffect, useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { TeamRepository } from '../repositories/TeamRepository';
import { TeamMember, TeamInvitation, TeamRole } from '@project-ra/types';

const teamRepo = new TeamRepository();

export const useTeam = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubMembers = teamRepo.subscribeMembers(currentWorkspaceId, (list) => {
      setMembers(list);
      setLoading(false);
    });

    const unsubInvitations = teamRepo.subscribeInvitations(currentWorkspaceId, (list) => {
      setInvitations(list);
    });

    return () => {
      unsubMembers();
      unsubInvitations();
    };
  }, [currentWorkspaceId]);

  const inviteMember = async (email: string, role: TeamRole, message?: string, createdBy?: string) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const invitation: TeamInvitation = {
      id: `inv-${Date.now()}`,
      email,
      role,
      token: `token_${Math.random().toString(36).substring(2, 11)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      createdBy: createdBy || 'unknown',
      message
    };
    await teamRepo.saveInvitation(currentWorkspaceId, invitation);
  };

  const changeRole = async (userId: string, newRole: TeamRole) => {
    const member = members.find(m => m.userId === userId);
    if (member) {
      await teamRepo.saveMember(currentWorkspaceId, {
        ...member,
        role: newRole
      });
    }
  };

  const disableUser = async (userId: string) => {
    const member = members.find(m => m.userId === userId);
    if (member) {
      const newStatus = member.status === 'active' ? 'disabled' : 'active';
      await teamRepo.saveMember(currentWorkspaceId, {
        ...member,
        status: newStatus
      });
    }
  };

  const removeUser = async (userId: string) => {
    await teamRepo.removeMember(currentWorkspaceId, userId);
  };

  const revokeInvitation = async (id: string) => {
    const invitation = invitations.find(i => i.id === id);
    if (invitation) {
      await teamRepo.saveInvitation(currentWorkspaceId, {
        ...invitation,
        status: 'revoked'
      });
    }
  };

  return {
    members,
    invitations,
    loading,
    inviteMember,
    changeRole,
    disableUser,
    removeUser,
    revokeInvitation
  };
};

export default useTeam;
