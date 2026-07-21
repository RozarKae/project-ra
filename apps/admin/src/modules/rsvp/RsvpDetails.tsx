import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Search,
  Eye,
  XCircle,
  Check,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { Card, Button, Modal } from '@project-ra/ui';
import { toast } from 'react-hot-toast';
import { useGuests, useRsvps, useUserProfile, RsvpRepository, RsvpEntry, RsvpTimelineEvent } from '@project-ra/shared';
import { Guest } from '@project-ra/types';

const rsvpRepo = new RsvpRepository();

export const RsvpDetails: React.FC = () => {
  const navigate = useNavigate();
  const { guests, loading: guestsLoading } = useGuests();
  const { rsvps, loading: rsvpsLoading, saveRsvp, markAccepted, markDeclined, resetRsvp } = useRsvps();
  const { profile: currentUserProfile, loading: profileLoading } = useUserProfile();

  const currentUserRole = currentUserProfile?.role || 'owner';
  const isEditable = currentUserRole === 'owner' || currentUserRole === 'admin';

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'declined' | 'maybe' | 'expired'>('all');

  // Selected RSVP detail view
  const [selectedRsvp, setSelectedRsvp] = useState<RsvpEntry | null>(null);
  
  // Drawer/Modal edit states
  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'meal' | 'special' | 'timeline'>('info');
  const [isSaving, setIsSaving] = useState(false);

  // Modal form states
  const [status, setStatus] = useState<RsvpEntry['status']>('pending');
  const [response, setResponse] = useState<RsvpEntry['response']>('maybe');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [mealType, setMealType] = useState<RsvpEntry['mealPreference']['type']>('non-vegetarian');
  const [allergies, setAllergies] = useState('');
  const [dietaryNotes, setDietaryNotes] = useState('');
  
  // Special Requirements
  const [wheelchair, setWheelchair] = useState(false);
  const [senior, setSenior] = useState(false);
  const [infant, setInfant] = useState(false);
  const [parking, setParking] = useState(false);
  const [accommodation, setAccommodation] = useState(false);
  const [transport, setTransport] = useState(false);
  const [specialNotes, setSpecialNotes] = useState('');

  // Invitation info
  const [invType, setInvType] = useState<RsvpEntry['invitationInfo']['type']>('digital');
  const [invSent, setInvSent] = useState(false);
  const [invDelivered, setInvDelivered] = useState(false);
  const [invViewed, setInvViewed] = useState(false);

  // Helper to retrieve or build default RSVP for a Guest
  const getRsvpForGuest = (guest: Guest): RsvpEntry => {
    const existing = rsvps.find(r => r.guestId === guest.id);
    if (existing) return existing;
    return rsvpRepo.createDefaultRsvp(guest.id, guest.name, guest.familyName, guest.invitationType || 'digital');
  };

  // Open detailed drawer
  const handleOpenDetails = (guest: Guest) => {
    const rsvp = getRsvpForGuest(guest);
    setSelectedRsvp(rsvp);
    
    // Set form fields
    setStatus(rsvp.status);
    setResponse(rsvp.response);
    setAdults(rsvp.membersAttending?.adults ?? 1);
    setChildren(rsvp.membersAttending?.children ?? 0);
    setMealType(rsvp.mealPreference?.type ?? 'non-vegetarian');
    setAllergies(rsvp.mealPreference?.allergies ?? '');
    setDietaryNotes(rsvp.mealPreference?.notes ?? '');
    
    setWheelchair(rsvp.specialRequirements?.wheelchairAccess ?? false);
    setSenior(rsvp.specialRequirements?.seniorCitizen ?? false);
    setInfant(rsvp.specialRequirements?.infant ?? false);
    setParking(rsvp.specialRequirements?.parkingRequired ?? false);
    setAccommodation(rsvp.specialRequirements?.accommodationRequired ?? false);
    setTransport(rsvp.specialRequirements?.transportRequired ?? false);
    setSpecialNotes(rsvp.specialRequirements?.notes ?? '');

    setInvType(rsvp.invitationInfo?.type ?? 'digital');
    setInvSent(rsvp.invitationInfo?.sent ?? false);
    setInvDelivered(rsvp.invitationInfo?.delivered ?? false);
    setInvViewed(rsvp.invitationInfo?.viewed ?? false);
    
    setActiveTab('info');
  };

  // Save drawer details changes
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRsvp) return;
    if (!isEditable) {
      toast.error('You do not have permission to modify RSVPs');
      return;
    }

    setIsSaving(true);
    try {
      const operator = currentUserProfile?.displayName || currentUserProfile?.email || 'Admin';
      const isCreate = !rsvps.some(r => r.guestId === selectedRsvp.guestId);
      
      const timeline: RsvpTimelineEvent[] = [...(selectedRsvp.timeline || [])];
      
      // Compute timeline flags
      if (invSent && !selectedRsvp.invitationInfo?.sent) {
        timeline.push({ type: 'sent', timestamp: new Date().toISOString(), description: 'Invitation sent to guest' });
      }
      if (invViewed && !selectedRsvp.invitationInfo?.viewed) {
        timeline.push({ type: 'viewed', timestamp: new Date().toISOString(), description: 'Invitation viewed by guest' });
      }

      const payload: RsvpEntry = {
        ...selectedRsvp,
        status,
        response,
        membersAttending: {
          adults,
          children,
          total: Number(adults) + Number(children)
        },
        mealPreference: {
          type: mealType,
          allergies: allergies.trim(),
          notes: dietaryNotes.trim()
        },
        specialRequirements: {
          wheelchairAccess: wheelchair,
          seniorCitizen: senior,
          infant,
          parkingRequired: parking,
          accommodationRequired: accommodation,
          transportRequired: transport,
          notes: specialNotes.trim()
        },
        invitationInfo: {
          sent: invSent,
          viewed: invViewed,
          delivered: invDelivered,
          type: invType,
          sentAt: invSent ? (selectedRsvp.invitationInfo?.sentAt || new Date().toISOString()) : undefined,
          viewedAt: invViewed ? (selectedRsvp.invitationInfo?.viewedAt || new Date().toISOString()) : undefined,
          deliveredAt: invDelivered ? (selectedRsvp.invitationInfo?.deliveredAt || new Date().toISOString()) : undefined
        },
        timeline
      };

      await saveRsvp(payload, operator, isCreate);
      setSelectedRsvp(null);
      toast.success('RSVP Details Saved successfully');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update RSVP details');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Action: Accept
  const handleQuickAccept = async (guest: Guest) => {
    if (!isEditable) {
      toast.error('Privilege check failed: Owners or Admins only');
      return;
    }
    const rsvp = getRsvpForGuest(guest);
    const operator = currentUserProfile?.displayName || currentUserProfile?.email || 'Admin';
    try {
      await markAccepted(rsvp, operator);
      toast.success(`Marked "${guest.name}" as attending`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Quick Action: Decline
  const handleQuickDecline = async (guest: Guest) => {
    if (!isEditable) {
      toast.error('Privilege check failed: Owners or Admins only');
      return;
    }
    const rsvp = getRsvpForGuest(guest);
    const operator = currentUserProfile?.displayName || currentUserProfile?.email || 'Admin';
    try {
      await markDeclined(rsvp, operator);
      toast.success(`Marked "${guest.name}" as declined`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Quick Action: Reset
  const handleQuickReset = async (guest: Guest) => {
    if (!isEditable) {
      toast.error('Privilege check failed: Owners or Admins only');
      return;
    }
    const rsvp = getRsvpForGuest(guest);
    const operator = currentUserProfile?.displayName || currentUserProfile?.email || 'Admin';
    try {
      await resetRsvp(rsvp, operator);
      toast.success(`Reset RSVP for "${guest.name}"`);
    } catch {
      toast.error('Failed to reset RSVP');
    }
  };

  // Status badge styling
  const getStatusBadge = (status: RsvpEntry['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700/50';
      case 'accepted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'declined':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'maybe':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'expired':
        return 'bg-zinc-900 text-zinc-600 border-zinc-950';
    }
  };

  // Filter and search computation
  const filteredGuests = guests.filter(guest => {
    const rsvp = getRsvpForGuest(guest);
    
    // Search match
    const nameMatch = guest.name.toLowerCase().includes(searchTerm.toLowerCase());
    const familyMatch = (guest.familyName || 'General').toLowerCase().includes(searchTerm.toLowerCase());
    const searchMatches = nameMatch || familyMatch;

    // Filter match
    if (statusFilter === 'all') return searchMatches;
    return searchMatches && rsvp.status === statusFilter;
  });

  if (guestsLoading || rsvpsLoading || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 space-y-3 font-poppins">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Loading RSVP Guest details Roster...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-poppins relative">
      
      {/* Header and navigation block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D4AF37]/10 pb-6">
        <div className="flex flex-col gap-1.5">
          <button 
            onClick={() => navigate('/admin/rsvp')}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] hover:text-[#D4AF37]/80 transition mb-1"
          >
            <ArrowLeft size={10} />
            <span>RSVP Summary Dashboard</span>
          </button>
          
          <h1 className="text-2xl md:text-3xl font-cinzel text-[#F5F5F5] font-bold tracking-wide">
            RSVP Details Roster
          </h1>
          <p className="text-xs text-[#F5F5F5]/50">
            Monitor granular guest statuses, timeline stages, dietary selections, and accommodation arrangements.
          </p>
        </div>
      </div>

      {/* Search and Filters grid */}
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
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="w-full text-xs bg-[#090909]/95 border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3.5 py-3.5 focus:outline-none transition cursor-pointer font-poppins capitalize"
          >
            <option value="all">All RSVP Statuses</option>
            <option value="pending">Pending (Gray)</option>
            <option value="accepted">Accepted (Green)</option>
            <option value="declined">Declined (Red)</option>
            <option value="maybe">Maybe (Amber)</option>
            <option value="expired">Expired (Dark Gray)</option>
          </select>
        </div>
      </div>

      {/* Roster Table card */}
      <Card className="p-0 border border-[#D4AF37]/10 overflow-hidden">
        
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse font-poppins">
            <thead>
              <tr className="border-b border-[#D4AF37]/10 bg-[#090909]/40 text-[#D4AF37] uppercase tracking-wider text-[10px] font-semibold">
                <th className="p-3.5">Guest Name</th>
                <th className="p-3.5">Family Group</th>
                <th className="p-3.5">Invitation Sent</th>
                <th className="p-3.5">RSVP Status</th>
                <th className="p-3.5">Headcount</th>
                <th className="p-3.5">Meal Selections</th>
                <th className="p-3.5">Special Needs</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/5 text-zinc-300">
              {filteredGuests.map((guest) => {
                const rsvp = getRsvpForGuest(guest);
                const meal = rsvp.mealPreference?.type || 'non-vegetarian';
                const allergiesLabel = rsvp.mealPreference?.allergies ? ` (${rsvp.mealPreference.allergies})` : '';
                
                const needsCount = [
                  rsvp.specialRequirements?.wheelchairAccess,
                  rsvp.specialRequirements?.seniorCitizen,
                  rsvp.specialRequirements?.infant,
                  rsvp.specialRequirements?.parkingRequired,
                  rsvp.specialRequirements?.accommodationRequired,
                  rsvp.specialRequirements?.transportRequired
                ].filter(Boolean).length;

                return (
                  <tr key={guest.id} className="hover:bg-[#141414]/25 transition duration-150 group">
                    <td className="p-3.5 font-semibold text-zinc-200">{guest.name}</td>
                    <td className="p-3.5 text-[#F5F5F5]/65">{guest.familyName || 'General'}</td>
                    <td className="p-3.5 font-mono text-[10px] text-zinc-400">
                      {rsvp.invitationInfo?.sent ? '✓ Sent' : '✗ Unsent'}
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(rsvp.status)}`}>
                        {rsvp.status === 'accepted' ? 'Accepted' : rsvp.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-zinc-200">
                      {rsvp.status === 'accepted' ? (rsvp.membersAttending?.total || 1) : 0}
                    </td>
                    <td className="p-3.5 text-zinc-400 capitalize truncate max-w-[150px]">
                      {meal === 'non-vegetarian' ? 'Non-Veg' : meal}{allergiesLabel}
                    </td>
                    <td className="p-3.5 text-zinc-400 font-medium">
                      {needsCount > 0 ? (
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                          {needsCount} Required
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleOpenDetails(guest)}
                          className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-[#D4AF37]/40 text-[#D4AF37] hover:bg-zinc-800 transition"
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>
                        {isEditable && (
                          <>
                            <button
                              onClick={() => handleQuickAccept(guest)}
                              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-emerald-400 hover:bg-zinc-800 transition"
                              title="Mark Accepted"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => handleQuickDecline(guest)}
                              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-rose-500/40 text-rose-400 hover:bg-zinc-800 transition"
                              title="Mark Declined"
                            >
                              <XCircle size={13} />
                            </button>
                            <button
                              onClick={() => handleQuickReset(guest)}
                              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-amber-400 hover:bg-zinc-800 transition"
                              title="Reset RSVP"
                            >
                              <RotateCcw size={13} />
                            </button>
                          </>
                        )}
                      </div>
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

        {/* Mobile View Roster */}
        <div className="block md:hidden divide-y divide-[#D4AF37]/5 text-xs font-poppins">
          {filteredGuests.map((guest) => {
            const rsvp = getRsvpForGuest(guest);
            return (
              <div key={guest.id} className="p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-zinc-100">{guest.name}</h4>
                    <span className="text-[10px] text-zinc-500">{guest.familyName || 'General'}</span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(rsvp.status)}`}>
                    {rsvp.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 py-1 bg-zinc-900/30 px-2 rounded-lg border border-zinc-900/60">
                  <div>Headcount: <strong className="text-zinc-200">{rsvp.status === 'accepted' ? (rsvp.membersAttending?.total || 1) : 0}</strong></div>
                  <div>Invite type: <strong className="text-zinc-200 capitalize">{rsvp.invitationInfo?.type}</strong></div>
                  <div>Meals: <strong className="text-zinc-200 capitalize">{rsvp.mealPreference?.type || 'non-vegetarian'}</strong></div>
                  <div>Requirements: <strong className="text-zinc-200">{[
                    rsvp.specialRequirements?.wheelchairAccess,
                    rsvp.specialRequirements?.seniorCitizen,
                    rsvp.specialRequirements?.infant,
                    rsvp.specialRequirements?.parkingRequired,
                    rsvp.specialRequirements?.accommodationRequired,
                    rsvp.specialRequirements?.transportRequired
                  ].filter(Boolean).length} Special</strong></div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => handleOpenDetails(guest)}
                    className="flex items-center gap-1 text-[10px] text-[#D4AF37] font-semibold bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl hover:bg-zinc-800"
                  >
                    <span>Edit Details</span>
                    <ArrowRight size={10} />
                  </button>

                  {isEditable && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleQuickAccept(guest)}
                        className="p-1.5 rounded border border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
                      >
                        <Check size={11} />
                      </button>
                      <button
                        onClick={() => handleQuickDecline(guest)}
                        className="p-1.5 rounded border border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10"
                      >
                        <XCircle size={11} />
                      </button>
                      <button
                        onClick={() => handleQuickReset(guest)}
                        className="p-1.5 rounded border border-amber-500/20 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10"
                      >
                        <RotateCcw size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filteredGuests.length === 0 && (
            <div className="p-6 text-center text-zinc-600 font-poppins">
              No matching guests found.
            </div>
          )}
        </div>
      </Card>

      {/* Detailed Modal/Drawer Overlay */}
      <Modal isOpen={selectedRsvp !== null} onClose={() => setSelectedRsvp(null)} title={selectedRsvp ? `RSVP Details — ${selectedRsvp.guestName}` : 'Guest Response Details'}>
        {selectedRsvp && (
          <form onSubmit={handleSaveDetails} className="space-y-6 text-xs font-poppins select-none max-h-[85vh] overflow-y-auto pr-1">
            
            {/* Modal Sub-Tabs */}
            <div className="flex gap-1.5 border-b border-zinc-900 pb-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`pb-1.5 font-bold uppercase tracking-wider text-[10px] border-b-2 transition ${
                  activeTab === 'info' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-zinc-500 hover:text-white'
                }`}
              >
                Invitation Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('attendance')}
                className={`pb-1.5 font-bold uppercase tracking-wider text-[10px] border-b-2 transition ${
                  activeTab === 'attendance' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-zinc-500 hover:text-white'
                }`}
              >
                Attendance
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('meal')}
                className={`pb-1.5 font-bold uppercase tracking-wider text-[10px] border-b-2 transition ${
                  activeTab === 'meal' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-zinc-500 hover:text-white'
                }`}
              >
                Meal Prefs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('special')}
                className={`pb-1.5 font-bold uppercase tracking-wider text-[10px] border-b-2 transition ${
                  activeTab === 'special' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-zinc-500 hover:text-white'
                }`}
              >
                Special Requirements
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('timeline')}
                className={`pb-1.5 font-bold uppercase tracking-wider text-[10px] border-b-2 transition ${
                  activeTab === 'timeline' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-zinc-500 hover:text-white'
                }`}
              >
                Timeline History
              </button>
            </div>

            {/* TAB 1: Invitation Info */}
            {activeTab === 'info' && (
              <div className="space-y-4 animate-fade">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Invitation Type</label>
                  <select
                    disabled={!isEditable}
                    value={invType}
                    onChange={(e: any) => setInvType(e.target.value)}
                    className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer"
                  >
                    <option value="digital">Digital (E-Invitation)</option>
                    <option value="printed">Printed Card</option>
                    <option value="both">Both Methods</option>
                  </select>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2.5">
                    <div>
                      <span className="font-semibold block text-zinc-200">Invitation Card Sent</span>
                      <span className="text-[9px] text-zinc-500">Toggles whether guest has been delivered the link/card.</span>
                    </div>
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={invSent}
                      onChange={(e) => setInvSent(e.target.checked)}
                      className="w-4 h-4 accent-[#D4AF37] rounded border-zinc-700 bg-black cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2.5">
                    <div>
                      <span className="font-semibold block text-zinc-200">Invitation Delivered</span>
                      <span className="text-[9px] text-zinc-500">Confirms delivery verification code checks.</span>
                    </div>
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={invDelivered}
                      onChange={(e) => setInvDelivered(e.target.checked)}
                      className="w-4 h-4 accent-[#D4AF37] rounded border-zinc-700 bg-black cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold block text-zinc-200">Invitation Card Viewed</span>
                      <span className="text-[9px] text-zinc-500">Triggers when guest clicks link or scans QR.</span>
                    </div>
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={invViewed}
                      onChange={(e) => setInvViewed(e.target.checked)}
                      className="w-4 h-4 accent-[#D4AF37] rounded border-zinc-700 bg-black cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Attendance & Response */}
            {activeTab === 'attendance' && (
              <div className="space-y-4 animate-fade">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">RSVP Status Badge</label>
                    <select
                      disabled={!isEditable}
                      value={status}
                      onChange={(e: any) => setStatus(e.target.value)}
                      className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="declined">Declined</option>
                      <option value="maybe">Maybe</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Attendance Reply</label>
                    <select
                      disabled={!isEditable}
                      value={response}
                      onChange={(e: any) => setResponse(e.target.value)}
                      className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer"
                    >
                      <option value="yes">Yes, I'll be there</option>
                      <option value="no">No, cannot attend</option>
                      <option value="maybe">Maybe</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-[#090909]/40 border border-[#D4AF37]/5 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] block">Members Headcount</span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Adults</label>
                      <input
                        type="number"
                        min={0}
                        disabled={!isEditable}
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        className="w-full text-xs font-mono bg-black border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Children</label>
                      <input
                        type="number"
                        min={0}
                        disabled={!isEditable}
                        value={children}
                        onChange={(e) => setChildren(Number(e.target.value))}
                        className="w-full text-xs font-mono bg-black border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Total</label>
                      <input
                        type="text"
                        readOnly
                        value={Number(adults) + Number(children)}
                        className="w-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg px-2.5 py-1.5 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Meal Preferences */}
            {activeTab === 'meal' && (
              <div className="space-y-4 animate-fade">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Meal Preference Option</label>
                  <select
                    disabled={!isEditable}
                    value={mealType}
                    onChange={(e: any) => setMealType(e.target.value)}
                    className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer"
                  >
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="kids_meal">Kids Meal</option>
                    <option value="custom">Custom Spec</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Food Allergies / Intolerances</label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Peanuts, Dairy-free..."
                    className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Dietary Special Notes</label>
                  <textarea
                    rows={2}
                    disabled={!isEditable}
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                    placeholder="Any specific catering instructions..."
                    className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: Special Requirements */}
            {activeTab === 'special' && (
              <div className="space-y-4 animate-fade">
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 p-2.5 rounded bg-[#090909]/40 border border-zinc-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={wheelchair}
                      onChange={(e) => setWheelchair(e.target.checked)}
                      className="w-4 h-4 accent-[#D4AF37] rounded border-zinc-700 bg-black"
                    />
                    <div>
                      <span className="font-semibold block text-[10px] text-zinc-300">Wheelchair Access</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded bg-[#090909]/40 border border-zinc-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={senior}
                      onChange={(e) => setSenior(e.target.checked)}
                      className="w-4 h-4 accent-[#D4AF37] rounded border-zinc-700 bg-black"
                    />
                    <div>
                      <span className="font-semibold block text-[10px] text-zinc-300">Senior Citizen care</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded bg-[#090909]/40 border border-zinc-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={infant}
                      onChange={(e) => setInfant(e.target.checked)}
                      className="w-4 h-4 accent-[#D4AF37] rounded border-zinc-700 bg-black"
                    />
                    <div>
                      <span className="font-semibold block text-[10px] text-zinc-300">Infant Amenities</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded bg-[#090909]/40 border border-zinc-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={parking}
                      onChange={(e) => setParking(e.target.checked)}
                      className="w-4 h-4 accent-[#D4AF37] rounded border-zinc-700 bg-black"
                    />
                    <div>
                      <span className="font-semibold block text-[10px] text-zinc-300">Parking Required</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded bg-[#090909]/40 border border-zinc-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={accommodation}
                      onChange={(e) => setAccommodation(e.target.checked)}
                      className="w-4 h-4 accent-[#D4AF37] rounded border-zinc-700 bg-black"
                    />
                    <div>
                      <span className="font-semibold block text-[10px] text-zinc-300">Lodging / Accommodation</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded bg-[#090909]/40 border border-zinc-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditable}
                      checked={transport}
                      onChange={(e) => setTransport(e.target.checked)}
                      className="w-4 h-4 accent-[#D4AF37] rounded border-zinc-700 bg-black"
                    />
                    <div>
                      <span className="font-semibold block text-[10px] text-zinc-300">Shuttle / Transport</span>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Custom Notes / Special Instructions</label>
                  <textarea
                    rows={2}
                    disabled={!isEditable}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Enter any other requirements..."
                    className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: Activity Timeline */}
            {activeTab === 'timeline' && (
              <div className="space-y-4 animate-fade py-2">
                <div className="relative border-l-2 border-[#D4AF37]/20 ml-3 pl-5 space-y-5">
                  
                  {/* Sent Step */}
                  <div className="relative">
                    <span className={`absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 ${
                      invSent ? 'bg-[#D4AF37] border-[#090909]' : 'bg-[#090909] border-zinc-800'
                    }`} />
                    <span className="font-semibold block text-zinc-200">Invitation Card Sent</span>
                    <span className="text-[9px] text-zinc-500">
                      {selectedRsvp.invitationInfo?.sentAt 
                        ? new Date(selectedRsvp.invitationInfo.sentAt).toLocaleString() 
                        : 'Unsent status'}
                    </span>
                  </div>

                  {/* Viewed Step */}
                  <div className="relative">
                    <span className={`absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 ${
                      invViewed ? 'bg-[#D4AF37] border-[#090909]' : 'bg-[#090909] border-zinc-800'
                    }`} />
                    <span className="font-semibold block text-zinc-200">Invitation Viewed</span>
                    <span className="text-[9px] text-zinc-500">
                      {selectedRsvp.invitationInfo?.viewedAt 
                        ? new Date(selectedRsvp.invitationInfo.viewedAt).toLocaleString() 
                        : 'Not viewed yet'}
                    </span>
                  </div>

                  {/* Custom RSVP Timeline list from DB */}
                  {selectedRsvp.timeline?.map((ev, index) => (
                    <div key={index} className="relative">
                      <span className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 bg-[#0F6D5B] border-2 border-[#090909] rounded-full" />
                      <span className="font-semibold block text-zinc-200 capitalize">{ev.type.replace('_', ' ')}</span>
                      <span className="text-[9px] text-zinc-500">{ev.description} • {new Date(ev.timestamp).toLocaleString()}</span>
                    </div>
                  ))}

                  {/* Future timeline checked in preview */}
                  <div className="relative opacity-40">
                    <span className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 bg-zinc-900 border-2 border-zinc-800 rounded-full" />
                    <span className="font-semibold block text-zinc-500">Checked In (Future Day of Event)</span>
                    <span className="text-[8px] tracking-wider text-[#D4AF37]/75 font-semibold bg-zinc-950 px-1 py-0.2 rounded border border-zinc-800 uppercase inline-block mt-0.5">COMING SOON</span>
                  </div>
                </div>
              </div>
            )}

            {/* Save / Close Actions */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-[#D4AF37]/10">
              <button
                type="button"
                onClick={() => setSelectedRsvp(null)}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs transition uppercase font-bold"
              >
                Close Drawer
              </button>
              {isEditable && activeTab !== 'timeline' && (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                  className="py-2 px-5 text-xs font-bold uppercase tracking-wider"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default RsvpDetails;
