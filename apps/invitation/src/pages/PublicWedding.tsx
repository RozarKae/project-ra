import React, { useEffect } from 'react';
import { useWeddingSettings, useGuests, useRsvps, RsvpRepository } from '@project-ra/shared';
import { Guest } from '@project-ra/types';

const rsvpRepo = new RsvpRepository();

export const PublicWedding: React.FC = () => {
  const { settings } = useWeddingSettings();
  const { guests, save: saveGuest } = useGuests();
  const { rsvps, saveRsvp } = useRsvps();

  useEffect(() => {
    // Construct dynamic tab title based on centralized settings
    const groomName = settings?.groomShortName || 'Rozar';
    const brideName = settings?.brideShortName || 'Arifa';
    document.title = `${groomName} & ${brideName} Wedding Invitation`;

    // Synchronize Firestore settings to local storage key expected by the invitation iframe
    if (settings) {
      const storageKey = 'ra_settings_default_workspace_arifa_rozar_wedding';
      localStorage.setItem(storageKey, JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'RSVP_SUBMIT') {
        const { name, attendance, guestsCount, message } = event.data.payload;
        if (!name) return;

        console.log('Received RSVP Submission from iframe:', name, attendance, guestsCount, message);

        const cleanName = name.trim().toLowerCase();
        let targetGuest = guests.find(g => g.name.trim().toLowerCase() === cleanName);
        const isAttending = attendance.toLowerCase().includes('yes');
        const count = isAttending ? (parseInt(guestsCount, 10) || 1) : 0;
        const nowStr = new Date().toISOString();

        // 1. Create or Update Guest
        if (!targetGuest) {
          const newId = `GST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          const newG: Guest = {
            id: newId,
            name: name.trim(),
            familyName: 'General',
            relation: 'General',
            side: 'groom',
            invitationType: 'digital',
            rsvpStatus: isAttending ? 'attending' : 'declined',
            membersCount: count,
            isDeleted: false,
            createdAt: nowStr,
            updatedAt: nowStr,
            createdBy: 'public-form',
            updatedBy: 'public-form'
          };
          await saveGuest(newG, 'Guest Submission');
          targetGuest = newG;
        } else {
          const updatedG: Guest = {
            ...targetGuest,
            rsvpStatus: isAttending ? 'attending' : 'declined',
            membersCount: count,
            updatedAt: nowStr,
            updatedBy: 'public-form'
          };
          await saveGuest(updatedG, 'Guest Submission');
        }

        // 2. Find or Create RSVP Entry
        let existingRsvp = rsvps.find(r => r.guestId === targetGuest!.id);
        if (!existingRsvp) {
          existingRsvp = rsvpRepo.createDefaultRsvp(
            targetGuest.id,
            targetGuest.name,
            targetGuest.familyName || 'General',
            targetGuest.invitationType || 'digital'
          );
        }

        const updatedRsvp = {
          ...existingRsvp,
          status: (isAttending ? 'accepted' : 'declined') as 'accepted' | 'declined',
          response: (isAttending ? 'yes' : 'no') as 'yes' | 'no',
          notes: message || '',
          respondedAt: nowStr,
          membersAttending: {
            adults: count,
            children: 0,
            total: count
          },
          attendance: {
            status: (isAttending ? 'attending' : 'not-attending') as 'attending' | 'not-attending',
            adults: count,
            children: 0,
            infants: 0,
            events: ['nikah', 'valima'],
            specialAttendance: [],
            completion: 100
          }
        };

        // 3. Save RSVP (will update logs & sync guest status automatically)
        await saveRsvp(updatedRsvp, name.trim(), true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [guests, rsvps, saveGuest, saveRsvp]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#090909]" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#090909' }}>
      <iframe
        src="/invitation/index.html"
        title="Rozar & Arifa Wedding Invitation"
        className="w-full h-full border-none outline-none"
        style={{ width: '100%', height: '100%', border: 'none', outline: 'none', display: 'block' }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
      />
    </div>
  );
};

export default PublicWedding;
