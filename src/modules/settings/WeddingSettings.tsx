import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  MapPin, 
  Calendar, 
  Layout, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  RefreshCw, 
  Clock, 
  Lock, 
  User, 
  Heart,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';
import { useWeddingSettings } from '../../hooks/useWeddingSettings';
import { useUserProfile } from '../../hooks/useUserProfile';
import { WeddingEvent, WeddingVenue, WeddingSettings as IWeddingSettings } from '../../types/settings';

export const WeddingSettingsPage: React.FC = () => {
  const { settings, loading, saveSettings } = useWeddingSettings();
  const { profile: currentUserProfile, loading: profileLoading } = useUserProfile();

  const currentUserRole = currentUserProfile?.role || 'owner';
  const isEditable = currentUserRole === 'owner' || currentUserRole === 'admin';

  // Tabs state
  const [activeTab, setActiveTab] = useState<'general' | 'events' | 'venues' | 'rsvp'>('general');

  // Form states
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [brideShortName, setBrideShortName] = useState('');
  const [groomShortName, setGroomShortName] = useState('');
  const [brideParentNames, setBrideParentNames] = useState('');
  const [groomParentNames, setGroomParentNames] = useState('');
  const [timezone, setTimezone] = useState('UTC+05:30');
  const [rsvpDeadline, setRsvpDeadline] = useState('');
  const [rsvpOpen, setRsvpOpen] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [primaryColor, setPrimaryColor] = useState('#D4AF37');
  const [secondaryColor, setSecondaryColor] = useState('#0F6D5B');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrLogoUrl, setQrLogoUrl] = useState('');
  const [invitationTitleDefault, setInvitationTitleDefault] = useState('');
  const [invitationWelcomeText, setInvitationWelcomeText] = useState('');
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [venues, setVenues] = useState<WeddingVenue[]>([]);

  // Modals for editing list elements
  const [editingVenue, setEditingVenue] = useState<Partial<WeddingVenue> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<WeddingEvent> | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Initialize
  useEffect(() => {
    if (settings) {
      setBrideName(settings.brideName || '');
      setGroomName(settings.groomName || '');
      setBrideShortName(settings.brideShortName || '');
      setGroomShortName(settings.groomShortName || '');
      setBrideParentNames(settings.brideParentNames || '');
      setGroomParentNames(settings.groomParentNames || '');
      setTimezone(settings.timezone || 'UTC+05:30');
      setRsvpDeadline(settings.rsvpDeadline ? settings.rsvpDeadline.substring(0, 16) : ''); // Format for datetime-local
      setRsvpOpen(settings.rsvpOpen ?? true);
      setTheme(settings.theme || 'dark');
      setPrimaryColor(settings.primaryColor || '#D4AF37');
      setSecondaryColor(settings.secondaryColor || '#0F6D5B');
      setQrCodeUrl(settings.qrCodeUrl || '');
      setQrLogoUrl(settings.qrLogoUrl || '');
      setInvitationTitleDefault(settings.invitationTitleDefault || '');
      setInvitationWelcomeText(settings.invitationWelcomeText || '');
      setEvents(settings.events || []);
      setVenues(settings.venues || []);
    }
  }, [settings]);

  // Check if dirty
  const isDirty = (): boolean => {
    if (!settings) return false;
    return (
      brideName !== (settings.brideName || '') ||
      groomName !== (settings.groomName || '') ||
      brideShortName !== (settings.brideShortName || '') ||
      groomShortName !== (settings.groomShortName || '') ||
      brideParentNames !== (settings.brideParentNames || '') ||
      groomParentNames !== (settings.groomParentNames || '') ||
      timezone !== (settings.timezone || 'UTC+05:30') ||
      rsvpDeadline.substring(0, 16) !== (settings.rsvpDeadline ? settings.rsvpDeadline.substring(0, 16) : '') ||
      rsvpOpen !== (settings.rsvpOpen ?? true) ||
      theme !== (settings.theme || 'dark') ||
      primaryColor !== (settings.primaryColor || '#D4AF37') ||
      secondaryColor !== (settings.secondaryColor || '#0F6D5B') ||
      qrCodeUrl !== (settings.qrCodeUrl || '') ||
      qrLogoUrl !== (settings.qrLogoUrl || '') ||
      invitationTitleDefault !== (settings.invitationTitleDefault || '') ||
      invitationWelcomeText !== (settings.invitationWelcomeText || '') ||
      JSON.stringify(events) !== JSON.stringify(settings.events) ||
      JSON.stringify(venues) !== JSON.stringify(settings.venues)
    );
  };

  const handleCancel = () => {
    if (settings) {
      setBrideName(settings.brideName || '');
      setGroomName(settings.groomName || '');
      setBrideShortName(settings.brideShortName || '');
      setGroomShortName(settings.groomShortName || '');
      setBrideParentNames(settings.brideParentNames || '');
      setGroomParentNames(settings.groomParentNames || '');
      setTimezone(settings.timezone || 'UTC+05:30');
      setRsvpDeadline(settings.rsvpDeadline ? settings.rsvpDeadline.substring(0, 16) : '');
      setRsvpOpen(settings.rsvpOpen ?? true);
      setTheme(settings.theme || 'dark');
      setPrimaryColor(settings.primaryColor || '#D4AF37');
      setSecondaryColor(settings.secondaryColor || '#0F6D5B');
      setQrCodeUrl(settings.qrCodeUrl || '');
      setQrLogoUrl(settings.qrLogoUrl || '');
      setInvitationTitleDefault(settings.invitationTitleDefault || '');
      setInvitationWelcomeText(settings.invitationWelcomeText || '');
      setEvents(settings.events || []);
      setVenues(settings.venues || []);
      toast.success('Configuration reverted');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditable) {
      toast.error('You do not have permission to modify settings.');
      return;
    }

    if (!brideName.trim() || !groomName.trim()) {
      toast.error('Bride and Groom names are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload: IWeddingSettings = {
        id: 'general',
        brideName: brideName.trim(),
        groomName: groomName.trim(),
        brideShortName: brideShortName.trim() || brideName.split(' ')[0],
        groomShortName: groomShortName.trim() || groomName.split(' ')[0],
        brideParentNames: brideParentNames.trim(),
        groomParentNames: groomParentNames.trim(),
        timezone,
        rsvpDeadline,
        rsvpOpen,
        theme,
        primaryColor,
        secondaryColor,
        qrCodeUrl,
        qrLogoUrl,
        invitationTitleDefault,
        invitationWelcomeText,
        events,
        venues
      };

      await saveSettings(payload);
      toast.success('Wedding Configuration Updated Successfully');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save wedding configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Venues crud
  const handleSaveVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenue) return;
    if (!editingVenue.name?.trim()) {
      toast.error('Venue name is required');
      return;
    }

    if (editingVenue.id) {
      // Edit mode
      setVenues(venues.map(v => v.id === editingVenue.id ? (editingVenue as WeddingVenue) : v));
    } else {
      // Add mode
      const newVenue: WeddingVenue = {
        ...(editingVenue as Omit<WeddingVenue, 'id'>),
        id: `v-${Date.now()}`
      };
      setVenues([...venues, newVenue]);
    }
    setEditingVenue(null);
    toast.success('Venue list queued');
  };

  const handleDeleteVenue = (venueId: string) => {
    if (events.some(e => e.venueId === venueId)) {
      toast.error('Cannot delete venue: It is assigned to active events');
      return;
    }
    setVenues(venues.filter(v => v.id !== venueId));
    toast.success('Venue removed from list');
  };

  // Events crud
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    if (!editingEvent.name?.trim()) {
      toast.error('Event name is required');
      return;
    }
    if (!editingEvent.venueId) {
      toast.error('Please assign a venue');
      return;
    }

    if (editingEvent.id) {
      setEvents(events.map(ev => ev.id === editingEvent.id ? (editingEvent as WeddingEvent) : ev));
    } else {
      const newEvent: WeddingEvent = {
        ...(editingEvent as Omit<WeddingEvent, 'id'>),
        id: `ev-${Date.now()}`
      };
      setEvents([...events, newEvent]);
    }
    setEditingEvent(null);
    toast.success('Event details queued');
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(ev => ev.id !== eventId));
    toast.success('Event removed from list');
  };

  if (loading || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 space-y-3 font-poppins">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Loading Centralized Wedding Details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-poppins relative">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D4AF37]/10 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-cinzel text-[#F5F5F5] font-bold tracking-wide">
            Wedding Configuration
          </h1>
          <p className="text-xs text-[#F5F5F5]/50">
            Set centralized details representing the single source of truth for the countdowns, public website, and invites.
          </p>
        </div>
      </div>

      {/* Security alert block */}
      {!isEditable && (
        <div className="glass-panel border-amber-500/20 bg-amber-500/5 p-4 rounded-xl flex items-start gap-3">
          <Lock className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <div>
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Read-Only Form</h4>
            <p className="text-[10px] text-[#F5F5F5]/70 mt-1">
              Your role limits modifications to Workspace Settings. Only Owners and Admins can save changes to wedding details.
            </p>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-zinc-900 pb-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'general' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-zinc-500 hover:text-white'
          }`}
        >
          General Info
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'events' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-zinc-500 hover:text-white'
          }`}
        >
          Events List
        </button>
        <button
          onClick={() => setActiveTab('venues')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'venues' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-zinc-500 hover:text-white'
          }`}
        >
          Venues List
        </button>
        <button
          onClick={() => setActiveTab('rsvp')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'rsvp' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-zinc-500 hover:text-white'
          }`}
        >
          RSVP & Design
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* TAB 1: General details */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade">
            <Card className="p-5 border border-[#D4AF37]/10 space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3">
                <Heart size={16} className="text-[#D4AF37]" />
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Bride & Groom Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Groom Full Name *</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditable}
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    placeholder="e.g. Rozar Khan"
                    className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-40"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Bride Full Name *</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditable}
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    placeholder="e.g. Arifa Khan"
                    className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-40"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Groom Short Name</label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    value={groomShortName}
                    onChange={(e) => setGroomShortName(e.target.value)}
                    placeholder="e.g. Rozar"
                    className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-40"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Bride Short Name</label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    value={brideShortName}
                    onChange={(e) => setBrideShortName(e.target.value)}
                    placeholder="e.g. Arifa"
                    className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Groom Parent Names</label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    value={groomParentNames}
                    onChange={(e) => setGroomParentNames(e.target.value)}
                    placeholder="e.g. J. Peer Mohideen & P. Kather Beevi"
                    className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-40"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Bride Parent Names</label>
                  <input
                    type="text"
                    disabled={!isEditable}
                    value={brideParentNames}
                    onChange={(e) => setBrideParentNames(e.target.value)}
                    placeholder="e.g. A. Mohammed Khan & M. Feroza Begum"
                    className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-40"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3">
                <Clock size={16} className="text-[#D4AF37]" />
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Localization
                </h3>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Default Timezone</label>
                <select
                  disabled={!isEditable}
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-40"
                >
                  <option value="UTC+05:30">UTC+05:30 (Chennai, Kolkata, Mumbai)</option>
                  <option value="UTC+04:00">UTC+04:00 (GST, Gulf Standard)</option>
                  <option value="UTC+00:00">UTC+00:00 (GMT/UTC)</option>
                </select>
              </div>
            </Card>

            <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3">
                <Settings size={16} className="text-[#D4AF37]" />
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Invitation Settings
                </h3>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Default Invitation Title</label>
                <input
                  type="text"
                  disabled={!isEditable}
                  value={invitationTitleDefault}
                  onChange={(e) => setInvitationTitleDefault(e.target.value)}
                  placeholder="e.g. Rozar & Arifa Wedding"
                  className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-40"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Welcome Text</label>
                <textarea
                  disabled={!isEditable}
                  value={invitationWelcomeText}
                  onChange={(e) => setInvitationWelcomeText(e.target.value)}
                  rows={2}
                  placeholder="In the name of Allah..."
                  className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition font-poppins disabled:opacity-40"
                />
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: Events */}
        {activeTab === 'events' && (
          <div className="space-y-6 animate-fade">
            <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
              <div className="flex items-center justify-between border-b border-[#D4AF37]/5 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#D4AF37]" />
                  <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Events Timeline
                  </h3>
                </div>
                
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => setEditingEvent({ name: '', date: '', venueId: '', description: '' })}
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition text-[10px] font-bold uppercase"
                  >
                    <Plus size={11} />
                    <span>Add Event</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse font-poppins">
                  <thead>
                    <tr className="border-b border-[#D4AF37]/10 bg-[#090909]/40 text-[#D4AF37] uppercase tracking-wider text-[10px] font-semibold">
                      <th className="p-3">Event Name</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Venue Assigned</th>
                      <th className="p-3">Description</th>
                      {isEditable && <th className="p-3">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/5 text-zinc-300">
                    {events.map((ev) => {
                      const vObj = venues.find(v => v.id === ev.venueId);
                      return (
                        <tr key={ev.id} className="hover:bg-[#141414]/25 transition">
                          <td className="p-3 font-semibold text-zinc-100">{ev.name}</td>
                          <td className="p-3 font-mono">{new Date(ev.date).toLocaleString()}</td>
                          <td className="p-3">{vObj?.name || 'Unassigned / TBA'}</td>
                          <td className="p-3 text-zinc-500 italic max-w-[200px] truncate">{ev.description || '—'}</td>
                          {isEditable && (
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingEvent(ev)}
                                  className="p-1 rounded text-amber-500 hover:bg-zinc-800 transition"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(ev.id)}
                                  className="p-1 rounded text-rose-500 hover:bg-zinc-800 transition"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {events.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-zinc-600 font-poppins">
                          No wedding timeline events registered. Add one to show on public website.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: Venues */}
        {activeTab === 'venues' && (
          <div className="space-y-6 animate-fade">
            <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
              <div className="flex items-center justify-between border-b border-[#D4AF37]/5 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#D4AF37]" />
                  <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Locations & Venues
                  </h3>
                </div>
                
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => setEditingVenue({ name: '', address: '', city: '', state: 'Tamil Nadu', country: 'India', googleMapsUrl: '' })}
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition text-[10px] font-bold uppercase"
                  >
                    <Plus size={11} />
                    <span>Add Venue</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse font-poppins">
                  <thead>
                    <tr className="border-b border-[#D4AF37]/10 bg-[#090909]/40 text-[#D4AF37] uppercase tracking-wider text-[10px] font-semibold">
                      <th className="p-3">Venue Name</th>
                      <th className="p-3">Address</th>
                      <th className="p-3">Google Maps URL</th>
                      {isEditable && <th className="p-3">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/5 text-zinc-300">
                    {venues.map((vn) => (
                      <tr key={vn.id} className="hover:bg-[#141414]/25 transition">
                        <td className="p-3 font-semibold text-zinc-100">{vn.name}</td>
                        <td className="p-3 max-w-[250px] truncate">
                          {vn.address}, {vn.city}, {vn.state}
                        </td>
                        <td className="p-3 font-mono text-[10px] max-w-[150px] truncate text-blue-400">
                          {vn.googleMapsUrl ? (
                            <a href={vn.googleMapsUrl} target="_blank" rel="noopener" className="hover:underline">
                              {vn.googleMapsUrl}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        {isEditable && (
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingVenue(vn)}
                                className="p-1 rounded text-amber-500 hover:bg-zinc-800 transition"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteVenue(vn.id)}
                                className="p-1 rounded text-rose-500 hover:bg-zinc-800 transition"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {venues.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-zinc-600 font-poppins">
                          No venues configured.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: RSVP & Design */}
        {activeTab === 'rsvp' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade">
            <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3">
                <AlertCircle size={16} className="text-[#D4AF37]" />
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  RSVP Configurations
                </h3>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">RSVP Deadline Date & Time</label>
                <input
                  type="datetime-local"
                  disabled={!isEditable}
                  value={rsvpDeadline}
                  onChange={(e) => setRsvpDeadline(e.target.value)}
                  className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-40 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#D4AF37]/5">
                <div>
                  <span className="text-xs font-semibold text-[#F5F5F5] block">RSVP Form Submissions Status</span>
                  <span className="text-[9px] text-zinc-500 block">Enabling this allows guests to submit RSVPs from the wedding page.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isEditable}
                    checked={rsvpOpen}
                    onChange={(e) => setRsvpOpen(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:bg-[#0F6D5B]/30 peer-checked:border-[#0F6D5B] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#D4AF37] after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>
            </Card>

            <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
              <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3">
                <Layout size={16} className="text-[#D4AF37]" />
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Theme & Branding Style
                </h3>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Color Theme</label>
                <select
                  disabled={!isEditable}
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-40 capitalize"
                >
                  <option value="dark">Dark Luxury (Standard)</option>
                  <option value="light">Light Minimalist</option>
                  <option value="system">System Preference</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Primary Color (Gold)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      disabled={!isEditable}
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded border border-zinc-800 bg-[#090909] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      disabled={!isEditable}
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full text-xs font-mono bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-2 focus:outline-none transition uppercase disabled:opacity-40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Secondary Color (Emerald)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      disabled={!isEditable}
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded border border-zinc-800 bg-[#090909] cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      disabled={!isEditable}
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full text-xs font-mono bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-2 focus:outline-none transition uppercase disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Global Save Cancel controls */}
        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#D4AF37]/10 mb-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={!isDirty() || isSaving}
            className="py-2.5 px-5 text-xs font-semibold"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={!isDirty() || isSaving || !isEditable}
            className="py-2.5 px-6 text-xs font-bold shadow-lg"
          >
            {isSaving ? (
              <span className="flex items-center gap-1.5">
                <RefreshCw size={12} className="animate-spin" />
                <span>Saving Configurations...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save size={13} />
                <span>Save Configurations</span>
              </span>
            )}
          </Button>
        </div>
      </form>

      {/* Modal: Add/Edit Venue */}
      <Modal isOpen={editingVenue !== null} onClose={() => setEditingVenue(null)} title={editingVenue?.id ? 'Edit Venue Location' : 'Register New Venue Location'}>
        {editingVenue && (
          <form onSubmit={handleSaveVenue} className="space-y-4 text-xs font-poppins">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Venue Label Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. NSK & NKR A/C Mahal"
                value={editingVenue.name || ''}
                onChange={(e) => setEditingVenue({ ...editingVenue, name: e.target.value })}
                className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Street Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. GST Main Road, Lion City"
                value={editingVenue.address || ''}
                onChange={(e) => setEditingVenue({ ...editingVenue, address: e.target.value })}
                className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madurai"
                  value={editingVenue.city || ''}
                  onChange={(e) => setEditingVenue({ ...editingVenue, city: e.target.value })}
                  className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">State *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tamil Nadu"
                  value={editingVenue.state || ''}
                  onChange={(e) => setEditingVenue({ ...editingVenue, state: e.target.value })}
                  className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Country *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. India"
                  value={editingVenue.country || ''}
                  onChange={(e) => setEditingVenue({ ...editingVenue, country: e.target.value })}
                  className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Google Maps URL</label>
              <input
                type="url"
                placeholder="https://maps.app.goo.gl/..."
                value={editingVenue.googleMapsUrl || ''}
                onChange={(e) => setEditingVenue({ ...editingVenue, googleMapsUrl: e.target.value })}
                className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#D4AF37]/10">
              <button
                type="button"
                onClick={() => setEditingVenue(null)}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs transition uppercase font-bold"
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="primary"
                className="py-2 px-5 text-xs font-bold uppercase tracking-wider"
              >
                Save Venue Location
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Add/Edit Event */}
      <Modal isOpen={editingEvent !== null} onClose={() => setEditingEvent(null)} title={editingEvent?.id ? 'Edit Event Schedule' : 'Schedule New Event Ceremony'}>
        {editingEvent && (
          <form onSubmit={handleSaveEvent} className="space-y-4 text-xs font-poppins">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Event Name Label *</label>
              <input
                type="text"
                required
                placeholder="e.g. Reception Dinner"
                value={editingEvent.name || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Ceremony Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={editingEvent.date ? editingEvent.date.substring(0, 16) : ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Assigned Venue Location *</label>
              <select
                required
                value={editingEvent.venueId || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, venueId: e.target.value })}
                className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins"
              >
                <option value="" disabled>Select a Venue...</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Brief Description (Optional)</label>
              <textarea
                placeholder="Describe dress codes, itineraries, or special notes..."
                value={editingEvent.description || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                rows={2}
                className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition font-poppins"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#D4AF37]/10">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs transition uppercase font-bold"
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="primary"
                className="py-2 px-5 text-xs font-bold uppercase tracking-wider"
              >
                Save Event Details
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default WeddingSettingsPage;
