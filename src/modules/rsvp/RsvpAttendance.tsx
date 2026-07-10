import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  AlertCircle,
  Save,
  Calendar,
  Users,
  Compass,
  Smile,
  Shield,
  Heart,
  Accessibility
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';
import { useGuests } from '../../hooks/useGuests';
import { useRsvps } from '../../hooks/useRsvps';
import { useWeddingSettings } from '../../hooks/useWeddingSettings';
import { useUserProfile } from '../../hooks/useUserProfile';
import { RsvpEntry, RsvpAttendance } from '../../repositories/RsvpRepository';
import { Guest } from '../../types/guest';
import RsvpRepository from '../../repositories/RsvpRepository';

const rsvpRepo = new RsvpRepository();

export const RsvpAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const { guests, loading: guestsLoading } = useGuests();
  const { rsvps, loading: rsvpsLoading, saveRsvp } = useRsvps();
  const { settings, loading: settingsLoading } = useWeddingSettings();
  const { profile: currentUserProfile, loading: profileLoading } = useUserProfile();

  const currentUserRole = currentUserProfile?.role || 'owner';
  const isEditable = currentUserRole === 'owner' || currentUserRole === 'admin';

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'attending' | 'not-attending' | 'maybe'>('all');

  // Selected RSVP detail
  const [selectedRsvp, setSelectedRsvp] = useState<RsvpEntry | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Form states
  const [status, setStatus] = useState<'pending' | 'attending' | 'not-attending' | 'maybe'>('pending');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [specialAttendance, setSpecialAttendance] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to load/build default RSVP
  const getRsvpForGuest = (guest: Guest): RsvpEntry => {
    const existing = rsvps.find(r => r.guestId === guest.id);
    if (existing) return existing;
    return rsvpRepo.createDefaultRsvp(guest.id, guest.name, guest.familyName, guest.invitationType || 'digital');
  };

  const handleOpenAttendance = (guest: Guest) => {
    const rsvp = getRsvpForGuest(guest);
    setSelectedRsvp(rsvp);
    setSelectedGuest(guest);

    const att = rsvp.attendance || {
      status: 'pending',
      adults: rsvp.membersAttending?.adults ?? 1,
      children: rsvp.membersAttending?.children ?? 0,
      infants: 0,
      events: [],
      specialAttendance: [],
      completion: 20
    };

    setStatus(att.status);
    setAdults(att.adults ?? 1);
    setChildren(att.children ?? 0);
    setInfants(att.infants ?? 0);
    setSelectedEvents(att.events || []);
    setSpecialAttendance(att.specialAttendance || []);
  };

  // Completion calculation logic (Sprint C.3)
  const calculateCompletion = (): { percentage: number; missing: string[] } => {
    if (status === 'not-attending') {
      return { percentage: 100, missing: [] };
    }
    
    let score = 0;
    const missing: string[] = [];

    // 1. Status defined
    if (status !== 'pending') {
      score += 30;
    } else {
      missing.push('Attendance Status');
    }

    // 2. Adults count validated
    if (adults > 0) {
      score += 30;
    } else {
      missing.push('Adults Count');
    }

    // 3. Children evaluated
    if (children === 0 && status === 'attending') {
      missing.push('Children Count confirmation');
    }

    // 4. Events checked
    if (status === 'attending' && selectedEvents.length > 0) {
      score += 25;
    } else if (status === 'attending') {
      missing.push('Event Selection');
    } else {
      // Not attending / Maybe automatically gets event points or pending skips
      score += 25;
    }

    // 5. Special attendance section evaluated
    score += 15; // special attendance fields confirmed (empty is valid)

    return { percentage: score, missing };
  };

  const { percentage: completionPercent, missing: missingDetails } = calculateCompletion();

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRsvp || !selectedGuest) return;
    if (!isEditable) {
      toast.error('You do not have permission to modify attendance');
      return;
    }

    // Validate headcount doesn't exceed invitation limit
    const totalHead = Number(adults) + Number(children) + Number(infants);
    const inviteLimit = selectedGuest.membersCount || 1;
    if (status === 'attending' && totalHead > inviteLimit) {
      toast.error(`Validation Error: Guest count (${totalHead}) exceeds invitation limit of ${inviteLimit}!`);
      return;
    }

    setIsSaving(true);
    try {
      const operator = currentUserProfile?.displayName || currentUserProfile?.email || 'Admin';
      const prevAtt = selectedRsvp.attendance;

      const updatedPayload: RsvpEntry = {
        ...selectedRsvp,
        // Keep status synced back to top level
        status: status === 'attending' ? 'accepted' : status === 'not-attending' ? 'declined' : status,
        membersAttending: {
          adults: Number(adults),
          children: Number(children),
          total: Number(adults) + Number(children)
        },
        attendance: {
          status,
          adults: Number(adults),
          children: Number(children),
          infants: Number(infants),
          events: selectedEvents,
          specialAttendance,
          completion: completionPercent,
          updatedAt: new Date().toISOString(),
          updatedBy: operator
        }
      };

      await saveRsvp(updatedPayload, operator);

      // Trigger C.3 Activity logs toasts & messages
      if (!prevAtt || prevAtt.status !== status) {
        toast.success('Attendance Updated');
      }
      if (!prevAtt || prevAtt.adults !== adults || prevAtt.children !== children || prevAtt.infants !== infants) {
        toast.success('Guest Count Changed');
      }
      if (!prevAtt || JSON.stringify(prevAtt.events) !== JSON.stringify(selectedEvents)) {
        toast.success('Event Selection Changed');
      }

      toast.success('Attendance Preferences Saved Successfully');
      setSelectedRsvp(null);
    } catch {
      toast.error('Failed to update attendance values');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper toggle event
  const toggleEventSelection = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter(id => id !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  // Helper toggle special attendance
  const toggleSpecialAttendance = (item: string) => {
    if (specialAttendance.includes(item)) {
      setSpecialAttendance(specialAttendance.filter(i => i !== item));
    } else {
      setSpecialAttendance([...specialAttendance, item]);
    }
  };

  // Render progress bar blocks
  const renderProgressIndicator = (percent: number) => {
    const barsCount = Math.round(percent / 10);
    const filled = '█'.repeat(barsCount);
    const empty = '░'.repeat(10 - barsCount);
    return (
      <span className="font-mono text-zinc-400">
        {filled}{empty} {percent}%
      </span>
    );
  };

  // Status badges styling
  const getStatusBadge = (statusVal: RsvpAttendance['status']) => {
    switch (statusVal) {
      case 'pending':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700/50';
      case 'attending':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'not-attending':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'maybe':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  // Filter list matching search & filters
  const filteredGuests = guests.filter(guest => {
    const r = getRsvpForGuest(guest);
    const att = r.attendance || { status: 'pending' };

    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (guest.familyName || 'General').toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && att.status === statusFilter;
  });

  if (guestsLoading || rsvpsLoading || settingsLoading || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 space-y-3 font-poppins">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Loading Attendance Planning details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-poppins relative">
      
      {/* Header block */}
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
            Attendance Planning
          </h1>
          <p className="text-xs text-[#F5F5F5]/50">
            Confirm check-in metrics, dynamic wedding ceremony selections, headcounts (adults/children/infants), and track attendance data completeness.
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
            <option value="all">All Attendance Statuses</option>
            <option value="pending">Pending (Gray)</option>
            <option value="attending">Attending (Green)</option>
            <option value="not-attending">Not Attending (Red)</option>
            <option value="maybe">Maybe (Amber)</option>
          </select>
        </div>
      </div>

      {/* Roster Table Console */}
      <Card className="p-0 border border-[#D4AF37]/10 overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse font-poppins">
            <thead>
              <tr className="border-b border-[#D4AF37]/10 bg-[#090909]/40 text-[#D4AF37] uppercase tracking-wider text-[10px] font-semibold">
                <th className="p-3.5">Guest Name</th>
                <th className="p-3.5">Family Group</th>
                <th className="p-3.5">Attendance Status</th>
                <th className="p-3.5">Headcount (A/C/I)</th>
                <th className="p-3.5">Events Attending</th>
                <th className="p-3.5">Planning Progress</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/5 text-zinc-300">
              {filteredGuests.map((guest) => {
                const r = getRsvpForGuest(guest);
                const att = r.attendance || {
                  status: 'pending',
                  adults: 1,
                  children: 0,
                  infants: 0,
                  events: [],
                  specialAttendance: [],
                  completion: 20
                };

                const totalCount = (att.adults ?? 1) + (att.children ?? 0) + (att.infants ?? 0);

                return (
                  <tr key={guest.id} className="hover:bg-[#141414]/25 transition duration-150 group">
                    <td className="p-3.5 font-semibold text-zinc-200">{guest.name}</td>
                    <td className="p-3.5 text-[#F5F5F5]/65">{guest.familyName || 'General'}</td>
                    <td className="p-3.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(att.status)}`}>
                        {att.status === 'not-attending' ? 'Not Attending' : att.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-zinc-300">
                      {att.status === 'not-attending' ? 0 : `${att.adults ?? 1}A / ${att.children ?? 0}C / ${att.infants ?? 0}I`} (Total: {att.status === 'not-attending' ? 0 : totalCount})
                    </td>
                    <td className="p-3.5 text-zinc-400 font-mono text-[10px]">
                      {att.status === 'not-attending' ? '—' : `${att.events?.length || 0} configured`}
                    </td>
                    <td className="p-3.5">
                      {renderProgressIndicator(att.completion ?? 20)}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenAttendance(guest)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-[#D4AF37]/40 text-[#D4AF37] hover:bg-zinc-800 transition text-[10px] font-bold uppercase tracking-wider"
                      >
                        Manage Attendance
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-zinc-500 font-poppins">
                    No matching guests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Attendance Drawer / Modal */}
      <Modal isOpen={selectedRsvp !== null} onClose={() => setSelectedRsvp(null)} title={selectedRsvp ? `Manage Attendance — ${selectedRsvp.guestName}` : 'Attendance Settings'}>
        {selectedRsvp && selectedGuest && (
          <form onSubmit={handleSaveAttendance} className="space-y-6 text-xs font-poppins max-h-[85vh] overflow-y-auto pr-1">
            
            {/* Split layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
              
              {/* Left Column Forms */}
              <div className="space-y-4">
                
                {/* SECTION 1: Attendance Status Card */}
                <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/10 space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-[#D4AF37]/5 pb-2">
                    <CheckCircle2 size={14} className="text-[#D4AF37]" />
                    <h4 className="font-cinzel font-bold text-[10px] uppercase tracking-wider text-[#D4AF37]">Attendance Status</h4>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Status Selection Option</label>
                    <select
                      disabled={!isEditable}
                      value={status}
                      onChange={(e: any) => setStatus(e.target.value)}
                      className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer capitalize font-semibold"
                    >
                      <option value="pending">Pending (Gray Badge)</option>
                      <option value="attending">Attending (Green Badge)</option>
                      <option value="not-attending">Not Attending (Red Badge)</option>
                      <option value="maybe">Maybe (Amber Badge)</option>
                    </select>
                  </div>
                </div>

                {/* SECTION 2: Guest Count Card */}
                <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/10 space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-[#D4AF37]/5 pb-2">
                    <Users size={14} className="text-[#D4AF37]" />
                    <h4 className="font-cinzel font-bold text-[10px] uppercase tracking-wider text-[#D4AF37]">Attending Guest Counts</h4>
                  </div>

                  {status === 'not-attending' ? (
                    <div className="p-3 bg-rose-500/5 rounded-lg border border-rose-500/10 text-rose-400 font-semibold text-[10px] text-center">
                      Guest is marked as Not Attending. Counts are locked at zero.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Adults *</label>
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
                          <label className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-0.5">Infants</label>
                          <input
                            type="number"
                            min={0}
                            disabled={!isEditable}
                            value={infants}
                            onChange={(e) => setInfants(Number(e.target.value))}
                            className="w-full text-xs font-mono bg-black border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-zinc-900/60 text-[10px]">
                        <span className="font-semibold text-zinc-400">Total Headcount:</span>
                        <strong className="text-[#D4AF37] font-mono text-sm">{Number(adults) + Number(children) + Number(infants)}</strong>
                      </div>

                      {/* Headcount validation warning banner */}
                      {(Number(adults) + Number(children) + Number(infants)) > (selectedGuest.membersCount || 1) && (
                        <div className="flex gap-2 p-2.5 rounded bg-rose-500/5 border border-rose-500/10 text-rose-400 text-[9px] leading-normal font-semibold">
                          <AlertCircle size={12} className="shrink-0 mt-0.5" />
                          <span>Validation Alert: Total headcount exceeds the invitation limit of {selectedGuest.membersCount || 1} members configured for this guest.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* SECTION 4: Special Attendance Checkboxes */}
                <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/10 space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-[#D4AF37]/5 pb-2">
                    <Accessibility size={14} className="text-[#D4AF37]" />
                    <h4 className="font-cinzel font-bold text-[10px] uppercase tracking-wider text-[#D4AF37]">Special Attendance Indicators</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {[
                      { key: 'senior', label: 'Senior Citizen' },
                      { key: 'wheelchair', label: 'Wheelchair Req.' },
                      { key: 'pregnant', label: 'Pregnant Guest' },
                      { key: 'infant', label: 'Infant Care' },
                      { key: 'vip', label: 'VIP Status' },
                      { key: 'escort', label: 'Requires Escort' }
                    ].map((opt) => (
                      <label key={opt.key} className="flex items-center gap-2 p-2 rounded bg-black/40 border border-zinc-900/60 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isEditable}
                          checked={specialAttendance.includes(opt.key)}
                          onChange={() => toggleSpecialAttendance(opt.key)}
                          className="accent-[#D4AF37] w-3.5 h-3.5"
                        />
                        <span className="text-zinc-300 truncate">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column Forms */}
              <div className="space-y-4">
                
                {/* SECTION 3: Dynamic Event Selection */}
                <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/10 space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-[#D4AF37]/5 pb-2">
                    <Calendar size={14} className="text-[#D4AF37]" />
                    <h4 className="font-cinzel font-bold text-[10px] uppercase tracking-wider text-[#D4AF37]">Event Ceremony Attendance</h4>
                  </div>

                  {status === 'not-attending' ? (
                    <div className="p-3 bg-rose-500/5 rounded-lg border border-rose-500/10 text-rose-400 font-semibold text-[10px] text-center">
                      Guest is marked as Not Attending. All wedding ceremonies disabled.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {settings?.events && settings.events.map((event) => (
                        <label key={event.id} className="flex items-start gap-2.5 p-2.5 rounded bg-black/40 border border-zinc-900/60 cursor-pointer hover:border-[#D4AF37]/20 transition">
                          <input
                            type="checkbox"
                            disabled={!isEditable}
                            checked={selectedEvents.includes(event.id)}
                            onChange={() => toggleEventSelection(event.id)}
                            className="accent-[#D4AF37] w-4 h-4 mt-0.5"
                          />
                          <div>
                            <span className="font-semibold block text-zinc-200">{event.name}</span>
                            <span className="text-[8.5px] text-zinc-500 font-mono block mt-0.5">
                              {new Date(event.date).toLocaleString()}
                            </span>
                          </div>
                        </label>
                      ))}
                      {(!settings?.events || settings.events.length === 0) && (
                        <div className="text-center py-4 text-zinc-600 font-poppins">
                          No events registered under Wedding Configuration settings.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* SECTION 5: Organizer Summary & Completion Progress */}
                <div className="glass-panel p-4 rounded-xl border border-[#D4AF37]/10 space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-[#D4AF37]/5 pb-2">
                    <Shield size={14} className="text-[#D4AF37]" />
                    <h4 className="font-cinzel font-bold text-[10px] uppercase tracking-wider text-[#D4AF37]">Summary & Completion Progress</h4>
                  </div>

                  {/* Completion bar indicator */}
                  <div className="space-y-1.5 py-1">
                    <span className="text-[10px] font-semibold text-zinc-400 block">Attendance Complete Check</span>
                    <div className="flex items-center justify-between gap-3 bg-black px-3 py-2 rounded-xl border border-zinc-900">
                      {renderProgressIndicator(completionPercent)}
                    </div>
                  </div>

                  {/* Missing fields notices */}
                  {missingDetails.length > 0 && status !== 'not-attending' && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 text-amber-500 rounded-xl space-y-1 text-[9px] leading-normal font-semibold">
                      <span className="uppercase block font-bold text-[#D4AF37] tracking-wider mb-1">Missing Requirements:</span>
                      {missingDetails.map((m, idx) => (
                        <div key={idx} className="flex gap-1 items-center">
                          <span className="w-1 h-1 bg-[#D4AF37] rounded-full shrink-0" />
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Organizer Summary Text */}
                  <div className="text-[10px] text-zinc-400 space-y-2 border-t border-zinc-900/60 pt-3">
                    <div className="flex justify-between">
                      <span>Attending Events:</span>
                      <strong className="text-zinc-200 font-mono">
                        {status === 'not-attending' ? 0 : selectedEvents.length}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total headcount:</span>
                      <strong className="text-zinc-200 font-mono">
                        {status === 'not-attending' ? 0 : (Number(adults) + Number(children) + Number(infants))}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>VIP status:</span>
                      <strong className={specialAttendance.includes('vip') ? 'text-[#D4AF37] font-semibold' : 'text-zinc-500 font-normal'}>
                        {specialAttendance.includes('vip') ? 'Yes (VIP)' : 'Standard'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Escort Required:</span>
                      <strong className="text-zinc-200">
                        {specialAttendance.includes('escort') ? 'Yes' : 'No'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Accessibility Requirements:</span>
                      <strong className="text-zinc-200">
                        {specialAttendance.includes('wheelchair') ? 'Wheelchair Required' : 'None'}
                      </strong>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal actions */}
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
                  disabled={isSaving}
                  variant="primary"
                  className="py-2 px-5 text-xs font-bold uppercase tracking-wider"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              )}
            </div>

          </form>
        )}
      </Modal>

    </div>
  );
};

export default RsvpAttendancePage;
