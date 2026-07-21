import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Clock, 
  Send, 
  CheckSquare, 
  Users, 
  Utensils, 
  FileText, 
  Star, 
  Search, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { Guest } from '@project-ra/types';
import { useRsvps, useActivityLogs, useWeddingSettings } from '@project-ra/shared';
import { toast } from 'react-hot-toast';

interface GuestProfileViewProps {
  guest: Guest;
  onClose: () => void;
}

export const GuestProfileView: React.FC<GuestProfileViewProps> = ({ guest, onClose }) => {
  const { rsvps } = useRsvps();
  const { logs, addGuestTimelineLog } = useActivityLogs();
  const { settings } = useWeddingSettings();

  const [activeTab, setActiveTab] = useState<'overview' | 'rsvp' | 'attendance' | 'hospitality' | 'timeline'>('overview');

  // Timeline filters & search
  const [timelineSearch, setTimelineSearch] = useState('');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'invitation' | 'rsvp' | 'attendance' | 'hospitality' | 'system' | 'note'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Manual Custom Note state
  const [noteText, setNoteText] = useState('');
  const [pinNote, setPinNote] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Match RSVP payload for guest
  const rsvp = rsvps.find(r => r.guestId === guest.id);

  // Filter logs for this specific guest
  const guestLogs = logs.filter(log => log.guestId === guest.id);

  // Filter & Search timeline logs
  const filteredLogs = guestLogs.filter(log => {
    const matchesSearch = 
      (log.title || '').toLowerCase().includes(timelineSearch.toLowerCase()) ||
      (log.description || '').toLowerCase().includes(timelineSearch.toLowerCase()) ||
      (log.user || '').toLowerCase().includes(timelineSearch.toLowerCase());

    const matchesCategory = timelineFilter === 'all' || log.category === timelineFilter;

    return matchesSearch && matchesCategory;
  });

  // Extract pinned notes
  const pinnedNotes = guestLogs.filter(log => log.isPinned && log.category === 'note');

  // Handle adding custom timeline note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsAddingNote(true);
    try {
      const operator = 'admin@projectra.com'; // Default system operator

      await addGuestTimelineLog(
        guest.id,
        'Custom Note Added',
        pinNote ? '⭐ Pinned Note Added' : 'Custom Note Added',
        noteText.trim(),
        '',
        '',
        operator,
        'note',
        pinNote
      );

      toast.success(pinNote ? 'Pinned Note Added' : 'Timeline Note Added');
      setNoteText('');
      setPinNote(false);
    } catch {
      toast.error('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  // Get timeline icons
  const getTimelineIcon = (category?: string) => {
    switch (category) {
      case 'system':
        return <Settings className="text-zinc-500 w-4 h-4" />;
      case 'invitation':
        return <Send className="text-sky-400 w-4 h-4" />;
      case 'rsvp':
        return <CheckSquare className="text-emerald-400 w-4 h-4" />;
      case 'attendance':
        return <Users className="text-amber-400 w-4 h-4" />;
      case 'hospitality':
        return <Utensils className="text-[#D4AF37] w-4 h-4" />;
      case 'note':
        return <FileText className="text-purple-400 w-4 h-4" />;
      default:
        return <Clock className="text-zinc-400 w-4 h-4" />;
    }
  };

  // Helper status badge styles
  const getRsvpBadge = (rsvpStatus?: string) => {
    switch (rsvpStatus) {
      case 'attending':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'declined':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'maybe':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border border-zinc-700/50';
    }
  };

  return (
    <div className="space-y-6 font-poppins text-xs text-[#F5F5F5] select-none max-h-[85vh] overflow-y-auto pr-1">
      
      {/* Header Cards Summary */}
      <div className="p-4 rounded-xl bg-[#090909]/60 border border-[#D4AF37]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-cinzel text-[#D4AF37] font-bold tracking-wider">{guest.name}</h2>
          <p className="text-[10px] text-zinc-500 uppercase mt-0.5 tracking-widest font-semibold">
            {guest.familyName || 'General Guest'} • Side: <span className="text-zinc-300">{guest.side}</span>
          </p>
        </div>
        
        <div className="flex gap-2">
          <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full ${getRsvpBadge(guest.rsvpStatus)}`}>
            {guest.rsvpStatus || 'Pending'}
          </span>
          {pinnedNotes.length > 0 && (
            <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full bg-amber-500/15 border border-amber-500/30 text-[#D4AF37] flex items-center gap-1">
              <Star size={10} className="fill-[#D4AF37]" />
              <span>Pinned Notes</span>
            </span>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-zinc-800/80 gap-1 overflow-x-auto pb-px">
        {[
          { key: 'overview', label: 'Overview', icon: User },
          { key: 'rsvp', label: 'RSVP Info', icon: Send },
          { key: 'attendance', label: 'Attendance', icon: Users },
          { key: 'hospitality', label: 'Hospitality', icon: Utensils },
          { key: 'timeline', label: 'Timeline History', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-[10px] font-bold uppercase tracking-wider transition ${
                isActive 
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5 font-semibold' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={12} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-4 animate-fade min-h-[220px]">
        
        {/* PANEL 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-zinc-800/80 space-y-3.5">
              <h3 className="font-cinzel text-[#D4AF37] font-bold tracking-wider text-[10px] uppercase border-b border-zinc-900 pb-1.5">Contact Details</h3>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-zinc-500 block text-[9px] uppercase tracking-wider mb-0.5">Phone Number</span>
                  <span className="font-mono text-zinc-200">{guest.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[9px] uppercase tracking-wider mb-0.5">WhatsApp</span>
                  <span className="font-mono text-zinc-200">{guest.whatsApp || '—'}</span>
                </div>
                <div className="col-span-2 pt-1">
                  <span className="text-zinc-500 block text-[9px] uppercase tracking-wider mb-0.5">Mailing Address</span>
                  <span className="text-zinc-200">{guest.address || '—'}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-zinc-800/80 space-y-3.5">
              <h3 className="font-cinzel text-[#D4AF37] font-bold tracking-wider text-[10px] uppercase border-b border-zinc-900 pb-1.5">Affiliation & Remarks</h3>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-zinc-500 block text-[9px] uppercase tracking-wider mb-0.5">Relationship</span>
                  <span className="text-[#F5F5F5]">{guest.relation || '—'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[9px] uppercase tracking-wider mb-0.5">Invitation Size</span>
                  <span className="font-mono text-[#F5F5F5]">{guest.membersCount || 1} Guests</span>
                </div>
                <div className="col-span-2 pt-1">
                  <span className="text-zinc-500 block text-[9px] uppercase tracking-wider mb-0.5">General Comments</span>
                  <span className="text-zinc-300 italic">{guest.notes || 'No notes written.'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: RSVP INFO */}
        {activeTab === 'rsvp' && (
          <div className="glass-panel p-4 rounded-xl border border-zinc-800/80 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2">
              <Send size={13} className="text-[#D4AF37]" />
              <h3 className="font-cinzel text-[#D4AF37] font-bold tracking-wider text-[10px] uppercase">Invitation & Delivery State</h3>
            </div>

            {rsvp ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-black/40 border border-zinc-900 rounded-xl space-y-1 text-center">
                  <span className="text-zinc-500 uppercase text-[8px] tracking-wider font-semibold">Delivery Type</span>
                  <span className="block capitalize font-bold text-sm text-zinc-200">{rsvp.invitationInfo?.type}</span>
                </div>
                
                <div className="p-3 bg-black/40 border border-zinc-900 rounded-xl space-y-1 text-center">
                  <span className="text-zinc-500 uppercase text-[8px] tracking-wider font-semibold">Dispatched State</span>
                  <span className={`block font-bold text-xs ${rsvp.invitationInfo?.sent ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {rsvp.invitationInfo?.sent ? 'Sent ✓' : 'Unsent'}
                  </span>
                </div>

                <div className="p-3 bg-black/40 border border-zinc-900 rounded-xl space-y-1 text-center">
                  <span className="text-zinc-500 uppercase text-[8px] tracking-wider font-semibold">Delivered State</span>
                  <span className={`block font-bold text-xs ${rsvp.invitationInfo?.delivered ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {rsvp.invitationInfo?.delivered ? 'Delivered ✓' : 'Pending'}
                  </span>
                </div>

                <div className="p-3 bg-black/40 border border-zinc-900 rounded-xl space-y-1 text-center">
                  <span className="text-zinc-500 uppercase text-[8px] tracking-wider font-semibold">Viewed Link</span>
                  <span className={`block font-bold text-xs ${rsvp.invitationInfo?.viewed ? 'text-[#D4AF37]' : 'text-zinc-600'}`}>
                    {rsvp.invitationInfo?.viewed ? 'Viewed ✓' : 'Unopened'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 text-center py-6">No RSVP Invitation parameters found.</p>
            )}
          </div>
        )}

        {/* PANEL 3: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Counts & Status */}
            <div className="glass-panel p-4 rounded-xl border border-zinc-800/80 space-y-3.5">
              <h3 className="font-cinzel text-[#D4AF37] font-bold tracking-wider text-[10px] uppercase border-b border-zinc-900 pb-1.5">Roster Ratios</h3>
              {rsvp?.attendance ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-black/40 rounded border border-zinc-900">
                      <span className="text-zinc-500 text-[8.5px] uppercase tracking-wider block">Adults</span>
                      <strong className="text-sm font-mono text-zinc-200">{rsvp.attendance.adults}</strong>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-zinc-900">
                      <span className="text-zinc-500 text-[8.5px] uppercase tracking-wider block">Children</span>
                      <strong className="text-sm font-mono text-zinc-200">{rsvp.attendance.children}</strong>
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-zinc-900">
                      <span className="text-zinc-500 text-[8.5px] uppercase tracking-wider block">Infants</span>
                      <strong className="text-sm font-mono text-zinc-200">{rsvp.attendance.infants}</strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span>Attendance Status badge:</span>
                    <span className={`px-2 py-0.5 text-[8.5px] font-bold uppercase rounded ${getRsvpBadge(rsvp.attendance.status)}`}>
                      {rsvp.attendance.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] border-t border-zinc-900 pt-2.5">
                    <span>Planning completion:</span>
                    <strong className="text-[#D4AF37] font-mono">{rsvp.attendance.completion}%</strong>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-4">No Attendance records initialized yet.</p>
              )}
            </div>

            {/* Configured events checklist */}
            <div className="glass-panel p-4 rounded-xl border border-zinc-800/80 space-y-3.5">
              <h3 className="font-cinzel text-[#D4AF37] font-bold tracking-wider text-[10px] uppercase border-b border-zinc-900 pb-1.5">Attending Events</h3>
              {rsvp?.attendance ? (
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 text-[11px]">
                  {settings?.events?.map(e => {
                    const attending = rsvp.attendance?.events.includes(e.id);
                    return (
                      <div key={e.id} className="flex justify-between items-center py-1.5 border-b border-zinc-900/40">
                        <span className="font-medium text-zinc-300">{e.name}</span>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          attending ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-900 text-zinc-600'
                        }`}>
                          {attending ? 'Attending ✓' : 'No'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-4">No ceremonies matching.</p>
              )}
            </div>

          </div>
        )}

        {/* PANEL 4: HOSPITALITY */}
        {activeTab === 'hospitality' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Catering & Special Needs */}
            <div className="glass-panel p-4 rounded-xl border border-zinc-800/80 space-y-3.5">
              <h3 className="font-cinzel text-[#D4AF37] font-bold tracking-wider text-[10px] uppercase border-b border-zinc-900 pb-1.5">Meals & Diet Details</h3>
              {rsvp?.hospitality ? (
                <div className="space-y-3 text-[11px] text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Meal Preference:</span>
                    <span className="capitalize font-semibold text-zinc-200">
                      {rsvp.hospitality.mealPreference.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Allergies Checklist:</span>
                    <span className="text-[#D4AF37] font-semibold">
                      {rsvp.hospitality.dietaryRestrictions.length > 0 ? rsvp.hospitality.dietaryRestrictions.join(', ') : 'None'}
                    </span>
                  </div>

                  {rsvp.hospitality.dietaryRestrictionsCustom && (
                    <div className="p-2 bg-black/40 border border-zinc-900 rounded-lg">
                      <span className="text-zinc-500 block text-[9.5px] uppercase tracking-wider mb-0.5">Remarks Notes</span>
                      <span className="text-zinc-300">{rsvp.hospitality.dietaryRestrictionsCustom}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-4">No hospitality options details stored.</p>
              )}
            </div>

            {/* Lodging & Transport */}
            <div className="glass-panel p-4 rounded-xl border border-zinc-800/80 space-y-3.5">
              <h3 className="font-cinzel text-[#D4AF37] font-bold tracking-wider text-[10px] uppercase border-b border-zinc-900 pb-1.5">Lodging & Transport</h3>
              {rsvp?.hospitality ? (
                <div className="space-y-3 text-[11px] text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Rooms Required:</span>
                    <span className="font-bold font-mono">
                      {rsvp.hospitality.accommodation?.requiresAccommodation ? `${rsvp.hospitality.accommodation.numberOfRooms} Room(s)` : 'No'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">Shuttle Pickup:</span>
                    <span className="text-zinc-200">
                      {rsvp.hospitality.transport?.requiresPickup ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">Parking Spot Reserved:</span>
                    <span className="text-zinc-200">
                      {rsvp.hospitality.transport?.parkingRequired ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-4">No logistics data initialized.</p>
              )}
            </div>

          </div>
        )}

        {/* PANEL 5: TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            
            {/* Add Custom Timeline Note form (C.5) */}
            <form onSubmit={handleAddNote} className="glass-panel p-4 rounded-xl border border-zinc-800/80 space-y-3">
              <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-1.5">
                <FileText size={13} className="text-[#D4AF37]" />
                <h4 className="font-cinzel text-[#D4AF37] font-bold tracking-wider text-[10px] uppercase">Add Timeline internal Note</h4>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Bride's cousin requested front-row seating / Vegetarian confirmed over phone..."
                  className="w-full text-xs bg-black border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 text-[#F5F5F5] rounded-lg px-2.5 py-2 focus:outline-none transition"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white transition">
                    <input
                      type="checkbox"
                      checked={pinNote}
                      onChange={(e) => setPinNote(e.target.checked)}
                      className="accent-[#D4AF37] w-3.5 h-3.5"
                    />
                    <span className="text-[10px]">Pin note to top of timeline profile</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isAddingNote || !noteText.trim()}
                    className="px-4 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#F3E7C4] text-[#090909] font-bold transition text-[9px] uppercase tracking-wider disabled:opacity-40"
                  >
                    {isAddingNote ? 'Saving...' : 'Add Note'}
                  </button>
                </div>
              </div>
            </form>

            {/* Pinned Notes Roster section */}
            {pinnedNotes.length > 0 && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#D4AF37] block">Pinned Notes</span>
                <div className="space-y-1.5">
                  {pinnedNotes.map((note) => (
                    <div key={note.id} className="p-2 bg-black/40 rounded border border-amber-500/10 flex justify-between items-start gap-2">
                      <div>
                        <span className="text-amber-400 block font-semibold text-[10.5px]">⭐ {note.description}</span>
                        <span className="text-[8px] text-zinc-500 block mt-0.5">By {note.user} on {new Date(note.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Log Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 select-none text-[10px]">
              <div className="relative col-span-2">
                <Search size={12} className="absolute left-2.5 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search timeline notes, users..."
                  value={timelineSearch}
                  onChange={(e) => setTimelineSearch(e.target.value)}
                  className="w-full bg-[#090909]/95 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-2 focus:outline-none focus:border-[#D4AF37]/50 text-white"
                />
              </div>

              <div>
                <select
                  value={timelineFilter}
                  onChange={(e: any) => setTimelineFilter(e.target.value)}
                  className="w-full bg-[#090909]/95 border border-zinc-800 rounded-lg px-2 py-2 focus:outline-none focus:border-[#D4AF37]/50 text-[#F5F5F5] font-poppins capitalize cursor-pointer"
                >
                  <option value="all">All Category Events</option>
                  <option value="invitation">Invitations</option>
                  <option value="rsvp">RSVP</option>
                  <option value="attendance">Attendance</option>
                  <option value="hospitality">Hospitality</option>
                  <option value="system">System logs</option>
                  <option value="note">Notes</option>
                </select>
              </div>
            </div>

            {/* Vertical timeline flow layout */}
            <div className="relative border-l border-[#D4AF37]/20 pl-4 ml-2 space-y-5 py-2">
              {filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                const formattedDate = new Date(log.timestamp).toLocaleDateString();
                const formattedTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={log.id} className="relative group transition-all duration-300">
                    
                    {/* Node Dot Icon */}
                    <div className="absolute -left-[25px] top-1 bg-zinc-950 border border-[#D4AF37]/30 p-1 rounded-full flex items-center justify-center group-hover:border-[#D4AF37] group-hover:shadow-[0_0_10px_rgba(212,175,55,0.2)] transition duration-300">
                      {getTimelineIcon(log.category)}
                    </div>

                    {/* Timeline Node block card */}
                    <div className="bg-[#141414]/30 hover:bg-[#141414]/65 border border-zinc-800/80 hover:border-[#D4AF37]/20 rounded-xl p-3.5 space-y-1.5 transition-all duration-300 shadow-sm relative overflow-hidden group">
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-zinc-200">{log.title || log.action}</h5>
                          <span className="text-[8.5px] text-zinc-500 block font-semibold uppercase tracking-wider mt-0.5">
                            Performed By: {log.user}
                          </span>
                        </div>

                        <span className="text-[9px] text-[#D4AF37] font-mono whitespace-nowrap bg-[#D4AF37]/5 px-2 py-0.5 rounded border border-[#D4AF37]/10">
                          {formattedDate} • {formattedTime}
                        </span>
                      </div>

                      <p className="text-[10.5px] text-zinc-300 font-poppins leading-normal">{log.description || log.details}</p>

                      {/* Expandable previous/new values */}
                      {(log.previousValue || log.newValue) && (
                        <div className="pt-1 select-none">
                          <button
                            type="button"
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="flex items-center gap-1 text-[8.5px] text-[#D4AF37] uppercase tracking-wider font-bold hover:text-white transition"
                          >
                            <span>{isExpanded ? 'Hide comparative details' : 'Expand detailed changes'}</span>
                            {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>

                          {isExpanded && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-900/80 animate-fade">
                              <div className="p-2 bg-black/45 rounded border border-zinc-900/60 font-mono text-[9px] max-h-[140px] overflow-auto">
                                <span className="text-rose-400 font-bold block mb-1 uppercase tracking-wide text-[8px]">Previous Value:</span>
                                <pre className="whitespace-pre-wrap">{log.previousValue || '(None)'}</pre>
                              </div>
                              <div className="p-2 bg-black/45 rounded border border-zinc-900/60 font-mono text-[9px] max-h-[140px] overflow-auto">
                                <span className="text-emerald-400 font-bold block mb-1 uppercase tracking-wide text-[8px]">New Value:</span>
                                <pre className="whitespace-pre-wrap">{log.newValue || '(None)'}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
              {filteredLogs.length === 0 && (
                <p className="text-center py-6 text-zinc-500 font-poppins ml-2">
                  No timeline history matching current filter criteria.
                </p>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Profile Close Actions */}
      <div className="flex justify-end pt-4 border-t border-zinc-900">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs transition uppercase font-bold tracking-wider"
        >
          Close Profile
        </button>
      </div>

    </div>
  );
};

export default GuestProfileView;
