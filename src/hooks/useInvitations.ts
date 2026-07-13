import { useEffect, useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { InvitationRepository } from '../repositories/InvitationRepository';
import { GuestRepository } from '../repositories/GuestRepository';
import { RsvpRepository } from '../repositories/RsvpRepository';
import { ActivityRepository } from '../repositories/ActivityRepository';
import { Invitation, InvitationStatus, DeliveryStatus, InvitationType } from '../types/invitation';
import { Guest } from '../types/guest';
import { RsvpEntry } from '../repositories/RsvpRepository';

const invitationRepo = new InvitationRepository();
const guestRepo = new GuestRepository();
const rsvpRepo = new RsvpRepository();
const activityRepo = new ActivityRepository();

export const useInvitations = () => {
  const { currentWorkspaceId, currentWeddingId } = useWorkspace();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    
    // Subscribe to invitations
    const unsubInvitations = invitationRepo.subscribeInvitations(
      currentWorkspaceId,
      currentWeddingId,
      (loadedInvites) => {
        setInvitations(loadedInvites);
      }
    );

    // Subscribe to guests
    const unsubGuests = guestRepo.subscribeGuests(
      currentWorkspaceId,
      currentWeddingId,
      (loadedGuests) => {
        setGuests(loadedGuests);
      }
    );

    // Subscribe to RSVPs
    const unsubRsvps = rsvpRepo.subscribeRsvps(
      currentWorkspaceId,
      currentWeddingId,
      (loadedRsvps) => {
        setRsvps(loadedRsvps);
        setLoading(false);
      }
    );

    return () => {
      unsubInvitations();
      unsubGuests();
      unsubRsvps();
    };
  }, [currentWorkspaceId, currentWeddingId]);

  // Save single invitation
  const saveInvitation = async (invitation: Invitation, operator: string) => {
    const isNew = !invitations.some(i => i.id === invitation.id);
    
    await invitationRepo.saveInvitation(currentWorkspaceId, currentWeddingId, invitation);
    
    // Log to unified activity feed
    await activityRepo.addGuestTimelineLog(
      currentWorkspaceId,
      currentWeddingId,
      invitation.guestId,
      isNew ? 'Invitation Generated' : 'Invitation Updated',
      isNew ? 'Invitation Generated' : 'Invitation Updated',
      `Invitation ${invitation.id} has been ${isNew ? 'generated' : 'updated'} by ${operator}. Status: ${invitation.status}`,
      '',
      invitation.status,
      operator,
      'invitation'
    );
  };

  // Delete single invitation
  const deleteInvitation = async (id: string, operator: string) => {
    const target = invitations.find(i => i.id === id);
    if (!target) return;

    await invitationRepo.deleteInvitation(currentWorkspaceId, currentWeddingId, id);

    // Log to activity feed
    await activityRepo.addGuestTimelineLog(
      currentWorkspaceId,
      currentWeddingId,
      target.guestId,
      'Invitation Deleted',
      'Invitation Deleted',
      `Invitation ${id} has been deleted by ${operator}`,
      target.status,
      'deleted',
      operator,
      'invitation'
    );
  };

  // Bulk Generate
  const bulkGenerate = async (operator: string) => {
    const newInvites: Invitation[] = [];
    const nowStr = new Date().toISOString();

    for (const guest of guests) {
      // Check if guest already has an invitation
      const hasInvite = invitations.some(i => i.guestId === guest.id);
      if (hasInvite) continue;

      const inviteId = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const newInvite: Invitation = {
        id: inviteId,
        guestId: guest.id,
        guestName: guest.name,
        familyName: guest.familyName || 'None',
        guestCategory: guest.relation || 'General',
        invitationType: (guest.invitationType as InvitationType) || 'digital',
        status: 'draft',
        deliveryStatus: 'not-sent',
        qrCode: {
          code: `QR-${guest.id}`,
          scanCount: 0,
          encryptedLink: `https://batpaiyancatponnu.online/#/invitation?id=${guest.id}`
        },
        rsvpStatus: guest.rsvpStatus === 'attending' ? 'accepted' : (guest.rsvpStatus || 'pending'),
        attendanceCount: guest.membersCount || 1,
        createdAt: nowStr,
        history: [
          {
            event: 'Invitation Draft Created',
            timestamp: nowStr,
            operator
          }
        ]
      };
      newInvites.push(newInvite);
    }

    if (newInvites.length > 0) {
      await invitationRepo.saveInvitationsBulk(currentWorkspaceId, currentWeddingId, newInvites);
      
      // Log for each generated invitation
      for (const invite of newInvites) {
        await activityRepo.addGuestTimelineLog(
          currentWorkspaceId,
          currentWeddingId,
          invite.guestId,
          'Invitation Generated',
          'Invitation Generated',
          `Invitation ${invite.id} bulk generated by ${operator}`,
          '',
          'draft',
          operator,
          'invitation'
        );
      }
    }
  };

  // Bulk Delete
  const bulkDelete = async (ids: string[], operator: string) => {
    const targets = invitations.filter(i => ids.includes(i.id));
    await invitationRepo.deleteInvitationsBulk(currentWorkspaceId, currentWeddingId, ids);

    for (const target of targets) {
      await activityRepo.addGuestTimelineLog(
        currentWorkspaceId,
        currentWeddingId,
        target.guestId,
        'Invitation Deleted',
        'Invitation Deleted',
        `Invitation ${target.id} bulk deleted by ${operator}`,
        target.status,
        'deleted',
        operator,
        'invitation'
      );
    }
  };

  // Bulk Update Delivery Status
  const bulkUpdateDelivery = async (ids: string[], deliveryStatus: DeliveryStatus, operator: string) => {
    const updatedInvites: Invitation[] = [];
    const nowStr = new Date().toISOString();

    for (const id of ids) {
      const invite = invitations.find(i => i.id === id);
      if (!invite) continue;

      const historyUpdate = {
        event: `Delivery Status Updated to ${deliveryStatus}`,
        timestamp: nowStr,
        operator
      };

      const updatedInvite: Invitation = {
        ...invite,
        deliveryStatus,
        sentAt: deliveryStatus !== 'not-sent' ? nowStr : invite.sentAt,
        status: (deliveryStatus !== 'not-sent' && invite.status === 'draft') ? 'sent' : invite.status,
        history: [...invite.history, historyUpdate]
      };
      
      updatedInvites.push(updatedInvite);
    }

    if (updatedInvites.length > 0) {
      await invitationRepo.saveInvitationsBulk(currentWorkspaceId, currentWeddingId, updatedInvites);

      for (const invite of updatedInvites) {
        await activityRepo.addGuestTimelineLog(
          currentWorkspaceId,
          currentWeddingId,
          invite.guestId,
          'Invitation Sent',
          'Invitation Delivery Sync',
          `Invitation delivery status set to ${deliveryStatus} by ${operator}`,
          invite.deliveryStatus,
          deliveryStatus,
          operator,
          'invitation'
        );
      }
    }
  };

  // Bulk Update Invitation Status
  const bulkUpdateStatus = async (ids: string[], status: InvitationStatus, operator: string) => {
    const updatedInvites: Invitation[] = [];
    const nowStr = new Date().toISOString();

    for (const id of ids) {
      const invite = invitations.find(i => i.id === id);
      if (!invite) continue;

      const historyUpdate = {
        event: `Status Updated to ${status}`,
        timestamp: nowStr,
        operator
      };

      const updatedInvite: Invitation = {
        ...invite,
        status,
        viewedAt: status === 'viewed' ? nowStr : invite.viewedAt,
        respondedAt: (status === 'accepted' || status === 'declined') ? nowStr : invite.respondedAt,
        history: [...invite.history, historyUpdate]
      };
      
      updatedInvites.push(updatedInvite);
    }

    if (updatedInvites.length > 0) {
      await invitationRepo.saveInvitationsBulk(currentWorkspaceId, currentWeddingId, updatedInvites);

      for (const invite of updatedInvites) {
        await activityRepo.addGuestTimelineLog(
          currentWorkspaceId,
          currentWeddingId,
          invite.guestId,
          status === 'viewed' ? 'Invitation Viewed' : status === 'accepted' ? 'RSVP Submitted' : 'Invitation Updated',
          'Invitation Status Sync',
          `Invitation status set to ${status} by ${operator}`,
          invite.status,
          status,
          operator,
          'invitation'
        );
      }
    }
  };

  // Record QR Scan
  const recordQrScan = async (id: string, operator: string = 'System Scan') => {
    const invite = invitations.find(i => i.id === id);
    if (!invite) return;

    const nowStr = new Date().toISOString();
    const historyUpdate = {
      event: `QR Scanned (Scan #${invite.qrCode.scanCount + 1})`,
      timestamp: nowStr,
      operator
    };

    const updatedInvite: Invitation = {
      ...invite,
      status: invite.status === 'sent' || invite.status === 'generated' || invite.status === 'draft' ? 'viewed' : invite.status,
      qrCode: {
        ...invite.qrCode,
        scanCount: invite.qrCode.scanCount + 1,
        lastScan: nowStr
      },
      history: [...invite.history, historyUpdate]
    };

    await invitationRepo.saveInvitation(currentWorkspaceId, currentWeddingId, updatedInvite);

    // Log to activity log
    await activityRepo.addGuestTimelineLog(
      currentWorkspaceId,
      currentWeddingId,
      invite.guestId,
      'QR Scanned',
      'QR Scan Event',
      `Invitation QR Code scanned (${invite.qrCode.scanCount + 1} times) - Last scan by ${operator}`,
      '',
      String(invite.qrCode.scanCount + 1),
      operator,
      'invitation'
    );
  };

  return {
    invitations,
    guests,
    rsvps,
    loading,
    saveInvitation,
    deleteInvitation,
    bulkGenerate,
    bulkDelete,
    bulkUpdateDelivery,
    bulkUpdateStatus,
    recordQrScan
  };
};

export default useInvitations;
