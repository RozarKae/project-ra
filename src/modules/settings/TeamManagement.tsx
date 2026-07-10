import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  Activity, 
  Mail, 
  Clock, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  AlertTriangle,
  Lock,
  User,
  Shield
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import StatCard from '../../components/dashboard/StatCard';
import { toast } from 'react-hot-toast';
import { useTeam } from '../../hooks/useTeam';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../lib/auth';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { TeamRole, TeamMember, TeamInvitation } from '../../types/team';

const ROLE_HIERARCHY: Record<TeamRole, number> = {
  owner: 3,
  admin: 2,
  editor: 1,
  viewer: 0
};

export const TeamManagement: React.FC = () => {
  // SaaS Hook integrations
  const { user } = useAuth();
  const { profile: currentUserProfile, loading: profileLoading } = useUserProfile();
  const { 
    members, 
    invitations, 
    loading: teamLoading, 
    inviteMember, 
    changeRole, 
    disableUser, 
    removeUser, 
    revokeInvitation 
  } = useTeam();
  const { logs, addLog } = useActivityLogs();

  // Determine current user's authorization info
  const currentUserRole: TeamRole = (currentUserProfile?.role as TeamRole) || 'owner';
  const isOwner = currentUserRole === 'owner';
  const currentEmail = user?.email || currentUserProfile?.email || 'admin@projectra.com';
  const currentDisplayName = currentUserProfile?.displayName || user?.displayName || 'Owner';

  // Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('editor');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  // View Member Details State
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Change Role State
  const [roleChangeTarget, setRoleChangeTarget] = useState<TeamMember | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<TeamRole>('editor');
  const [isSubmittingRoleChange, setIsSubmittingRoleChange] = useState(false);

  // Helpers to format roles and badges
  const getRoleBadgeStyle = (role: TeamRole) => {
    switch (role) {
      case 'owner':
        return 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/35';
      case 'admin':
        return 'bg-[#0F6D5B]/15 text-[#148C75] border-[#0F6D5B]/30';
      case 'editor':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'viewer':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700/50';
    }
  };

  const getStatusBadgeStyle = (status: 'active' | 'disabled') => {
    return status === 'active' 
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
      : 'bg-rose-500/10 text-rose-400 border-rose-500/25';
  };

  // KPI calculations
  const totalMembers = members.length;
  const ownerCount = members.filter(m => m.role === 'owner').length;
  const adminCount = members.filter(m => m.role === 'admin').length;
  const editorCount = members.filter(m => m.role === 'editor').length;
  const viewerCount = members.filter(m => m.role === 'viewer').length;
  const pendingCount = invitations.filter(i => i.status === 'pending').length;
  const acceptedCount = invitations.filter(i => i.status === 'accepted').length;

  // Actions
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Email address is required');
      return;
    }
    
    // Check if email already exists in members
    if (members.some(m => m.email.toLowerCase() === inviteEmail.trim().toLowerCase())) {
      toast.error('This user is already a member of the team');
      return;
    }

    // Check if email already has a pending invitation
    if (invitations.some(i => i.email.toLowerCase() === inviteEmail.trim().toLowerCase() && i.status === 'pending')) {
      toast.error('There is already a pending invitation for this email');
      return;
    }

    // Role Hierarchy check
    if (ROLE_HIERARCHY[inviteRole] > ROLE_HIERARCHY[currentUserRole]) {
      toast.error('Privilege Escalation Blocked: You cannot assign a role higher than your own.');
      return;
    }

    setIsSubmittingInvite(true);
    try {
      await inviteMember(inviteEmail.trim(), inviteRole, inviteMessage, currentEmail);
      
      // Log operation
      await addLog(
        currentEmail,
        'Invite',
        'invitation',
        inviteEmail,
        `${currentDisplayName} invited ${inviteEmail} as ${inviteRole}`
      );
      
      toast.success('Invitation Created');
      setInviteEmail('');
      setInviteRole('editor');
      setInviteMessage('');
      setIsInviteOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to create invitation');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleRoleChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleChangeTarget) return;

    if (ROLE_HIERARCHY[selectedNewRole] > ROLE_HIERARCHY[currentUserRole]) {
      toast.error('Privilege Escalation Blocked: You cannot assign a role higher than your own.');
      return;
    }

    setIsSubmittingRoleChange(true);
    try {
      await changeRole(roleChangeTarget.userId, selectedNewRole);
      
      // Log operation
      await addLog(
        currentEmail,
        'Role Update',
        'member',
        roleChangeTarget.userId,
        `${currentDisplayName} changed role of ${roleChangeTarget.displayName || roleChangeTarget.email} to ${selectedNewRole}`
      );

      toast.success('Role Updated');
      setRoleChangeTarget(null);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to change role');
    } finally {
      setIsSubmittingRoleChange(false);
    }
  };

  const handleToggleDisable = async (member: TeamMember) => {
    const isSelf = member.userId === user?.uid || member.email === currentEmail;
    if (isSelf) {
      toast.error('You cannot disable your own account');
      return;
    }

    const actionText = member.status === 'active' ? 'disable' : 'enable';
    const confirmed = window.confirm(`Are you sure you want to ${actionText} member ${member.displayName || member.email}?`);
    if (!confirmed) return;

    try {
      await disableUser(member.userId);
      const newStatus = member.status === 'active' ? 'disabled' : 'active';
      
      // Log operation
      await addLog(
        currentEmail,
        'Status Update',
        'member',
        member.userId,
        `${currentDisplayName} ${newStatus === 'disabled' ? 'disabled' : 'enabled'} member ${member.displayName || member.email}`
      );

      toast.success(newStatus === 'disabled' ? 'Member Disabled' : 'Member Enabled');
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to ${actionText} member`);
    }
  };

  const handleRemoveUser = async (member: TeamMember) => {
    const isSelf = member.userId === user?.uid || member.email === currentEmail;
    if (isSelf) {
      toast.error('Owner cannot remove themselves');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to REMOVE member ${member.displayName || member.email} from the workspace? This action is permanent.`);
    if (!confirmed) return;

    try {
      await removeUser(member.userId);
      
      // Log operation
      await addLog(
        currentEmail,
        'Remove',
        'member',
        member.userId,
        `${currentDisplayName} removed member ${member.displayName || member.email}`
      );

      toast.success('Member Removed');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to remove member');
    }
  };

  const handleRevokeInvitation = async (invitation: TeamInvitation) => {
    const confirmed = window.confirm(`Are you sure you want to revoke invitation for ${invitation.email}?`);
    if (!confirmed) return;

    try {
      await revokeInvitation(invitation.id);
      
      // Log operation
      await addLog(
        currentEmail,
        'Revoke Invite',
        'invitation',
        invitation.id,
        `${currentDisplayName} revoked invitation for ${invitation.email}`
      );

      toast.success('Invitation Revoked');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to revoke invitation');
    }
  };

  // Helper relative time formatter
  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDays = Math.floor(diffHr / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Unknown';
    }
  };

  if (profileLoading || teamLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 space-y-3 font-poppins">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Loading Team Workspace settings...</p>
      </div>
    );
  }

  // Filter role matrix fields
  const matrixRows = [
    { feature: 'Dashboard', owner: '✔', admin: '✔', editor: '✔', viewer: '✔' },
    { feature: 'Guest Management', owner: '✔', admin: '✔', editor: '✔', viewer: '👁' },
    { feature: 'Add Guest', owner: '✔', admin: '✔', editor: '✔', viewer: '✖' },
    { feature: 'Edit Guest', owner: '✔', admin: '✔', editor: '✔', viewer: '✖' },
    { feature: 'Delete Guest', owner: '✔', admin: '✔', editor: '✖', viewer: '✖' },
    { feature: 'Workspace Settings', owner: '✔', admin: '✔', editor: '✖', viewer: '✖' },
    { feature: 'Team Management', owner: '✔', admin: '✖', editor: '✖', viewer: '✖' },
    { feature: 'Reports', owner: '✔', admin: '✔', editor: '✔', viewer: '👁' },
    { feature: 'RSVP', owner: '✔', admin: '✔', editor: '✔', viewer: '👁' },
  ];

  return (
    <div className="space-y-8 font-poppins relative">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D4AF37]/10 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-cinzel text-[#F5F5F5] font-bold tracking-wide">
            Team Management
          </h1>
          <p className="text-xs text-[#F5F5F5]/50">
            Invite collaborators, organize operational permissions, and audit recent workspace activity.
          </p>
        </div>
        
        {isOwner && (
          <Button
            onClick={() => setIsInviteOpen(true)}
            variant="primary"
            className="py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>Invite Member</span>
          </Button>
        )}
      </div>

      {/* RBAC Read-Only Banner */}
      {!isOwner && (
        <div className="glass-panel border-amber-500/20 bg-amber-500/5 p-4 rounded-xl flex items-start gap-3">
          <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <div>
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Read-Only Workspace View</h4>
            <p className="text-[10px] text-[#F5F5F5]/70 mt-1">
              Your assigned role is <span className="capitalize font-semibold text-amber-400">{currentUserRole}</span>. 
              Only members with the **Owner** role can invite collaborators, revoke pending invitations, change member roles, or modify account operational statuses.
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Overview KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard title="Total Members" value={totalMembers} description="Total registered" icon={Users} />
        <StatCard title="Owners" value={ownerCount} description="Absolute rights" icon={Shield} iconColorClass="text-[#D4AF37]" />
        <StatCard title="Admins" value={adminCount} description="Operational plan" icon={UserCheck} iconColorClass="text-[#148C75]" />
        <StatCard title="Editors" value={editorCount} description="Roster editors" icon={UserCheck} iconColorClass="text-blue-400" />
        <StatCard title="Viewers" value={viewerCount} description="Read-only" icon={UserCheck} iconColorClass="text-zinc-500" />
        <StatCard title="Pending" value={pendingCount} description="Active invites" icon={Mail} iconColorClass="text-amber-500" />
        <StatCard title="Accepted" value={acceptedCount} description="Joined via invite" icon={Check} iconColorClass="text-emerald-500" />
      </div>

      {/* Section 2: Team Members Table / Cards */}
      <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
        <div className="flex items-center justify-between border-b border-[#D4AF37]/5 pb-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#D4AF37]" />
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Workspace Roster
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 bg-[#141414] border border-[#D4AF37]/5 px-2 py-0.5 rounded-full">
            {members.length} Users
          </span>
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block">
          <Table headers={['Member', 'Email', 'Role', 'Status', 'Joined Date', 'Last Active', 'Actions']}>
            {members.map((member) => {
              const isSelf = member.userId === user?.uid || member.email === currentEmail;
              return (
                <tr key={member.userId} className="hover:bg-[#141414]/30 transition duration-150">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-zinc-800 bg-[#141414] overflow-hidden flex items-center justify-center relative shrink-0">
                      {member.photoURL ? (
                        <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase">
                          {member.displayName?.substring(0, 2) || member.email?.substring(0, 2)}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-zinc-200">
                      {member.displayName} {isSelf && <span className="text-[9px] text-[#D4AF37] border border-[#D4AF37]/20 px-1 py-0.2 rounded ml-1 bg-[#D4AF37]/5">You</span>}
                    </span>
                  </td>
                  <td className="p-4 text-[#F5F5F5]/65 font-mono text-[11px]">{member.email}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getRoleBadgeStyle(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 border rounded-md ${getStatusBadgeStyle(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="p-4 text-[#F5F5F5]/60">
                    {new Date(member.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-4 text-[#F5F5F5]/60 font-mono text-[10px]">{getRelativeTime(member.lastActive)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                        title="View Profile"
                      >
                        <Eye size={14} />
                      </button>
                      
                      {isOwner && !isSelf && (
                        <>
                          <button
                            onClick={() => {
                              setRoleChangeTarget(member);
                              setSelectedNewRole(member.role);
                            }}
                            className="px-2 py-1 text-[10px] border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded transition font-bold"
                            title="Change Role"
                          >
                            Role
                          </button>
                          
                          <button
                            onClick={() => handleToggleDisable(member)}
                            className={`p-1.5 rounded hover:bg-zinc-800 transition ${
                              member.status === 'active' ? 'text-amber-500 hover:text-amber-400' : 'text-emerald-500 hover:text-emerald-400'
                            }`}
                            title={member.status === 'active' ? 'Disable User' : 'Enable User'}
                          >
                            {member.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>

                          <button
                            onClick={() => handleRemoveUser(member)}
                            className="p-1.5 rounded hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 transition"
                            title="Remove User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        </div>

        {/* Mobile Layout (Cards List) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {members.map((member) => {
            const isSelf = member.userId === user?.uid || member.email === currentEmail;
            return (
              <div key={member.userId} className="glass-panel p-4 border border-[#D4AF37]/10 rounded-xl space-y-3.5 relative">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-zinc-800 bg-[#141414] overflow-hidden flex items-center justify-center">
                      {member.photoURL ? (
                        <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-[#D4AF37] uppercase">
                          {member.displayName?.substring(0, 2) || member.email?.substring(0, 2)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-zinc-200">
                      {member.displayName} {isSelf && <span className="text-[8px] text-[#D4AF37] border border-[#D4AF37]/20 px-1 rounded ml-1 bg-[#D4AF37]/5">You</span>}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getRoleBadgeStyle(member.role)}`}>
                    {member.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 font-poppins">
                  <div>
                    <span className="text-zinc-600 block uppercase font-bold text-[8px]">Email</span>
                    <span className="font-mono text-zinc-300 truncate block">{member.email}</span>
                  </div>
                  <div>
                    <span className="text-zinc-600 block uppercase font-bold text-[8px]">Status</span>
                    <span className={`font-semibold ${member.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>{member.status}</span>
                  </div>
                  <div>
                    <span className="text-zinc-600 block uppercase font-bold text-[8px]">Joined</span>
                    <span>{new Date(member.joinedAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-zinc-600 block uppercase font-bold text-[8px]">Last Active</span>
                    <span className="font-mono">{getRelativeTime(member.lastActive)}</span>
                  </div>
                </div>

                {/* Mobile action controls */}
                <div className="pt-2 border-t border-zinc-900/60 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="flex items-center gap-1 py-1 px-2.5 text-[9px] font-bold uppercase tracking-wider rounded border border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                  >
                    <Eye size={10} />
                    <span>Profile</span>
                  </button>

                  {isOwner && !isSelf && (
                    <>
                      <button
                        onClick={() => {
                          setRoleChangeTarget(member);
                          setSelectedNewRole(member.role);
                        }}
                        className="py-1 px-2 text-[9px] border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded font-bold uppercase"
                      >
                        Role
                      </button>

                      <button
                        onClick={() => handleToggleDisable(member)}
                        className={`p-1.5 rounded border border-zinc-800 transition ${
                          member.status === 'active' ? 'text-amber-500' : 'text-emerald-500'
                        }`}
                      >
                        {member.status === 'active' ? <UserX size={11} /> : <UserCheck size={11} />}
                      </button>

                      <button
                        onClick={() => handleRemoveUser(member)}
                        className="p-1.5 rounded border border-zinc-800 text-rose-400 hover:bg-rose-950/20"
                      >
                        <Trash2 size={11} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Section 3: Pending Invitations */}
      <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3">
          <Mail size={16} className="text-[#D4AF37]" />
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
            Pending invitations
          </h3>
        </div>

        {invitations.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs font-poppins">
            No active collaborators invitations recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table headers={['Email', 'Assigned Role', 'Status', 'Created At', 'Expires At', 'Sender', 'Actions']}>
              {invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#141414]/30 transition duration-150">
                  <td className="p-4 font-semibold text-zinc-200">{inv.email}</td>
                  <td className="p-4">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getRoleBadgeStyle(inv.role)}`}>
                      {inv.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      inv.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      inv.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      inv.status === 'expired' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-zinc-800 text-zinc-500 border-zinc-700/50'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-[#F5F5F5]/60 font-mono text-[10px]">{new Date(inv.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-[#F5F5F5]/60 font-mono text-[10px]">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                  <td className="p-4 text-[#F5F5F5]/60 text-[10px] truncate max-w-[120px]">{inv.createdBy}</td>
                  <td className="p-4">
                    {isOwner && inv.status === 'pending' ? (
                      <button
                        onClick={() => handleRevokeInvitation(inv)}
                        className="text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider text-[10px] border border-rose-950/40 px-2 py-1 rounded hover:bg-rose-950/20 transition"
                      >
                        Revoke
                      </button>
                    ) : (
                      <span className="text-zinc-600 select-none text-[9px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </Card>

      {/* Section 4: Role Permissions Matrix */}
      <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3">
          <Shield size={16} className="text-[#D4AF37]" />
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
            Role Permissions Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-poppins">
            <thead>
              <tr className="border-b border-[#D4AF37]/10 bg-[#090909]/40 text-[#D4AF37] uppercase tracking-wider text-[10px] font-semibold">
                <th className="p-4">Feature Domain</th>
                <th className="p-4 text-center">Owner</th>
                <th className="p-4 text-center">Admin</th>
                <th className="p-4 text-center">Editor</th>
                <th className="p-4 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/5 text-[#F5F5F5]/85">
              {matrixRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#141414]/20 transition duration-150">
                  <td className="p-4 font-semibold text-zinc-300">{row.feature}</td>
                  <td className="p-4 text-center">
                    {row.owner === '✔' ? <Check className="text-emerald-500 mx-auto" size={16} /> : <X className="text-rose-500/40 mx-auto" size={16} />}
                  </td>
                  <td className="p-4 text-center">
                    {row.admin === '✔' ? <Check className="text-emerald-500 mx-auto" size={16} /> : <X className="text-rose-500/40 mx-auto" size={16} />}
                  </td>
                  <td className="p-4 text-center">
                    {row.editor === '✔' ? <Check className="text-emerald-500 mx-auto" size={16} /> : <X className="text-rose-500/40 mx-auto" size={16} />}
                  </td>
                  <td className="p-4 text-center">
                    {row.viewer === '✔' ? (
                      <Check className="text-emerald-500 mx-auto" size={16} />
                    ) : row.viewer === '👁' ? (
                      <Eye className="text-amber-500 mx-auto" size={16} />
                    ) : (
                      <X className="text-rose-500/40 mx-auto" size={16} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 5: Team Activity Log */}
      <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3">
          <Activity size={16} className="text-[#D4AF37]" />
          <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
            Workspace Operations Audits
          </h3>
        </div>

        <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-2">
          {logs.slice(0, 20).map((log) => (
            <div key={log.id} className="flex items-start justify-between gap-3 text-xs border-b border-zinc-900/60 pb-2.5 last:border-0 last:pb-0">
              <div className="space-y-1">
                <p className="text-zinc-200 leading-normal">{log.details}</p>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                  <span className="font-mono">{log.user}</span>
                  <span>•</span>
                  <span className="capitalize text-zinc-600 bg-zinc-900 border border-zinc-800 px-1.5 py-0.1 rounded">{log.action}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono whitespace-nowrap">
                <Clock size={11} className="text-[#D4AF37]/60" />
                <span>{getRelativeTime(log.timestamp)}</span>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-6 text-zinc-500 text-xs font-poppins">
              No recent workspace activity records.
            </div>
          )}
        </div>
      </Card>

      {/* Modal Section: Invite Member */}
      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Workspace Collaborator">
        <form onSubmit={handleInviteSubmit} className="space-y-4 font-poppins">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. planner@nikahsandweddings.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Assign Workspace Role *</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as TeamRole)}
              className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins capitalize"
            >
              {/* Only show roles <= current user's role */}
              {(['owner', 'admin', 'editor', 'viewer'] as TeamRole[])
                .filter(r => ROLE_HIERARCHY[r] <= ROLE_HIERARCHY[currentUserRole])
                .map((roleOpt) => (
                  <option key={roleOpt} value={roleOpt}>
                    {roleOpt}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Message (Optional)</label>
            <textarea
              placeholder="Include an optional invite greeting or instructions..."
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={3}
              className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition font-poppins"
            />
          </div>

          {/* Email dispatch architecture simulation note */}
          <div className="bg-[#148C75]/5 border border-[#0F6D5B]/25 p-3 rounded-lg text-[9px] text-zinc-400">
            <strong>Note on delivery:</strong> This invitation will generate a secure validation token. Email routing architecture is queued; active SMTP delivery is bypassed in Sprint S.3.
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#D4AF37]/10">
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs transition uppercase font-bold"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingInvite}
              className="py-2 px-5 text-xs font-bold uppercase tracking-wider"
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Section: View Member Profile */}
      <Modal isOpen={selectedMember !== null} onClose={() => setSelectedMember(null)} title="Member Profile Detail">
        {selectedMember && (
          <div className="space-y-4 font-poppins text-xs text-[#F5F5F5]/85">
            <div className="flex items-center gap-4 border-b border-[#D4AF37]/10 pb-4">
              <div className="w-14 h-14 rounded-full border border-zinc-800 bg-[#141414] overflow-hidden flex items-center justify-center">
                {selectedMember.photoURL ? (
                  <img src={selectedMember.photoURL} alt={selectedMember.displayName} className="w-full h-full object-cover" />
                ) : (
                  <User className="text-zinc-600 animate-fade" size={20} />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-100">{selectedMember.displayName}</h4>
                <p className="font-mono text-[10px] text-zinc-500">{selectedMember.email}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between py-1 border-b border-[#D4AF37]/5">
                <span className="text-zinc-500 font-semibold uppercase text-[9px]">User ID</span>
                <span className="font-mono text-zinc-400 select-all">{selectedMember.userId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D4AF37]/5">
                <span className="text-zinc-500 font-semibold uppercase text-[9px]">Assigned Role</span>
                <span className={`text-[10px] font-bold uppercase ${getRoleBadgeStyle(selectedMember.role).split(' ')[1]}`}>
                  {selectedMember.role}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D4AF37]/5">
                <span className="text-zinc-500 font-semibold uppercase text-[9px]">Account Status</span>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${getStatusBadgeStyle(selectedMember.status)}`}>
                  {selectedMember.status}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D4AF37]/5">
                <span className="text-zinc-500 font-semibold uppercase text-[9px]">Joined Date</span>
                <span className="text-zinc-400 font-mono">{new Date(selectedMember.joinedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500 font-semibold uppercase text-[9px]">Last Online Session</span>
                <span className="text-zinc-400 font-mono">{new Date(selectedMember.lastActive).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#D4AF37]/10">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 border border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-xl text-xs transition uppercase font-bold"
              >
                Close View
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Section: Change Role */}
      <Modal isOpen={roleChangeTarget !== null} onClose={() => setRoleChangeTarget(null)} title="Update Member Role Assignment">
        {roleChangeTarget && (
          <form onSubmit={handleRoleChangeSubmit} className="space-y-4 font-poppins">
            <div className="bg-[#141414] p-3 rounded-lg border border-[#D4AF37]/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900 overflow-hidden flex items-center justify-center">
                {roleChangeTarget.photoURL ? (
                  <img src={roleChangeTarget.photoURL} alt={roleChangeTarget.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase">
                    {roleChangeTarget.displayName?.substring(0, 2) || roleChangeTarget.email?.substring(0, 2)}
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-200 block">{roleChangeTarget.displayName}</span>
                <span className="text-[10px] text-zinc-500 font-mono block">{roleChangeTarget.email}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Select New Workspace Role *</label>
              <select
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value as TeamRole)}
                className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins capitalize"
              >
                {/* Only show roles <= current user's role */}
                {(['owner', 'admin', 'editor', 'viewer'] as TeamRole[])
                  .filter(r => ROLE_HIERARCHY[r] <= ROLE_HIERARCHY[currentUserRole])
                  .map((roleOpt) => (
                    <option key={roleOpt} value={roleOpt}>
                      {roleOpt}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#D4AF37]/10">
              <button
                type="button"
                onClick={() => setRoleChangeTarget(null)}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs transition uppercase font-bold"
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmittingRoleChange}
                className="py-2 px-5 text-xs font-bold uppercase tracking-wider"
              >
                Save Role Assignment
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default TeamManagement;
