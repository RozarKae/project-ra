import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Upload, 
  Trash2, 
  Globe, 
  Sliders, 
  AlertTriangle, 
  FileText,
  Loader2,
  Lock
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';
import { useWorkspaceSettings } from '../../hooks/useWorkspaceSettings';
import { useAuth } from '../../lib/auth';
import { WorkspaceSettings as IWorkspaceSettings, WorkspacePreferences } from '../../types/workspace';
import { isFirebaseConfigured, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const WorkspaceSettings: React.FC = () => {
  const { settings, loading, saveWorkspace } = useWorkspaceSettings();
  const { user } = useAuth();
  
  const currentUserEmail = user?.email || 'admin@projectra.com';
  
  // Resolve user role based on email context helper
  const getUserRole = (email: string): 'owner' | 'admin' | 'editor' | 'viewer' => {
    const clean = email.toLowerCase().trim();
    if (clean.includes('owner')) return 'owner';
    if (clean.includes('editor')) return 'editor';
    if (clean.includes('viewer')) return 'viewer';
    return 'owner'; // default owner access
  };

  const role = getUserRole(currentUserEmail);
  const isEditable = role === 'owner' || role === 'admin';

  // Form states
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'planning' | 'active' | 'completed' | 'archived'>('active');
  const [createdAt, setCreatedAt] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  // Branding states
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Localization states
  const [timezone, setTimezone] = useState('UTC+05:30');
  const [currency, setCurrency] = useState('INR');
  const [language, setLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');

  // Preferences states
  const [guestManagement, setGuestManagement] = useState(true);
  const [rsvp, setRsvp] = useState(true);
  const [invitations, setInvitations] = useState(true);
  const [reports, setReports] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // Submit / Saving state
  const [isSaving, setIsSaving] = useState(false);

  // File Inputs references
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Load database settings into state values
  useEffect(() => {
    if (settings) {
      setWorkspaceName(settings.workspaceName || '');
      setWorkspaceSlug(settings.workspaceSlug || '');
      setDescription(settings.description || '');
      setStatus(settings.status || 'active');
      setCreatedAt(settings.createdAt || new Date().toISOString());
      setOwnerEmail(settings.ownerEmail || 'admin@photomagic.com');

      setLogoUrl(settings.logoUrl || '');
      setCoverImageUrl(settings.coverImageUrl || '');

      setTimezone(settings.timezone || 'UTC+05:30');
      setCurrency(settings.currency || 'INR');
      setLanguage(settings.language || 'en');
      setDateFormat(settings.dateFormat || 'YYYY-MM-DD');

      if (settings.preferences) {
        setGuestManagement(settings.preferences.guestManagement ?? true);
        setRsvp(settings.preferences.rsvp ?? true);
        setInvitations(settings.preferences.invitations ?? true);
        setReports(settings.preferences.reports ?? true);
        setNotifications(settings.preferences.notifications ?? true);
      }
    }
  }, [settings]);

  // Check if form is dirty (unsaved edits exist)
  const isDirty = (): boolean => {
    if (!settings) return false;
    
    const prefsChanged = settings.preferences ? (
      guestManagement !== (settings.preferences.guestManagement ?? true) ||
      rsvp !== (settings.preferences.rsvp ?? true) ||
      invitations !== (settings.preferences.invitations ?? true) ||
      reports !== (settings.preferences.reports ?? true) ||
      notifications !== (settings.preferences.notifications ?? true)
    ) : false;

    return (
      workspaceName !== (settings.workspaceName || '') ||
      description !== (settings.description || '') ||
      status !== (settings.status || 'active') ||
      logoFile !== null ||
      logoUrl !== (settings.logoUrl || '') ||
      coverFile !== null ||
      coverImageUrl !== (settings.coverImageUrl || '') ||
      timezone !== (settings.timezone || 'UTC+05:30') ||
      currency !== (settings.currency || 'INR') ||
      language !== (settings.language || 'en') ||
      dateFormat !== (settings.dateFormat || 'YYYY-MM-DD') ||
      prefsChanged
    );
  };

  // Revert changes
  const handleCancel = () => {
    if (settings) {
      setWorkspaceName(settings.workspaceName || '');
      setDescription(settings.description || '');
      setStatus(settings.status || 'active');
      setLogoUrl(settings.logoUrl || '');
      setCoverImageUrl(settings.coverImageUrl || '');
      setLogoFile(null);
      setCoverFile(null);
      setTimezone(settings.timezone || 'UTC+05:30');
      setCurrency(settings.currency || 'INR');
      setLanguage(settings.language || 'en');
      setDateFormat(settings.dateFormat || 'YYYY-MM-DD');
      
      if (settings.preferences) {
        setGuestManagement(settings.preferences.guestManagement ?? true);
        setRsvp(settings.preferences.rsvp ?? true);
        setInvitations(settings.preferences.invitations ?? true);
        setReports(settings.preferences.reports ?? true);
        setNotifications(settings.preferences.notifications ?? true);
      }
      toast.success('Changes reverted back to saved workspace config.');
    }
  };

  // Validate branding files
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file format. Please upload PNG, JPEG, or WEBP images.');
      return false;
    }
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      toast.error('File size exceeds the 5MB maximum limit.');
      return false;
    }
    return true;
  };

  // Handle logo change selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setLogoFile(file);
        setLogoUrl(URL.createObjectURL(file)); // Local preview
      }
    }
  };

  // Handle cover image selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setCoverFile(file);
        setCoverImageUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoUrl('');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverImageUrl('');
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  // File Upload Helper (Uploads to storage or falls back to base64 DataURI preview urls)
  const uploadImage = async (file: File, type: 'logo' | 'cover'): Promise<string> => {
    if (isFirebaseConfigured && storage) {
      const storagePath = `workspaces/${settings?.workspaceId}/branding/${type}_${Date.now()}`;
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } else {
      // Mock Base64 fallback file reader
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  };

  // Save changes handler
  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!workspaceName.trim()) {
      toast.error('Workspace Name is required.');
      return;
    }

    setIsSaving(true);
    let finalLogoUrl = logoUrl;
    let finalCoverUrl = coverImageUrl;

    try {
      // Upload Logo if changed
      if (logoFile) {
        finalLogoUrl = await uploadImage(logoFile, 'logo');
      }

      // Upload Cover if changed
      if (coverFile) {
        finalCoverUrl = await uploadImage(coverFile, 'cover');
      }

      const payload: IWorkspaceSettings = {
        workspaceId: settings?.workspaceId || 'default_workspace',
        workspaceName: workspaceName.trim(),
        workspaceSlug, // immutable
        description: description.trim() || undefined,
        status,
        logoUrl: finalLogoUrl || undefined,
        coverImageUrl: finalCoverUrl || undefined,
        timezone,
        currency,
        language,
        dateFormat,
        preferences: {
          guestManagement,
          rsvp,
          invitations,
          reports,
          notifications
        },
        createdAt,
        ownerEmail,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUserEmail
      };

      await saveWorkspace(payload);
      setLogoFile(null);
      setCoverFile(null);
      toast.success('Workspace settings updated successfully.');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update workspace settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 space-y-3 font-poppins">
        <Loader2 className="animate-spin text-[#D4AF37]" size={28} />
        <p className="text-xs">Loading workspace configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-poppins relative">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D4AF37]/10 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-cinzel text-[#F5F5F5] font-bold tracking-wide">
            Workspace Settings
          </h1>
          <p className="text-xs text-[#F5F5F5]/50">
            Configure branding insignia, localization formats, and collaboration permissions.
          </p>
        </div>

        {/* Access Role Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900/50 self-start sm:self-auto">
          <Lock size={12} className="text-[#D4AF37]" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#F5F5F5]/70">
            Role: <span className="text-[#D4AF37]">{role}</span>
          </span>
        </div>
      </div>

      {/* Read Only Warnings for Editors/Viewers */}
      {!isEditable && (
        <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <div className="space-y-0.5 text-xs text-amber-200/80">
            <h4 className="font-semibold text-white">Read-Only Session Scope</h4>
            <p className="leading-relaxed">
              You are logged in with **{role}** privileges. Workspace scope settings are editable only by Owners and Admins.
            </p>
          </div>
        </div>
      )}

      {/* Grid Settings Layout: Two Columns on Desktop, Single on Mobile */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column 1: Info & Branding */}
        <div className="space-y-6">
          
          {/* Card 1: Workspace Info */}
          <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3 mb-2">
              <FileText size={16} className="text-[#D4AF37]" />
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Workspace Information
              </h3>
            </div>

            {/* Workspace Name */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Workspace Name *</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Enter workspace name"
                disabled={!isEditable || isSaving}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-40"
              />
            </div>

            {/* Workspace Slug (Read-only) */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Workspace Slug (Immutable)</label>
              <input
                type="text"
                value={workspaceSlug}
                disabled
                className="w-full text-sm bg-[#090909] border border-zinc-800 text-zinc-500 rounded-xl px-3 py-3 cursor-not-allowed"
              />
            </div>

            {/* Workspace Description */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Workspace scope details..."
                rows={3}
                disabled={!isEditable || isSaving}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition font-poppins disabled:opacity-40"
              />
            </div>

            {/* Status Select */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Workspace Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={!isEditable || isSaving}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-40"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Created Date & Owner (Read-only) */}
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs border-t border-[#D4AF37]/5 text-zinc-400">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-0.5">Created Date</span>
                <span className="font-mono">{new Date(createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-0.5">Owner Address</span>
                <span className="truncate block font-medium" title={ownerEmail}>{ownerEmail}</span>
              </div>
            </div>
          </Card>

          {/* Card 2: Branding */}
          <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3 mb-2">
              <Upload size={16} className="text-[#D4AF37]" />
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Branding Assets
              </h3>
            </div>

            {/* Logo Image Upload */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block">Workspace Logo</span>
              
              <div className="flex items-center gap-4">
                {/* Logo Preview box */}
                <div className="w-16 h-16 rounded-xl border border-zinc-800 bg-[#090909] overflow-hidden flex items-center justify-center relative shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Settings className="text-zinc-600" size={24} />
                  )}
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={!isEditable || isSaving}
                      className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/5 transition text-[10px] font-bold uppercase tracking-wider disabled:opacity-40 shrink-0"
                    >
                      Upload Logo
                    </button>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={!isEditable || isSaving}
                        className="px-2 py-1.5 rounded-lg border border-red-900/40 text-red-400 hover:bg-red-950/20 transition text-[10px] disabled:opacity-40"
                        title="Remove Logo"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-zinc-500">Supports PNG, JPG, WEBP. Max size: 5MB.</p>
                </div>
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2 pt-2 border-t border-[#D4AF37]/5">
              <span className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block">Cover Image</span>
              
              <div className="space-y-3">
                {/* Cover Preview banner */}
                <div className="w-full h-28 rounded-xl border border-zinc-800 bg-[#090909] overflow-hidden flex items-center justify-center relative">
                  {coverImageUrl ? (
                    <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-zinc-600 font-medium">No cover image uploaded</span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-zinc-500">Supports PNG, JPG, WEBP. Max size: 5MB.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={!isEditable || isSaving}
                      className="px-3.5 py-1.5 rounded-lg border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/5 transition text-[10px] font-bold uppercase tracking-wider disabled:opacity-40"
                    >
                      Upload Cover
                    </button>
                    {coverImageUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        disabled={!isEditable || isSaving}
                        className="px-2 py-1.5 rounded-lg border border-red-900/40 text-red-400 hover:bg-red-950/20 transition text-[10px] disabled:opacity-40"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </div>
          </Card>
        </div>

        {/* Column 2: Localization & Preferences */}
        <div className="space-y-6">
          
          {/* Card 3: Localization */}
          <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3 mb-2">
              <Globe size={16} className="text-[#D4AF37]" />
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Localization & Display
              </h3>
            </div>

            {/* Timezone Select */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={!isEditable || isSaving}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-40"
              >
                <option value="UTC+05:30">UTC+05:30 (Chennai, Kolkata, Mumbai)</option>
                <option value="UTC+00:00">UTC+00:00 (GMT / London)</option>
                <option value="UTC+04:00">UTC+04:00 (GST - Dubai)</option>
                <option value="UTC-05:00">UTC-05:00 (EST / New York)</option>
                <option value="UTC-08:00">UTC-08:00 (PST / Los Angeles)</option>
              </select>
            </div>

            {/* Currency Select */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={!isEditable || isSaving}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-40"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AED">AED (AED)</option>
              </select>
            </div>

            {/* Date Format Select */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Date Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                disabled={!isEditable || isSaving}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-40"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-10)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (10/07/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (07/10/2026)</option>
              </select>
            </div>

            {/* Language Select */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={!isEditable || isSaving}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-40"
              >
                <option value="en">English (Default)</option>
                <option value="ar">Arabic</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </Card>

          {/* Card 4: Preferences */}
          <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3 mb-2">
              <Sliders size={16} className="text-[#D4AF37]" />
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Features & Preferences
              </h3>
            </div>

            {/* Preference switches */}
            <div className="space-y-4">
              {/* Switch 1: Guest Management */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#F5F5F5] block">Enable Guest Management</span>
                  <span className="text-[10px] text-zinc-500 block">Manage guests side allocations and grouping profiles.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guestManagement}
                    onChange={(e) => setGuestManagement(e.target.checked)}
                    disabled={!isEditable || isSaving}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:bg-[#0F6D5B]/30 peer-checked:border-[#0F6D5B] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#D4AF37] after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>

              {/* Switch 2: RSVP */}
              <div className="flex items-center justify-between pt-2.5 border-t border-[#D4AF37]/5">
                <div>
                  <span className="text-xs font-semibold text-[#F5F5F5] block">Enable RSVP Roster</span>
                  <span className="text-[10px] text-zinc-500 block">Allow invitees to confirm attendance parameters.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rsvp}
                    onChange={(e) => setRsvp(e.target.checked)}
                    disabled={!isEditable || isSaving}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:bg-[#0F6D5B]/30 peer-checked:border-[#0F6D5B] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#D4AF37] after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>

              {/* Switch 3: Invitations */}
              <div className="flex items-center justify-between pt-2.5 border-t border-[#D4AF37]/5">
                <div>
                  <span className="text-xs font-semibold text-[#F5F5F5] block">Enable Invitation Distribution</span>
                  <span className="text-[10px] text-zinc-500 block">Distribute digital links and count printed card deliveries.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invitations}
                    onChange={(e) => setInvitations(e.target.checked)}
                    disabled={!isEditable || isSaving}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:bg-[#0F6D5B]/30 peer-checked:border-[#0F6D5B] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#D4AF37] after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>

              {/* Switch 4: Reports */}
              <div className="flex items-center justify-between pt-2.5 border-t border-[#D4AF37]/5">
                <div>
                  <span className="text-xs font-semibold text-[#F5F5F5] block">Enable Analytics Reports</span>
                  <span className="text-[10px] text-zinc-500 block">Render exportable metrics charts of guest counts.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reports}
                    onChange={(e) => setReports(e.target.checked)}
                    disabled={!isEditable || isSaving}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:bg-[#0F6D5B]/30 peer-checked:border-[#0F6D5B] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#D4AF37] after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>

              {/* Switch 5: Notifications */}
              <div className="flex items-center justify-between pt-2.5 border-t border-[#D4AF37]/5">
                <div>
                  <span className="text-xs font-semibold text-[#F5F5F5] block">Enable Sync Notifications</span>
                  <span className="text-[10px] text-zinc-500 block">Receive live alert notifications of changes.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    disabled={!isEditable || isSaving}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:bg-[#0F6D5B]/30 peer-checked:border-[#0F6D5B] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-[#D4AF37] after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Section 5: Danger Zone (Spans full width) */}
        <div className="lg:col-span-2 pt-2">
          <Card className="p-5 border border-red-900/30 bg-red-950/5 space-y-4">
            <div className="flex items-center gap-2 border-b border-red-900/20 pb-3 mb-2">
              <AlertTriangle size={16} className="text-red-400" />
              <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-red-400">
                Danger Zone
              </h3>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-white block">Archive or Delete Workspace</span>
                <span className="text-[10px] text-zinc-500 block">
                  Archived workspaces restrict edit access; deleted workspaces discard all wedding datasets permanently.
                </span>
              </div>

              <div className="flex gap-2 shrink-0">
                <div className="relative group">
                  <button
                    type="button"
                    disabled
                    className="px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-600 text-xs font-bold uppercase cursor-not-allowed flex items-center gap-1.5"
                  >
                    Archive Workspace
                  </button>
                  <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-black text-[9px] text-[#D4AF37] border border-[#D4AF37]/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-150 font-poppins">
                    Coming Soon
                  </span>
                </div>

                <div className="relative group">
                  <button
                    type="button"
                    disabled
                    className="px-3.5 py-2.5 rounded-xl border border-red-950/40 bg-red-950/10 text-red-800/40 text-xs font-bold uppercase cursor-not-allowed flex items-center gap-1.5"
                  >
                    Delete Workspace
                  </button>
                  <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-black text-[9px] text-red-400 border border-red-900/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-150 font-poppins">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Submit Actions Panel */}
        <div className="lg:col-span-2 flex justify-end gap-2.5 pt-4 border-t border-[#D4AF37]/10 mb-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={!isDirty() || isSaving || !isEditable}
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
                <Loader2 size={12} className="animate-spin" />
                <span>Saving Changes...</span>
              </span>
            ) : (
              <span>Save Changes</span>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default WorkspaceSettings;
