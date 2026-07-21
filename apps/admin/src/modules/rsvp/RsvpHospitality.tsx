import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Search,
  AlertCircle,
  Utensils,
  Car,
  Home,
  Accessibility,
  Lock,
  FileText
} from 'lucide-react';
import { Card, Button, Modal } from '@project-ra/ui';
import { toast } from 'react-hot-toast';
import { useAuth } from '@project-ra/firebase';
import { useGuests, useRsvps, useUserProfile, RsvpRepository, RsvpEntry } from '@project-ra/shared';
import { Guest } from '@project-ra/types';

const rsvpRepo = new RsvpRepository();

export const RsvpHospitality: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { guests, loading: guestsLoading } = useGuests();
  const { rsvps, loading: rsvpsLoading, saveRsvp } = useRsvps();
  const { profile: currentUserProfile, loading: profileLoading } = useUserProfile();

  const currentUserRole = currentUserProfile?.role || 'owner';
  const isEditable = currentUserRole === 'owner' || currentUserRole === 'admin';

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'meals' | 'accommodation' | 'transport' | 'accessibility'>('all');

  // Selected RSVP detail drawer state
  const [selectedRsvp, setSelectedRsvp] = useState<RsvpEntry | null>(null);

  // Drawer Form States
  const [mealPref, setMealPref] = useState<'vegetarian' | 'non-vegetarian' | 'vegan' | 'kids_meal' | 'custom'>('non-vegetarian');
  const [dietary, setDietary] = useState<string[]>([]);
  const [dietaryCustom, setDietaryCustom] = useState('');
  const [accessibility, setAccessibility] = useState<string[]>([]);
  
  // Accommodation states
  const [hasAcc, setHasAcc] = useState(false);
  const [accRooms, setAccRooms] = useState(0);
  const [accInDate, setAccInDate] = useState('');
  const [accOutDate, setAccOutDate] = useState('');
  const [accHotel, setAccHotel] = useState('');
  const [accNotes, setAccNotes] = useState('');

  // Transport states
  const [pickup, setPickup] = useState(false);
  const [dropoff, setDropoff] = useState(false);
  const [vehicle, setVehicle] = useState(false);
  const [parking, setParking] = useState(false);
  const [pickupLoc, setPickupLoc] = useState('');

  // Organizer Note
  const [orgNotes, setOrgNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Helper to retrieve/build default RSVP for a Guest
  const getRsvpForGuest = (guest: Guest): RsvpEntry => {
    const existing = rsvps.find(r => r.guestId === guest.id);
    if (existing) return existing;
    return rsvpRepo.createDefaultRsvp(guest.id, guest.name, guest.familyName, guest.invitationType || 'digital');
  };

  const handleOpenDetails = (guest: Guest) => {
    const rsvp = getRsvpForGuest(guest);
    setSelectedRsvp(rsvp);

    const hosp = rsvp.hospitality || {
      mealPreference: 'non-vegetarian',
      dietaryRestrictions: [],
      dietaryRestrictionsCustom: '',
      accessibility: [],
      accommodation: { requiresAccommodation: false, numberOfRooms: 0, checkInDate: '', checkOutDate: '', hotelPreference: '', notes: '' },
      transport: { requiresPickup: false, requiresDropoff: false, vehicleRequired: false, parkingRequired: false, pickupLocation: '' },
      organizerNotes: ''
    };

    setMealPref(hosp.mealPreference || 'non-vegetarian');
    setDietary(hosp.dietaryRestrictions || []);
    setDietaryCustom(hosp.dietaryRestrictionsCustom || '');
    setAccessibility(hosp.accessibility || []);

    setHasAcc(hosp.accommodation?.requiresAccommodation ?? false);
    setAccRooms(hosp.accommodation?.numberOfRooms ?? 0);
    setAccInDate(hosp.accommodation?.checkInDate ?? '');
    setAccOutDate(hosp.accommodation?.checkOutDate ?? '');
    setAccHotel(hosp.accommodation?.hotelPreference ?? '');
    setAccNotes(hosp.accommodation?.notes ?? '');

    setPickup(hosp.transport?.requiresPickup ?? false);
    setDropoff(hosp.transport?.requiresDropoff ?? false);
    setVehicle(hosp.transport?.vehicleRequired ?? false);
    setParking(hosp.transport?.parkingRequired ?? false);
    setPickupLoc(hosp.transport?.pickupLocation ?? '');

    setOrgNotes(hosp.organizerNotes || '');
  };

  const handleSaveHospitality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRsvp) return;
    if (!isEditable) {
      toast.error('You do not have permission to modify preferences');
      return;
    }

    setIsSaving(true);
    try {
      const operator = currentUserProfile?.displayName || user?.email || 'Admin';
      const prevHosp = selectedRsvp.hospitality;

      const updatedPayload: RsvpEntry = {
        ...selectedRsvp,
        hospitality: {
          mealPreference: mealPref,
          dietaryRestrictions: dietary,
          dietaryRestrictionsCustom: dietaryCustom.trim(),
          accessibility,
          accommodation: {
            requiresAccommodation: hasAcc,
            numberOfRooms: Number(accRooms),
            checkInDate: accInDate,
            checkOutDate: accOutDate,
            hotelPreference: accHotel.trim(),
            notes: accNotes.trim()
          },
          transport: {
            requiresPickup: pickup,
            requiresDropoff: dropoff,
            vehicleRequired: vehicle,
            parkingRequired: parking,
            pickupLocation: pickupLoc.trim()
          },
          organizerNotes: orgNotes.trim(),
          updatedAt: new Date().toISOString(),
          updatedBy: operator
        }
      };

      await saveRsvp(updatedPayload, operator);
      
      if (!prevHosp || prevHosp.mealPreference !== mealPref) {
        toast.success('Meal Preference Saved');
      }
      if (!prevHosp || JSON.stringify(prevHosp.accommodation) !== JSON.stringify(updatedPayload.hospitality?.accommodation)) {
        toast.success('Accommodation Updated');
      }
      if (!prevHosp || JSON.stringify(prevHosp.transport) !== JSON.stringify(updatedPayload.hospitality?.transport)) {
        toast.success('Transport Updated');
      }

      toast.success('Hospitality Updated');
      setSelectedRsvp(null);
    } catch {
      toast.error('Failed to update hospitality settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDietary = (item: string) => {
    if (dietary.includes(item)) {
      setDietary(dietary.filter(i => i !== item));
    } else {
      setDietary([...dietary, item]);
    }
  };

  const toggleAccessibility = (item: string) => {
    if (accessibility.includes(item)) {
      setAccessibility(accessibility.filter(i => i !== item));
    } else {
      setAccessibility([...accessibility, item]);
    }
  };

  const filteredGuests = guests.filter(guest => {
    const r = getRsvpForGuest(guest);
    const hosp = r.hospitality;

    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (guest.familyName || 'General').toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'meals') return matchesSearch && hosp?.mealPreference !== undefined;
    if (activeTab === 'accommodation') return matchesSearch && hosp?.accommodation?.requiresAccommodation;
    if (activeTab === 'transport') return matchesSearch && (hosp?.transport?.requiresPickup || hosp?.transport?.requiresDropoff || hosp?.transport?.parkingRequired);
    if (activeTab === 'accessibility') return matchesSearch && (hosp?.accessibility && hosp.accessibility.length > 0);
    return matchesSearch;
  });

  const dietaryOptions = [
    'Nut Allergy',
    'Dairy Allergy',
    'Gluten Free',
    'Egg Free',
    'Seafood Allergy',
    'Halal',
    'Kosher',
    'Diabetic Friendly'
  ];

  const accessibilityOptions = [
    'Wheelchair Access',
    'Walking Assistance',
    'Senior Citizen',
    'Infant',
    'Pregnant Guest',
    'Medical Assistance'
  ];

  if (guestsLoading || rsvpsLoading || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 space-y-3 font-poppins">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Loading Hospitality Preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-poppins relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D4AF37]/10 pb-6">
        <div className="flex flex-col gap-1.5">
          <button 
            onClick={() => navigate('/admin/rsvp')}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] hover:text-[#D4AF37]/80 transition mb-1"
          >
            <ArrowLeft size={10} />
            <span>RSVP Dashboard</span>
          </button>
          
          <h1 className="text-2xl md:text-3xl font-cinzel text-[#F5F5F5] font-bold tracking-wide">
            Hospitality & Preferences
          </h1>
          <p className="text-xs text-[#F5F5F5]/50">
            Organize catering selections, hotel lodging accommodations, custom dietary restrictions, transport vehicle setups, and organizer remarks.
          </p>
        </div>
      </div>

      {/* Search & Filter Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade">
        <div className="md:col-span-3 relative">
          <Search size={15} className="absolute left-3.5 top-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by Guest name, Family group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-[#090909]/95 border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl pl-10 pr-4 py-3.5 focus:outline-none transition"
          />
        </div>

        <div>
          <select
            value={activeTab}
            onChange={(e: any) => setActiveTab(e.target.value)}
            className="w-full text-xs bg-[#090909]/95 border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3.5 py-3.5 focus:outline-none transition cursor-pointer font-poppins capitalize"
          >
            <option value="all">All RSVP Guests</option>
            <option value="meals">Catering Selected</option>
            <option value="accommodation">Lodging Required</option>
            <option value="transport">Transit Required</option>
            <option value="accessibility">Special Access Needed</option>
          </select>
        </div>
      </div>

      {/* Hospitality Table Console */}
      <Card className="p-0 border border-[#D4AF37]/10 overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse font-poppins">
            <thead>
              <tr className="border-b border-[#D4AF37]/10 bg-[#090909]/40 text-[#D4AF37] uppercase tracking-wider text-[10px] font-semibold">
                <th className="p-3.5">Guest Name</th>
                <th className="p-3.5">Family Group</th>
                <th className="p-3.5">Meal Preference</th>
                <th className="p-3.5">Allergies</th>
                <th className="p-3.5 text-center">Accomm.</th>
                <th className="p-3.5 text-center">Transport</th>
                <th className="p-3.5 text-center">Special Access</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/5 text-zinc-300">
              {filteredGuests.map((guest) => {
                const r = getRsvpForGuest(guest);
                const hosp = r.hospitality || {
                  mealPreference: 'non-vegetarian',
                  dietaryRestrictions: [],
                  dietaryRestrictionsCustom: '',
                  accessibility: [],
                  accommodation: { requiresAccommodation: false, numberOfRooms: 0, checkInDate: '', checkOutDate: '', hotelPreference: '', notes: '' },
                  transport: { requiresPickup: false, requiresDropoff: false, vehicleRequired: false, parkingRequired: false, pickupLocation: '' },
                  organizerNotes: ''
                };

                const hasHotel = hosp.accommodation?.requiresAccommodation;
                const hasTransit = hosp.transport?.requiresPickup || hosp.transport?.requiresDropoff;
                const hasSpecial = hosp.accessibility && hosp.accessibility.length > 0;

                return (
                  <tr key={guest.id} className="hover:bg-[#141414]/25 transition duration-150 group">
                    <td className="p-3.5 font-semibold text-zinc-200">{guest.name}</td>
                    <td className="p-3.5 text-[#F5F5F5]/65">{guest.familyName || 'General'}</td>
                    <td className="p-3.5 capitalize text-zinc-300">
                      {hosp.mealPreference === 'non-vegetarian' ? 'Non-Veg' : hosp.mealPreference.replace('_', ' ')}
                    </td>
                    <td className="p-3.5 text-zinc-400">
                      {hosp.dietaryRestrictions && hosp.dietaryRestrictions.length > 0 ? (
                        <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 max-w-[120px] truncate block">
                          {hosp.dietaryRestrictions.join(', ')}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {hasHotel ? (
                        <span className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Home size={12} />
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {hasTransit ? (
                        <span className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Car size={12} />
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {hasSpecial ? (
                        <span className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Accessibility size={12} />
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenDetails(guest)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-[#D4AF37]/40 text-[#D4AF37] hover:bg-zinc-800 transition text-[10px] font-bold uppercase tracking-wider"
                      >
                        Manage Hospitality
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-zinc-500 font-poppins">
                    No guests matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Hospitality preferences modal drawer */}
      <Modal isOpen={selectedRsvp !== null} onClose={() => setSelectedRsvp(null)} title={selectedRsvp ? `Manage Hospitality — ${selectedRsvp.guestName}` : 'Hospitality Settings'}>
        {selectedRsvp && (
          <form onSubmit={handleSaveHospitality} className="space-y-6 text-xs font-poppins max-h-[85vh] overflow-y-auto pr-1">
            
            {/* Quick visual badges */}
            <div className="p-3 bg-[#090909]/40 border border-[#D4AF37]/10 rounded-xl flex flex-wrap gap-2 items-center">
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block w-full mb-1">Preferences Overview Badge Check</span>
              
              <span className="text-[10px] font-semibold bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Utensils size={10} />
                <span className="capitalize">{mealPref.replace('_', ' ')}</span>
              </span>

              {dietary.length > 0 && (
                <span className="text-[10px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <AlertCircle size={10} />
                  <span>Allergies ({dietary.length})</span>
                </span>
              )}

              {hasAcc && (
                <span className="text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Home size={10} />
                  <span>Lodging: {accRooms}R</span>
                </span>
              )}

              {(pickup || dropoff) && (
                <span className="text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Car size={10} />
                  <span>Transit Req.</span>
                </span>
              )}

              {accessibility.length > 0 && (
                <span className="text-[10px] font-semibold bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Accessibility size={10} />
                  <span>Access ({accessibility.length})</span>
                </span>
              )}
            </div>

            {/* Responsive grid for hospitality settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* SECTION 1: Meal Preferences Card */}
              <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/10 space-y-3">
                <div className="flex items-center gap-1.5 border-b border-[#D4AF37]/5 pb-2">
                  <Utensils size={14} className="text-[#D4AF37]" />
                  <h4 className="font-cinzel font-bold text-[10px] uppercase tracking-wider text-[#D4AF37]">Catering & Meal Selections</h4>
                </div>

                <div className="space-y-2">
                  {['vegetarian', 'non-vegetarian', 'vegan', 'kids_meal', 'custom'].map((val) => (
                    <label key={val} className="flex items-center gap-2.5 p-2 rounded bg-black/40 border border-zinc-900/60 cursor-pointer">
                      <input
                        type="radio"
                        disabled={!isEditable}
                        checked={mealPref === val}
                        name="meal_pref_radio"
                        onChange={() => setMealPref(val as any)}
                        className="accent-[#D4AF37] w-3.5 h-3.5"
                      />
                      <span className="capitalize text-zinc-300 font-medium">
                        {val === 'non-vegetarian' ? 'Non-Vegetarian' : val.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Dietary Requirements Card */}
              <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/10 space-y-3">
                <div className="flex items-center gap-1.5 border-b border-[#D4AF37]/5 pb-2">
                  <AlertCircle size={14} className="text-[#D4AF37]" />
                  <h4 className="font-cinzel font-bold text-[10px] uppercase tracking-wider text-[#D4AF37]">Allergies & Dietary Restrictions</h4>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {dietaryOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 p-2 rounded bg-black/40 border border-zinc-900/60 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!isEditable}
                        checked={dietary.includes(opt)}
                        onChange={() => toggleDietary(opt)}
                        className="accent-[#D4AF37] w-3.5 h-3.5"
                      />
                      <span className="text-[10px] text-zinc-300 truncate">{opt}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Other Restrictions / Free Text</label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    value={dietaryCustom}
                    onChange={(e) => setDietaryCustom(e.target.value)}
                    placeholder="Enter any other requirements..."
                    className="w-full text-xs bg-black border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 3: Accessibility Card */}
              <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/10 space-y-3">
                <div className="flex items-center gap-1.5 border-b border-[#D4AF37]/5 pb-2">
                  <Accessibility size={14} className="text-[#D4AF37]" />
                  <h4 className="font-cinzel font-bold text-[10px] uppercase tracking-wider text-[#D4AF37]">Special Access Assistance</h4>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {accessibilityOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 p-2 rounded bg-black/40 border border-zinc-900/60 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!isEditable}
                        checked={accessibility.includes(opt)}
                        onChange={() => toggleAccessibility(opt)}
                        className="accent-[#D4AF37] w-3.5 h-3.5"
                      />
                      <span className="text-[10px] text-zinc-300 truncate">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION 4: Accommodation Card */}
              <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/10 space-y-3">
                <div className="flex items-center justify-between border-b border-[#D4AF37]/5 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Home size={14} className="text-[#D4AF37]" />
                    <h4 className="font-cinzel font-bold text-[10px] uppercase tracking-wider text-[#D4AF37]">Hotel Lodging Accomm.</h4>
                  </div>
                  
                  <input
                    type="checkbox"
                    disabled={!isEditable}
                    checked={hasAcc}
                    onChange={(e) => setHasAcc(e.target.checked)}
                    className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
                  />
                </div>

                {hasAcc && (
                  <div className="space-y-3 animate-fade text-[10px]">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Rooms Needed</label>
                        <input
                          type="number"
                          min={0}
                          disabled={!isEditable}
                          value={accRooms}
                          onChange={(e) => setAccRooms(Number(e.target.value))}
                          className="w-full text-xs font-mono bg-black border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Hotel Preference</label>
                        <input
                          type="text"
                          disabled={!isEditable}
                          value={accHotel}
                          onChange={(e) => setAccHotel(e.target.value)}
                          placeholder="e.g. Residency Palace"
                          className="w-full text-xs bg-black border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Check-in Date</label>
                        <input
                          type="date"
                          disabled={!isEditable}
                          value={accInDate}
                          onChange={(e) => setAccInDate(e.target.value)}
                          className="w-full text-xs bg-black border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-white rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Check-out Date</label>
                        <input
                          type="date"
                          disabled={!isEditable}
                          value={accOutDate}
                          onChange={(e) => setAccOutDate(e.target.value)}
                          className="w-full text-xs bg-black border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-white rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Lodging Remarks</label>
                      <textarea
                        rows={2}
                        disabled={!isEditable}
                        value={accNotes}
                        onChange={(e) => setAccNotes(e.target.value)}
                        placeholder="Special lodging comments..."
                        className="w-full text-xs bg-black border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-white rounded-lg px-2.5 py-1.5 focus:outline-none font-poppins"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5: Transportation Card */}
              <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/10 space-y-3 md:col-span-2">
                <div className="flex items-center gap-1.5 border-b border-[#D4AF37]/5 pb-2">
                  <Car size={14} className="text-[#D4AF37]" />
                  <h4 className="font-cinzel font-bold text-[10px] uppercase tracking-wider text-[#D4AF37]">Transportation & Transit Requirements</h4>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                  <label className="flex items-center gap-2 p-2 rounded bg-black/40 border border-zinc-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={pickup}
                      onChange={(e) => setPickup(e.target.checked)}
                      className="accent-[#D4AF37] w-3.5 h-3.5"
                    />
                    <span className="text-zinc-300">Requires Pickup</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded bg-black/40 border border-zinc-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={dropoff}
                      onChange={(e) => setDropoff(e.target.checked)}
                      className="accent-[#D4AF37] w-3.5 h-3.5"
                    />
                    <span className="text-zinc-300">Requires Drop-off</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded bg-black/40 border border-zinc-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={vehicle}
                      onChange={(e) => setVehicle(e.target.checked)}
                      className="accent-[#D4AF37] w-3.5 h-3.5"
                    />
                    <span className="text-zinc-300">Vehicle Required</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded bg-black/40 border border-zinc-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={parking}
                      onChange={(e) => setParking(e.target.checked)}
                      className="accent-[#D4AF37] w-3.5 h-3.5"
                    />
                    <span className="text-zinc-300">Parking Required</span>
                  </label>
                </div>

                {(pickup || dropoff) && (
                  <div className="pt-2 animate-fade">
                    <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Pickup Location Address</label>
                    <input
                      type="text"
                      disabled={!isEditable}
                      value={pickupLoc}
                      onChange={(e) => setPickupLoc(e.target.value)}
                      placeholder="e.g. Airport Terminal 2 / Railway Junction..."
                      className="w-full text-xs bg-black border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* SECTION 6: Internal Organizer Remarks */}
              <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/10 space-y-2 md:col-span-2">
                <div className="flex items-center gap-1.5 border-b border-[#D4AF37]/5 pb-2">
                  <FileText size={14} className="text-[#D4AF37]" />
                  <h4 className="font-cinzel font-bold text-[10px] uppercase tracking-wider text-[#D4AF37]">Organizer Notes (Internal Only)</h4>
                </div>

                <div className="flex gap-2.5 items-start p-2 bg-amber-500/5 rounded-lg border border-amber-500/10 text-amber-500">
                  <Lock size={12} className="shrink-0 mt-0.5" />
                  <span className="text-[8.5px] leading-normal uppercase font-semibold">Security Level: Visibility of these notes is locked to Workspace Owners and Admins only.</span>
                </div>

                <textarea
                  rows={2}
                  disabled={!isEditable}
                  value={orgNotes}
                  onChange={(e) => setOrgNotes(e.target.value)}
                  placeholder="Record seat reservations, VIP escort designations, and special details..."
                  className="w-full text-xs bg-black border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                />
              </div>

            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-[#D4AF37]/10">
              <button
                type="button"
                onClick={() => setSelectedRsvp(null)}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs transition uppercase font-bold"
              >
                Cancel
              </button>
              {isEditable && (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                  className="py-2 px-5 text-xs font-bold uppercase tracking-wider"
                >
                  {isSaving ? 'Updating...' : 'Save Preferences'}
                </Button>
              )}
            </div>

          </form>
        )}
      </Modal>

    </div>
  );
};

export default RsvpHospitality;
