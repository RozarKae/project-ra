import { useEffect, useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { RsvpRepository, RsvpEntry, RsvpTimelineEvent } from '../repositories/RsvpRepository';
import { GuestRepository } from '../repositories/GuestRepository';
import { ActivityRepository } from '../repositories/ActivityRepository';
import { Guest } from '@project-ra/types';

const rsvpRepo = new RsvpRepository();
const guestRepo = new GuestRepository();
const activityRepo = new ActivityRepository();

export const useRsvps = () => {
  const { currentWorkspaceId, currentWeddingId } = useWorkspace();
  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = rsvpRepo.subscribeRsvps(
      currentWorkspaceId,
      currentWeddingId,
      (loadedRsvps) => {
        setRsvps(loadedRsvps);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentWorkspaceId, currentWeddingId]);

  const saveRsvp = async (rsvp: RsvpEntry, operator: string, isCreate: boolean = false) => {
    const now = new Date().toISOString();
    
    // Add timeline event
    const event: RsvpTimelineEvent = {
      type: isCreate ? 'submitted' : 'updated',
      timestamp: now,
      description: isCreate ? `RSVP submitted by ${operator}` : `RSVP details updated by ${operator}`
    };

    const updatedRsvp: RsvpEntry = {
      ...rsvp,
      lastUpdated: now,
      updatedBy: operator,
      timeline: [...(rsvp.timeline || []), event]
    };

    // Retrieve previous state for Audit logs comparison (Sprint C.3 & C.5)
    const oldRsvp = rsvps.find(r => r.guestId === rsvp.guestId);

    // 1. Save RSVP record
    await rsvpRepo.saveRsvp(currentWorkspaceId, currentWeddingId, updatedRsvp);

    // 2. Sync to corresponding Guest record
    const localGuestsKey = `ra_guests_${currentWorkspaceId}_${currentWeddingId}`;
    const guestsData = localStorage.getItem(localGuestsKey);
    if (guestsData) {
      const guestsList: Guest[] = JSON.parse(guestsData);
      const guestIdx = guestsList.findIndex(g => g.id === rsvp.guestId);
      if (guestIdx > -1) {
        const matchingGuest = guestsList[guestIdx];
        const statusMap: Record<string, 'attending' | 'declined' | 'pending' | 'maybe'> = {
          accepted: 'attending',
          declined: 'declined',
          pending: 'pending',
          maybe: 'maybe',
          expired: 'pending'
        };
        const updatedGuest: Guest = {
          ...matchingGuest,
          rsvpStatus: statusMap[rsvp.status] || 'pending',
          membersCount: rsvp.membersAttending.total || 1,
          updatedAt: now,
          updatedBy: operator
        };
        await guestRepo.saveGuest(currentWorkspaceId, currentWeddingId, updatedGuest, operator);
      }
    }

    // 3. Compare and add specific activity logs (Sprint C.3 & C.5)
    if (oldRsvp && oldRsvp.attendance && rsvp.attendance) {
      // C.3 standard logs
      if (oldRsvp.attendance.status !== rsvp.attendance.status) {
        await activityRepo.addLog(
          currentWorkspaceId, 
          currentWeddingId, 
          operator, 
          'Update', 
          'attendance', 
          rsvp.guestId, 
          `Attendance Updated: "${rsvp.guestName}" changed status to "${rsvp.attendance.status.toUpperCase()}"`
        );
        // C.5 timeline log
        await activityRepo.addGuestTimelineLog(
          currentWorkspaceId,
          currentWeddingId,
          rsvp.guestId,
          'Attendance Updated',
          'Attendance Status Changed',
          `Guest "${rsvp.guestName}" attendance status was updated to "${rsvp.attendance.status.toUpperCase()}"`,
          oldRsvp.attendance.status,
          rsvp.attendance.status,
          operator,
          'attendance'
        );
      }
      if (
        oldRsvp.attendance.adults !== rsvp.attendance.adults ||
        oldRsvp.attendance.children !== rsvp.attendance.children ||
        oldRsvp.attendance.infants !== rsvp.attendance.infants
      ) {
        await activityRepo.addLog(
          currentWorkspaceId, 
          currentWeddingId, 
          operator, 
          'Update', 
          'attendance', 
          rsvp.guestId, 
          `Guest Count Changed: "${rsvp.guestName}" headcount to ${rsvp.attendance.adults}A, ${rsvp.attendance.children}C, ${rsvp.attendance.infants}I`
        );
        // C.5 timeline log
        await activityRepo.addGuestTimelineLog(
          currentWorkspaceId,
          currentWeddingId,
          rsvp.guestId,
          'Attendance Updated',
          'Guest Count Changed',
          `Guest "${rsvp.guestName}" attendance headcount changed to: ${rsvp.attendance.adults} Adults, ${rsvp.attendance.children} Children, ${rsvp.attendance.infants} Infants`,
          `${oldRsvp.attendance.adults}A/${oldRsvp.attendance.children}C`,
          `${rsvp.attendance.adults}A/${rsvp.attendance.children}C`,
          operator,
          'attendance'
        );
      }
      if (JSON.stringify(oldRsvp.attendance.events) !== JSON.stringify(rsvp.attendance.events)) {
        await activityRepo.addLog(
          currentWorkspaceId, 
          currentWeddingId, 
          operator, 
          'Update', 
          'attendance', 
          rsvp.guestId, 
          `Event Selection Changed: "${rsvp.guestName}" events list updated`
        );
        // C.5 timeline log
        await activityRepo.addGuestTimelineLog(
          currentWorkspaceId,
          currentWeddingId,
          rsvp.guestId,
          'Attendance Updated',
          'Event Selection Changed',
          `Guest "${rsvp.guestName}" wedding events selections were updated by ${operator}`,
          JSON.stringify(oldRsvp.attendance.events),
          JSON.stringify(rsvp.attendance.events),
          operator,
          'attendance'
        );
      }
    }

    // Compare hospitality changes for C.5
    if (oldRsvp && rsvp.hospitality) {
      const oldHosp = oldRsvp.hospitality;
      const newHosp = rsvp.hospitality;
      if (oldHosp) {
        if (oldHosp.mealPreference !== newHosp.mealPreference) {
          await activityRepo.addGuestTimelineLog(
            currentWorkspaceId,
            currentWeddingId,
            rsvp.guestId,
            'Meal Preference Updated',
            'Meal Selection Updated',
            `Guest "${rsvp.guestName}" meal selection was changed to "${newHosp.mealPreference.toUpperCase()}"`,
            oldHosp.mealPreference,
            newHosp.mealPreference,
            operator,
            'hospitality'
          );
        }
        if (JSON.stringify(oldHosp) !== JSON.stringify(newHosp)) {
          await activityRepo.addGuestTimelineLog(
            currentWorkspaceId,
            currentWeddingId,
            rsvp.guestId,
            'Hospitality Updated',
            'Hospitality Details Saved',
            `Guest "${rsvp.guestName}" hospitality lodging and pickup preferences were updated`,
            JSON.stringify(oldHosp),
            JSON.stringify(newHosp),
            operator,
            'hospitality'
          );
        }
      } else {
        await activityRepo.addGuestTimelineLog(
          currentWorkspaceId,
          currentWeddingId,
          rsvp.guestId,
          'Hospitality Updated',
          'Hospitality Preferences Initialized',
          `Guest "${rsvp.guestName}" hospitality options were initialized by ${operator}`,
          '',
          JSON.stringify(newHosp),
          operator,
          'hospitality'
        );
      }
    }

    // Compare invitation changes for C.5
    if (oldRsvp && oldRsvp.invitationInfo && rsvp.invitationInfo) {
      if (!oldRsvp.invitationInfo.sent && rsvp.invitationInfo.sent) {
        await activityRepo.addGuestTimelineLog(
          currentWorkspaceId,
          currentWeddingId,
          rsvp.guestId,
          'Invitation Sent',
          'Invitation Dispatched',
          `Invitation was sent to guest "${rsvp.guestName}"`,
          '',
          '',
          operator,
          'invitation'
        );
      }
      if (!oldRsvp.invitationInfo.delivered && rsvp.invitationInfo.delivered) {
        await activityRepo.addGuestTimelineLog(
          currentWorkspaceId,
          currentWeddingId,
          rsvp.guestId,
          'Invitation Delivered',
          'Invitation Delivered',
          `Invitation was delivered to guest "${rsvp.guestName}"`,
          '',
          '',
          operator,
          'invitation'
        );
      }
      if (!oldRsvp.invitationInfo.viewed && rsvp.invitationInfo.viewed) {
        await activityRepo.addGuestTimelineLog(
          currentWorkspaceId,
          currentWeddingId,
          rsvp.guestId,
          'Invitation Viewed',
          'Invitation Link Opened',
          `Invitation link was viewed by guest "${rsvp.guestName}"`,
          '',
          '',
          operator,
          'invitation'
        );
      }
    }

    // RSVP Submit/Update logs (C.5)
    if (isCreate) {
      await activityRepo.addLog(
        currentWorkspaceId,
        currentWeddingId,
        operator,
        'Create',
        'rsvp',
        rsvp.id,
        `Submitted RSVP for Guest: "${rsvp.guestName}"`
      );
      await activityRepo.addGuestTimelineLog(
        currentWorkspaceId,
        currentWeddingId,
        rsvp.guestId,
        'RSVP Submitted',
        'RSVP Received',
        `Guest "${rsvp.guestName}" submitted RSVP with status "${rsvp.status.toUpperCase()}"`,
        '',
        JSON.stringify(rsvp),
        operator,
        'rsvp'
      );
    } else {
      await activityRepo.addLog(
        currentWorkspaceId,
        currentWeddingId,
        operator,
        'Update',
        'rsvp',
        rsvp.id,
        `Updated RSVP for Guest: "${rsvp.guestName}"`
      );
      if (oldRsvp && oldRsvp.status !== rsvp.status) {
        await activityRepo.addGuestTimelineLog(
          currentWorkspaceId,
          currentWeddingId,
          rsvp.guestId,
          'RSVP Updated',
          'RSVP Status Changed',
          `Guest "${rsvp.guestName}" RSVP response status was updated to "${rsvp.status.toUpperCase()}"`,
          oldRsvp.status,
          rsvp.status,
          operator,
          'rsvp'
        );
      }
    }
  };

  const markAccepted = async (rsvp: RsvpEntry, operator: string) => {
    const now = new Date().toISOString();
    const event: RsvpTimelineEvent = {
      type: 'updated',
      timestamp: now,
      description: `RSVP marked as Accepted by ${operator}`
    };

    const updatedRsvp: RsvpEntry = {
      ...rsvp,
      status: 'accepted',
      response: 'yes',
      respondedAt: now,
      lastUpdated: now,
      updatedBy: operator,
      timeline: [...(rsvp.timeline || []), event],
      attendance: rsvp.attendance ? {
        ...rsvp.attendance,
        status: 'attending',
        updatedAt: now,
        updatedBy: operator
      } : {
        status: 'attending',
        adults: rsvp.membersAttending.adults || 1,
        children: rsvp.membersAttending.children || 0,
        infants: 0,
        events: [],
        specialAttendance: [],
        completion: 70,
        updatedAt: now,
        updatedBy: operator
      }
    };

    await saveRsvp(updatedRsvp, operator);
  };

  const markDeclined = async (rsvp: RsvpEntry, operator: string) => {
    const now = new Date().toISOString();
    const event: RsvpTimelineEvent = {
      type: 'updated',
      timestamp: now,
      description: `RSVP marked as Declined by ${operator}`
    };

    const updatedRsvp: RsvpEntry = {
      ...rsvp,
      status: 'declined',
      response: 'no',
      respondedAt: now,
      lastUpdated: now,
      updatedBy: operator,
      timeline: [...(rsvp.timeline || []), event],
      attendance: rsvp.attendance ? {
        ...rsvp.attendance,
        status: 'not-attending',
        updatedAt: now,
        updatedBy: operator
      } : {
        status: 'not-attending',
        adults: 0,
        children: 0,
        infants: 0,
        events: [],
        specialAttendance: [],
        completion: 100,
        updatedAt: now,
        updatedBy: operator
      }
    };

    await saveRsvp(updatedRsvp, operator);
  };

  const resetRsvp = async (rsvp: RsvpEntry, operator: string) => {
    const now = new Date().toISOString();
    const event: RsvpTimelineEvent = {
      type: 'updated',
      timestamp: now,
      description: `RSVP details reset by ${operator}`
    };

    const updatedRsvp: RsvpEntry = {
      ...rsvp,
      status: 'pending',
      response: 'maybe',
      mealPreference: {
        type: 'non-vegetarian',
        allergies: '',
        notes: ''
      },
      specialRequirements: {
        wheelchairAccess: false,
        seniorCitizen: false,
        infant: false,
        parkingRequired: false,
        accommodationRequired: false,
        transportRequired: false,
        notes: ''
      },
      membersAttending: {
        adults: 1,
        children: 0,
        total: 1
      },
      respondedAt: undefined,
      lastUpdated: now,
      updatedBy: operator,
      timeline: [...(rsvp.timeline || []), event],
      attendance: {
        status: 'pending',
        adults: 1,
        children: 0,
        infants: 0,
        events: [],
        specialAttendance: [],
        completion: 20,
        updatedAt: now,
        updatedBy: operator
      }
    };

    await saveRsvp(updatedRsvp, operator);
  };

  return { rsvps, loading, saveRsvp, markAccepted, markDeclined, resetRsvp };
};

export default useRsvps;
