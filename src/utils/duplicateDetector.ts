import { Guest } from '../types/guest';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  priority?: 1 | 2 | 3 | 4;
  reason?: string;
  matchedGuest?: Guest;
}

// standard Levenshtein distance
function levenshtein(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const d: number[][] = [];

  for (let i = 0; i <= m; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,       // deletion
        d[i][j - 1] + 1,       // insertion
        d[i - 1][j - 1] + cost  // substitution
      );
    }
  }
  return d[m][n];
}

// Levenshtein similarity threshold (85 - 90%)
export function getSimilarity(str1: string, str2: string): number {
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();
  if (s1 === s2) return 1.0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshtein(s1, s2);
  return 1.0 - dist / maxLen;
}

// Normalize spelling variables in Islamic / South-Asian names
export function normalizeNameConsonants(name: string): string {
  let s = name.trim().toLowerCase();
  
  // Remove non-alphabetic elements
  s = s.replace(/[^a-z\s]/g, '');

  // Standardize common phonetic spellings
  s = s.replace(/ou/g, 'u');
  s = s.replace(/oo/g, 'u');
  s = s.replace(/ee/g, 'i');
  s = s.replace(/ea/g, 'i');
  s = s.replace(/ei/g, 'i');
  s = s.replace(/y/g, 'i');
  s = s.replace(/w/g, 'v'); // e.g. Chowdry vs Choudry
  
  // Consonants adjustments
  s = s.replace(/kh/g, 'k');
  s = s.replace(/gh/g, 'g');
  s = s.replace(/ph/g, 'f');
  s = s.replace(/sh/g, 's');
  s = s.replace(/ch/g, 'c');
  
  // Collapse double letters (e.g. mm -> m, dd -> d)
  s = s.replace(/(.)\1+/g, '$1');
  
  // Strip spaces for composite names (e.g. "abdul rahman" vs "abdurrahman" vs "abdur rahman")
  s = s.replace(/\s+/g, '');
  
  return s;
}

export function getPhoneticSimilarity(s1: string, s2: string): number {
  const norm1 = normalizeNameConsonants(s1);
  const norm2 = normalizeNameConsonants(s2);
  return getSimilarity(norm1, norm2);
}

// Centralized matching rule validator (reusable for imports / GUI checks)
export const checkPotentialDuplicate = (
  newGuest: { 
    name: string; 
    familyName: string; 
    phone?: string; 
    whatsApp?: string; 
  },
  existingGuests: Guest[],
  excludeId?: string
): DuplicateCheckResult => {
  const normName = newGuest.name.trim().toLowerCase();
  const normFamily = newGuest.familyName.trim().toLowerCase();
  const normPhone = (newGuest.phone || '').trim().replace(/\D/g, ''); // digits only
  const normWhatsApp = (newGuest.whatsApp || '').trim().replace(/\D/g, '');

  if (!normName) {
    return { isDuplicate: false };
  }

  for (const guest of existingGuests) {
    if (excludeId && guest.id === excludeId) continue;
    if (guest.isDeleted) continue;

    const guestNormName = guest.name.trim().toLowerCase();
    const guestNormFamily = (guest.familyName || '').trim().toLowerCase();
    const guestNormPhone = (guest.phone || '').trim().replace(/\D/g, '');
    const guestNormWhatsApp = (guest.whatsApp || '').trim().replace(/\D/g, '');

    // Priority 1: Same Phone Number (High confidence)
    if (normPhone && normPhone.length > 5 && normPhone === guestNormPhone) {
      return { 
        isDuplicate: true, 
        priority: 1, 
        reason: 'Same Phone Number', 
        matchedGuest: guest 
      };
    }

    // Priority 2: Same Name + Same Family Group
    if (normName === guestNormName && normFamily === guestNormFamily) {
      return { 
        isDuplicate: true, 
        priority: 2, 
        reason: 'Same Name & Family Group', 
        matchedGuest: guest 
      };
    }

    // Priority 3: Similar Name + Same Family Group (Fuzzy threshold 85%)
    if (normFamily && normFamily === guestNormFamily) {
      const sim = getSimilarity(normName, guestNormName);
      const phoneticSim = getPhoneticSimilarity(normName, guestNormName);
      if (sim >= 0.85 || phoneticSim >= 0.85) {
        return { 
          isDuplicate: true, 
          priority: 3, 
          reason: `Similar Name in same Family Group (${Math.round(Math.max(sim, phoneticSim) * 100)}% match)`, 
          matchedGuest: guest 
        };
      }
    }

    // Priority 4: Same WhatsApp Number
    if (normWhatsApp && normWhatsApp.length > 5 && normWhatsApp === guestNormWhatsApp) {
      return { 
        isDuplicate: true, 
        priority: 4, 
        reason: 'Same WhatsApp Number', 
        matchedGuest: guest 
      };
    }
  }

  return { isDuplicate: false };
};
