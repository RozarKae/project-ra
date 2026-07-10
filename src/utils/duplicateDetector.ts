import { Guest } from '../types/guest';

interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason?: 'name' | 'phone' | 'both';
  matchedGuestName?: string;
}

export const checkPotentialDuplicate = (
  newGuest: { name: string; phone: string },
  existingGuests: Guest[],
  excludeId?: string
): DuplicateCheckResult => {
  const normName = newGuest.name.trim().toLowerCase();
  const normPhone = newGuest.phone.trim().replace(/\D/g, ''); // strip non-digits

  if (!normName) {
    return { isDuplicate: false };
  }

  // Segment words in the input name
  const nameWords = normName.split(/\s+/).filter(w => w.length > 1);

  for (const guest of existingGuests) {
    if (excludeId && guest.id === excludeId) continue;

    const guestNormName = guest.name.trim().toLowerCase();
    const guestNormPhone = guest.phone.trim().replace(/\D/g, '');

    // 1. Phone number match (only if phone is provided and is more than 5 digits)
    const phoneMatch = normPhone.length > 5 && normPhone === guestNormPhone;

    // 2. Name similarity check
    let nameMatch = false;

    if (normName === guestNormName) {
      nameMatch = true;
    } else {
      const guestWords = guestNormName.split(/\s+/).filter(w => w.length > 1);
      // Check if they share at least 2 distinct words (e.g. "Ahmed Khan" and "Khan Ahmed")
      const intersectingWords = nameWords.filter(w => guestWords.includes(w));
      
      if (intersectingWords.length >= 2) {
        nameMatch = true;
      }
    }

    if (phoneMatch && nameMatch) {
      return { isDuplicate: true, reason: 'both', matchedGuestName: guest.name };
    } else if (phoneMatch) {
      return { isDuplicate: true, reason: 'phone', matchedGuestName: guest.name };
    } else if (nameMatch) {
      return { isDuplicate: true, reason: 'name', matchedGuestName: guest.name };
    }
  }

  return { isDuplicate: false };
};
