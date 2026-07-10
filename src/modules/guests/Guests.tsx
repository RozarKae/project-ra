import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  Home, 
  AlertTriangle,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  Loader2,
  Edit,
  Filter,
  X,
  Eye,
  Trash2,
  Clock,
  Send,
  Users
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { Guest } from '../../types/guest';
import { toast } from 'react-hot-toast';
import { useGuests } from '../../hooks/useGuests';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { ActivityRepository } from '../../repositories/ActivityRepository';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { useAuth } from '../../lib/auth';
import { ActivityLog } from '../../types/activity';
import { 
  checkPotentialDuplicate, 
  getSimilarity, 
  getPhoneticSimilarity 
} from '../../utils/duplicateDetector';

export const Guests: React.FC = () => {
  const { guests, save, remove } = useGuests();
  const { currentWorkspaceId, currentWeddingId } = useWorkspace();
  const { logs: activityLogs } = useActivityLogs();
  const { user } = useAuth();
  const currentUserEmail = user?.email || 'admin@projectra.com';
  
  // Basic states for layout list
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Collapsible Filters Panel
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filterSide, setFilterSide] = useState<string>('all');
  const [filterInvType, setFilterInvType] = useState<string>('all');
  const [filterRsvp, setFilterRsvp] = useState<string>('all');
  const [filterMembers, setFilterMembers] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');

  // Expanded families tracking (for family grouping layout)
  const [expandedFamilies, setExpandedFamilies] = useState<Record<string, boolean>>({});

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  
  // Form States (B.2 & B.5 Specs)
  const [formName, setFormName] = useState('');
  const [formFamily, setFormFamily] = useState('');
  const [formSide, setFormSide] = useState<'bride' | 'groom'>('bride');
  const [formMembersCount, setFormMembersCount] = useState<number>(1);
  const [formInvitationType, setFormInvitationType] = useState<'digital' | 'printed' | 'both'>('digital');
  const [formRsvpStatus, setFormRsvpStatus] = useState<'pending' | 'attending' | 'declined' | 'maybe'>('pending');
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsApp, setFormWhatsApp] = useState('');
  const [formRelation, setFormRelation] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Duplicate states
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<any>(null);
  const [duplicateConfirmedOverride, setDuplicateConfirmedOverride] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Loading & Validation errors
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 250ms Debouncer effect for live search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Helper to format ISO timestamp into human-friendly time ago
  const formatTimeAgo = (isoString: string): string => {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now.getTime() - date.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) {
      if (diffHours === 1) return '1 hour ago';
      return `${diffHours} hours ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getFriendlyUser = (email: string, currentUserEmail: string): string => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanCurrent = currentUserEmail.toLowerCase().trim();
    if (cleanEmail === cleanCurrent) return 'You';
    if (cleanEmail === 'dad@projectra.com' || cleanEmail === 'dad@gmail.com') return 'Dad';
    if (cleanEmail === 'mom@projectra.com' || cleanEmail === 'mom@gmail.com') return 'Mom';
    if (cleanEmail === 'admin@projectra.com') return 'Admin';
    if (cleanEmail === 'system@projectra.com') return 'System';
    return email.split('@')[0].toUpperCase();
  };

  const getFriendlyActivityText = (log: ActivityLog): { icon: string; text: string; time: string } => {
    const timeStr = formatTimeAgo(log.timestamp);
    const friendlyUser = getFriendlyUser(log.user, currentUserEmail);
    
    let icon = '👤';
    if (friendlyUser === 'Dad') icon = '👨';
    else if (friendlyUser === 'Mom') icon = '👩';
    else if (friendlyUser === 'You') icon = '👤';
    else if (friendlyUser === 'System') icon = '🤖';

    let detailsText = log.details;
    if (detailsText.toLowerCase().startsWith('created guest:')) {
      detailsText = detailsText.substring(14).trim().replace(/['"]/g, '');
    } else if (detailsText.toLowerCase().startsWith('updated guest:')) {
      detailsText = detailsText.substring(14).trim().replace(/['"]/g, '');
    } else if (detailsText.toLowerCase().startsWith('soft deleted guest:')) {
      detailsText = detailsText.substring(19).trim().replace(/['"]/g, '');
    } else if (detailsText.toLowerCase().startsWith('saved guest record:')) {
      detailsText = detailsText.substring(19).trim().replace(/['"]/g, '');
    }

    let actionWord = 'changed';
    if (log.action.toLowerCase() === 'create' || log.action.toLowerCase() === 'import') {
      actionWord = 'added';
    } else if (log.action.toLowerCase() === 'update' || log.action.toLowerCase() === 'guest updated') {
      actionWord = 'updated';
    } else if (log.action.toLowerCase() === 'delete') {
      actionWord = 'removed';
    }

    const fullText = `${friendlyUser} ${actionWord} ${detailsText}`;
    
    return {
      icon,
      text: fullText,
      time: timeStr
    };
  };

  const resetForm = () => {
    setFormName('');
    setFormFamily('');
    setFormSide('bride');
    setFormMembersCount(1);
    setFormInvitationType('digital');
    setFormRsvpStatus('pending');
    setFormPhone('');
    setFormWhatsApp('');
    setFormRelation('');
    setFormAddress('');
    setFormNotes('');
    setSelectedGuest(null);
    setDuplicateCheckResult(null);
    setDuplicateConfirmedOverride(false);
    setIsReadOnly(false);
    setErrors({});
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (guest: Guest, readOnly = false) => {
    setSelectedGuest(guest);
    setFormName(guest.name);
    setFormFamily(guest.familyName);
    setFormSide(guest.side);
    setFormMembersCount(guest.membersCount);
    setFormInvitationType(guest.invitationType || 'digital');
    setFormRsvpStatus(guest.rsvpStatus || 'pending');
    setFormPhone(guest.phone || '');
    setFormWhatsApp(guest.whatsApp || '');
    setFormRelation(guest.relation || '');
    setFormAddress(guest.address || '');
    setFormNotes(guest.notes || '');
    setIsReadOnly(readOnly);
    setErrors({});
    setIsAddEditModalOpen(true);
  };

  const handleOpenDeleteModal = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedGuest) {
      try {
        await remove(selectedGuest.id, selectedGuest.name, 'admin@projectra.com');
        setIsDeleteModalOpen(false);
        setSelectedGuest(null);
        toast.success('Guest soft deleted successfully.');
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to delete guest.');
      }
    }
  };

  // Compare original vs updated guest values to write activity log
  const getChangedFields = (original: Guest, updated: Guest): string[] => {
    const changes: string[] = [];
    if (original.name !== updated.name) changes.push(`Name ("${original.name}" → "${updated.name}")`);
    if (original.familyName !== updated.familyName) changes.push(`Family Group ("${original.familyName}" → "${updated.familyName}")`);
    if (original.side !== updated.side) changes.push(`Family Side ("${original.side}" → "${updated.side}")`);
    if (original.membersCount !== updated.membersCount) changes.push(`Members Count (${original.membersCount} → ${updated.membersCount})`);
    if ((original.invitationType || 'digital') !== (updated.invitationType || 'digital')) changes.push(`Invitation Type ("${original.invitationType || 'digital'}" → "${updated.invitationType || 'digital'}")`);
    if ((original.rsvpStatus || 'pending') !== (updated.rsvpStatus || 'pending')) changes.push(`RSVP Status ("${original.rsvpStatus || 'pending'}" → "${updated.rsvpStatus || 'pending'}")`);
    if ((original.phone || '') !== (updated.phone || '')) changes.push(`Phone ("${original.phone || '—'}" → "${updated.phone || '—'}")`);
    if ((original.whatsApp || '') !== (updated.whatsApp || '')) changes.push(`WhatsApp ("${original.whatsApp || '—'}" → "${updated.whatsApp || '—'}")`);
    if ((original.relation || '') !== (updated.relation || '')) changes.push(`Relation ("${original.relation || '—'}" → "${updated.relation || '—'}")`);
    if ((original.address || '') !== (updated.address || '')) changes.push(`Address ("${original.address || '—'}" → "${updated.address || '—'}")`);
    if ((original.notes || '') !== (updated.notes || '')) changes.push(`Notes ("${original.notes || '—'}" → "${updated.notes || '—'}")`);
    return changes;
  };

  // Check if form is dirty (unsaved changes detection)
  const isFormDirty = (): boolean => {
    if (isReadOnly) return false;
    if (selectedGuest) {
      return (
        formName.trim() !== (selectedGuest.name || '') ||
        formFamily.trim() !== (selectedGuest.familyName || '') ||
        formSide !== (selectedGuest.side || 'bride') ||
        formMembersCount !== (selectedGuest.membersCount || 1) ||
        formInvitationType !== (selectedGuest.invitationType || 'digital') ||
        formRsvpStatus !== (selectedGuest.rsvpStatus || 'pending') ||
        formPhone.trim() !== (selectedGuest.phone || '') ||
        formWhatsApp.trim() !== (selectedGuest.whatsApp || '') ||
        formRelation.trim() !== (selectedGuest.relation || '') ||
        formAddress.trim() !== (selectedGuest.address || '') ||
        formNotes.trim() !== (selectedGuest.notes || '')
      );
    } else {
      return (
        formName.trim() !== '' ||
        formFamily.trim() !== '' ||
        formSide !== 'bride' ||
        formMembersCount !== 1 ||
        formPhone.trim() !== '' ||
        formWhatsApp.trim() !== '' ||
        formRelation.trim() !== '' ||
        formAddress.trim() !== '' ||
        formNotes.trim() !== ''
      );
    }
  };

  const handleCancelClick = () => {
    if (isFormDirty()) {
      setIsDiscardModalOpen(true);
    } else {
      setIsAddEditModalOpen(false);
      resetForm();
    }
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formName.trim()) {
      newErrors.name = 'Guest Name is required.';
    }
    
    if (!formFamily.trim()) {
      newErrors.familyName = 'Family Name is required.';
    }
    
    if (formMembersCount < 1) {
      newErrors.membersCount = 'Members Count must be at least 1.';
    }

    if (formPhone.trim()) {
      const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
      if (!phoneRegex.test(formPhone.trim())) {
        newErrors.phone = 'Invalid phone format (min 7 digits).';
      }
    }

    if (formWhatsApp.trim()) {
      const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
      if (!phoneRegex.test(formWhatsApp.trim())) {
        newErrors.whatsApp = 'Invalid WhatsApp format (min 7 digits).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save/Update guest records
  const handleSave = async (e: React.FormEvent, addAnother = false, forceSave = false) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the validation errors before saving.');
      return;
    }

    setIsSaving(true);
    const isEdit = !!selectedGuest;
    const guestId = selectedGuest ? selectedGuest.id : 'guest_' + Math.random().toString(36).substr(2, 9);
    const createdAt = selectedGuest ? selectedGuest.createdAt : new Date().toISOString();
    const createdBy = selectedGuest ? selectedGuest.createdBy : undefined;
    
    const payload: Guest = {
      id: guestId,
      name: formName.trim(),
      familyName: formFamily.trim(),
      side: formSide,
      membersCount: formMembersCount,
      invitationType: formInvitationType,
      rsvpStatus: formRsvpStatus,
      phone: formPhone.trim() || undefined,
      whatsApp: formWhatsApp.trim() || undefined,
      relation: formRelation.trim() || undefined,
      address: formAddress.trim() || undefined,
      notes: formNotes.trim() || undefined,
      createdAt,
      createdBy,
      isDeleted: false,
      duplicateConfirmed: forceSave ? true : (selectedGuest ? selectedGuest.duplicateConfirmed : undefined)
    };

    // Pre-save smart duplicate checker (Sprint B.6)
    if (!forceSave && !duplicateConfirmedOverride) {
      const checkResult = checkPotentialDuplicate(
        { 
          name: payload.name, 
          familyName: payload.familyName, 
          phone: payload.phone, 
          whatsApp: payload.whatsApp 
        },
        guests,
        selectedGuest?.id
      );

      if (checkResult.isDuplicate && checkResult.matchedGuest) {
        setDuplicateCheckResult(checkResult);
        setIsDuplicateModalOpen(true);
        
        // Log "Duplicate Detected" in activity logs
        const activityRepo = new ActivityRepository();
        await activityRepo.addLog(
          currentWorkspaceId,
          currentWeddingId,
          'admin@projectra.com',
          'Duplicate Detected',
          'guest',
          checkResult.matchedGuest.id,
          `Duplicate flagged on name "${payload.name}" matching existing guest ID "${checkResult.matchedGuest.id}"`
        );
        
        setIsSaving(false);
        return;
      }
    }

    // Determine if this is a newly created family group
    const isNewFamily = !guests.some(g => !g.isDeleted && g.familyName.trim().toLowerCase() === payload.familyName.trim().toLowerCase());

    try {
      if (isEdit && selectedGuest) {
        const changes = getChangedFields(selectedGuest, payload);
        const details = changes.length > 0
          ? `Updated Guest: "${payload.name}". Changes: ${changes.join(', ')}`
          : `Updated Guest: "${payload.name}" (no fields modified)`;
        
        await save(payload, 'admin@projectra.com');
        
        // Log audit activities (Guest Updated, and Family Created/Updated)
        const activityRepo = new ActivityRepository();
        await activityRepo.addLog(
          currentWorkspaceId,
          currentWeddingId,
          'admin@projectra.com',
          'Guest Updated',
          'guest',
          payload.id,
          details
        );

        await activityRepo.addLog(
          currentWorkspaceId,
          currentWeddingId,
          'admin@projectra.com',
          isNewFamily ? 'Family Created' : 'Family Updated',
          'family',
          payload.familyName,
          isNewFamily ? `Created Family Group: "${payload.familyName}"` : `Updated Family Group: "${payload.familyName}"`
        );
        
        toast.success(`Guest "${payload.name}" updated successfully.`);
      } else {
        await save(payload, 'admin@projectra.com');
        
        // Log Family Created/Updated logs
        const activityRepo = new ActivityRepository();
        await activityRepo.addLog(
          currentWorkspaceId,
          currentWeddingId,
          'admin@projectra.com',
          isNewFamily ? 'Family Created' : 'Family Updated',
          'family',
          payload.familyName,
          isNewFamily ? `Created Family Group: "${payload.familyName}"` : `Updated Family Group: "${payload.familyName}"`
        );

        toast.success(`Guest "${payload.name}" saved successfully.`);
      }
      
      if (addAnother && !isEdit) {
        // Keep modal open, reset fields except Side & Family for faster entry
        setFormName('');
        setFormPhone('');
        setFormWhatsApp('');
        setFormRelation('');
        setFormAddress('');
        setFormNotes('');
        setFormMembersCount(1);
        setErrors({});
      } else {
        setIsAddEditModalOpen(false);
        resetForm();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save guest record.');
    } finally {
      setIsSaving(false);
    }
  };

  // High performance search & multi-filtering memo block
  const processedGuests = useMemo(() => {
    let result = [...guests];

    // 1. Text Search (debounced, case-insensitive)
    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
      result = result.filter(g => 
        g.name.toLowerCase().includes(q) || 
        (g.familyName && g.familyName.toLowerCase().includes(q)) ||
        (g.phone && g.phone.includes(q)) ||
        (g.whatsApp && g.whatsApp.includes(q)) ||
        (g.relation && g.relation.toLowerCase().includes(q))
      );
    }

    // 2. Family Side Filter
    if (filterSide !== 'all') {
      result = result.filter(g => g.side === filterSide);
    }

    // 3. Invitation Type Filter
    if (filterInvType !== 'all') {
      result = result.filter(g => (g.invitationType || 'digital') === filterInvType);
    }

    // 4. RSVP Status Filter
    if (filterRsvp !== 'all') {
      result = result.filter(g => (g.rsvpStatus || 'pending') === filterRsvp);
    }

    // 5. Members Count Filter
    if (filterMembers !== 'all') {
      if (filterMembers === '4+') {
        result = result.filter(g => g.membersCount >= 4);
      } else {
        const count = parseInt(filterMembers, 10);
        result = result.filter(g => g.membersCount === count);
      }
    }

    // 6. Recently Added Filter
    if (filterDate !== 'all') {
      const now = new Date();
      result = result.filter(g => {
        if (!g.createdAt) return false;
        const createdDate = new Date(g.createdAt);
        const diffMs = now.getTime() - createdDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (filterDate === 'today') {
          return diffDays <= 1;
        } else if (filterDate === 'week') {
          return diffDays <= 7;
        } else if (filterDate === 'month') {
          return diffDays <= 30;
        }
        return true;
      });
    }

    return result;
  }, [guests, debouncedSearchQuery, filterSide, filterInvType, filterRsvp, filterMembers, filterDate]);

  // Collapsible Family group mappings
  const familyGroups = useMemo(() => {
    const groups: Record<string, Guest[]> = {};
    processedGuests.forEach(g => {
      const fam = g.familyName ? g.familyName.trim() : 'No Family Group';
      if (!groups[fam]) groups[fam] = [];
      groups[fam].push(g);
    });
    return groups;
  }, [processedGuests]);

  // Auto-expand matching family accordions on search queries
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      const expanded: Record<string, boolean> = {};
      Object.keys(familyGroups).forEach(famName => {
        expanded[famName] = true;
      });
      setExpandedFamilies(expanded);
    }
  }, [debouncedSearchQuery, familyGroups]);

  // Live duplicate suggestion panel list
  const liveSuggestions = useMemo(() => {
    if (formName.trim().length < 3) return [];
    
    return guests.filter(g => {
      if (selectedGuest && g.id === selectedGuest.id) return false;
      if (g.isDeleted) return false;

      const normGName = g.name.toLowerCase();
      const normInputName = formName.trim().toLowerCase();
      const normFName = g.familyName.trim().toLowerCase();
      const normInputFamily = formFamily.trim().toLowerCase();

      // Check simple similarity
      const nameSimilarity = getSimilarity(normInputName, normGName);
      const phoneticSimilarity = getPhoneticSimilarity(normInputName, normGName);
      const nameMatches = nameSimilarity >= 0.70 || phoneticSimilarity >= 0.70;

      const phoneMatches = formPhone.trim() && g.phone && formPhone.trim().replace(/\D/g, '') === g.phone.replace(/\D/g, '');
      const waMatches = formWhatsApp.trim() && g.whatsApp && formWhatsApp.trim().replace(/\D/g, '') === g.whatsApp.replace(/\D/g, '');
      const familyMatches = normInputFamily && normInputFamily === normFName;

      return (nameMatches && familyMatches) || phoneMatches || waMatches || (nameMatches && !normInputFamily);
    }).slice(0, 5);
  }, [guests, formName, formFamily, formPhone, formWhatsApp, selectedGuest]);

  const toggleFamily = (famName: string) => {
    setExpandedFamilies(prev => ({ ...prev, [famName]: !prev[famName] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filterSide !== 'all') count++;
    if (filterInvType !== 'all') count++;
    if (filterRsvp !== 'all') count++;
    if (filterMembers !== 'all') count++;
    if (filterDate !== 'all') count++;
    return count;
  };

  const hasActiveFilters = (): boolean => getActiveFilterCount() > 0;

  const handleClearAllFilters = () => {
    setFilterSide('all');
    setFilterInvType('all');
    setFilterRsvp('all');
    setFilterMembers('all');
    setFilterDate('all');
    setSearchQuery('');
    toast.success('All search criteria and filters cleared.');
  };

  // Duplicate modal actions
  const handleDuplicateCreateAnyway = async () => {
    setIsDuplicateModalOpen(false);
    setDuplicateConfirmedOverride(true);
    
    // Log "Duplicate Ignored" in activity logs
    if (duplicateCheckResult && duplicateCheckResult.matchedGuest) {
      const activityRepo = new ActivityRepository();
      await activityRepo.addLog(
        currentWorkspaceId,
        currentWeddingId,
        'admin@projectra.com',
        'Duplicate Ignored',
        'guest',
        duplicateCheckResult.matchedGuest.id,
        `User chose to create duplicate record anyway for: "${formName}" (matches existing ID: "${duplicateCheckResult.matchedGuest.id}")`
      );
    }

    // Submit form bypass
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSave(fakeEvent, false, true);
    }, 100);
  };

  const handleDuplicateUpdateExisting = async () => {
    setIsDuplicateModalOpen(false);
    
    if (duplicateCheckResult && duplicateCheckResult.matchedGuest) {
      const matched = duplicateCheckResult.matchedGuest;
      
      // Log "Duplicate Resolved"
      const activityRepo = new ActivityRepository();
      await activityRepo.addLog(
        currentWorkspaceId,
        currentWeddingId,
        'admin@projectra.com',
        'Duplicate Resolved',
        'guest',
        matched.id,
        `User resolved duplicate by editing matched existing record ID: "${matched.id}"`
      );
      
      // Load matched record in modal
      handleOpenEditModal(matched);
      toast.success(`Loaded existing record for: "${matched.name}".`);
    }
  };

  const handleDuplicateViewExisting = async () => {
    setIsDuplicateModalOpen(false);
    
    if (duplicateCheckResult && duplicateCheckResult.matchedGuest) {
      const matched = duplicateCheckResult.matchedGuest;
      // Load matched record in read-only form state
      handleOpenEditModal(matched, true);
      toast.success(`Viewing matched record: "${matched.name}" (Read-Only)`);
    }
  };

  return (
    <div className="space-y-8 font-poppins relative">
      
      {/* High-fidelity CSS Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, header, .no-print, button, .filters-wrapper, .view-mode-bar, .pagination-wrapper {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .glass-panel {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 2rem;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #ddd !important;
            padding: 10px !important;
            color: black !important;
            font-size: 11px !important;
          }
          .print-table th {
            background-color: #f5f5f5 !important;
            font-weight: bold !important;
          }
        }
      `}} />

      {/* Print Title Header */}
      <div className="hidden print-header">
        <h1 className="font-cinzel text-2xl font-bold tracking-widest text-black uppercase">Project RA</h1>
        <p className="text-xs text-black/60 uppercase tracking-widest mt-1">Wedding Guest Manifest</p>
        <p className="text-[10px] text-black/40">Report Date: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Header Greeting panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D4AF37]/10 pb-6 no-print">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-cinzel text-[#F5F5F5] font-bold tracking-wide">
            Guest Database
          </h1>
          <p className="text-xs text-[#F5F5F5]/50">
            Active Workspace: <span className="text-[#D4AF37] font-semibold">{currentWorkspaceId}</span> • Wedding ID: <span className="text-[#D4AF37] font-semibold">{currentWeddingId}</span>
          </p>
        </div>
        
        {/* Top Actions */}
        <div className="flex flex-wrap gap-2.5 self-start sm:self-auto">
          <Button onClick={handleOpenAddModal} variant="primary" className="py-2 px-4 text-xs font-semibold">
            <Plus size={14} />
            <span>Add Guest</span>
          </Button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-[#F5F5F5]/80 text-xs font-semibold transition"
            title="Print Manifest"
          >
            <Printer size={14} />
            <span className="hidden md:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Recent Changes Banner (Sprint B.7 / Sync check) */}
      {activityLogs.length > 0 && (
        <Card className="p-4 border border-[#D4AF37]/10 bg-[#141414]/20 no-print">
          <div className="flex items-center justify-between mb-3 border-b border-[#D4AF37]/5 pb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <h3 className="font-cinzel text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                Recent Changes
              </h3>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">Real-Time Connected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activityLogs.slice(0, 3).map((log) => {
              const item = getFriendlyActivityText(log);
              return (
                <div key={log.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#090909]/45 border border-zinc-800/40 text-xs animate-fade">
                  <span className="text-base select-none">{item.icon}</span>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="font-medium text-[#F5F5F5]/80 leading-normal truncate text-xs" title={item.text}>
                      {item.text}
                    </p>
                    <span className="text-[9px] text-zinc-500 block">
                      {item.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Search & Collapsible Filters wrapper panel */}
      <div className="flex flex-col gap-4 no-print filters-wrapper">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guests by name, family, phone, or relation..."
              className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 text-[#F5F5F5] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#D4AF37]/40 transition"
            />
            <Search size={16} className="absolute left-3.5 top-3.5 text-[#F5F5F5]/40" />
          </div>
          
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition text-sm font-semibold ${
              isFilterPanelOpen 
                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]' 
                : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-[#F5F5F5]/80'
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="bg-[#D4AF37] text-[#090909] text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible Filter Panel Details */}
        {isFilterPanelOpen && (
          <Card className="p-5 border border-[#D4AF37]/15 bg-[#141414]/40 backdrop-blur-md rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in transition-all">
            {/* Family Side */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/50 font-semibold block">Family Side</label>
              <select
                value={filterSide}
                onChange={(e) => setFilterSide(e.target.value)}
                className="w-full text-xs bg-[#090909] border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-[#F5F5F5] rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none"
              >
                <option value="all">All Sides</option>
                <option value="bride">Bride Side</option>
                <option value="groom">Groom Side</option>
              </select>
            </div>

            {/* Invitation Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/50 font-semibold block">Invitation Type</label>
              <select
                value={filterInvType}
                onChange={(e) => setFilterInvType(e.target.value)}
                className="w-full text-xs bg-[#090909] border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-[#F5F5F5] rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="digital">Digital</option>
                <option value="printed">Printed</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* RSVP Status */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/50 font-semibold block">RSVP Status</label>
              <select
                value={filterRsvp}
                onChange={(e) => setFilterRsvp(e.target.value)}
                className="w-full text-xs bg-[#090909] border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-[#F5F5F5] rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none"
              >
                <option value="all">All RSVP</option>
                <option value="pending">Pending</option>
                <option value="attending">Accepted</option>
                <option value="declined">Declined</option>
                <option value="maybe">Maybe</option>
              </select>
            </div>

            {/* Members Count */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/50 font-semibold block">Members Count</label>
              <select
                value={filterMembers}
                onChange={(e) => setFilterMembers(e.target.value)}
                className="w-full text-xs bg-[#090909] border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-[#F5F5F5] rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none"
              >
                <option value="all">Any Count</option>
                <option value="1">1 member</option>
                <option value="2">2 members</option>
                <option value="3">3 members</option>
                <option value="4+">4+ members</option>
              </select>
            </div>

            {/* Recently Added */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/50 font-semibold block">Recently Added</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full text-xs bg-[#090909] border border-[#D4AF37]/10 focus:border-[#D4AF37]/40 text-[#F5F5F5] rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none"
              >
                <option value="all">Anytime</option>
                <option value="today">Added Today</option>
                <option value="week">Added This Week</option>
                <option value="month">Added This Month</option>
              </select>
            </div>
          </Card>
        )}

        {/* Filter Chips row */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/40 font-semibold mr-1">Active:</span>
            {filterSide !== 'all' && (
              <span className="flex items-center gap-1 text-[11px] font-medium bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] px-2.5 py-1 rounded-full animate-fade">
                <span>{filterSide === 'bride' ? 'Bride Side' : 'Groom Side'}</span>
                <button onClick={() => setFilterSide('all')} className="hover:text-white transition"><X size={10} /></button>
              </span>
            )}
            {filterInvType !== 'all' && (
              <span className="flex items-center gap-1 text-[11px] font-medium bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] px-2.5 py-1 rounded-full animate-fade">
                <span>Inv: {filterInvType}</span>
                <button onClick={() => setFilterInvType('all')} className="hover:text-white transition"><X size={10} /></button>
              </span>
            )}
            {filterRsvp !== 'all' && (
              <span className="flex items-center gap-1 text-[11px] font-medium bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] px-2.5 py-1 rounded-full animate-fade">
                <span>RSVP: {filterRsvp === 'attending' ? 'Accepted' : filterRsvp}</span>
                <button onClick={() => setFilterRsvp('all')} className="hover:text-white transition"><X size={10} /></button>
              </span>
            )}
            {filterMembers !== 'all' && (
              <span className="flex items-center gap-1 text-[11px] font-medium bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] px-2.5 py-1 rounded-full animate-fade">
                <span>Members: {filterMembers}</span>
                <button onClick={() => setFilterMembers('all')} className="hover:text-white transition"><X size={10} /></button>
              </span>
            )}
            {filterDate !== 'all' && (
              <span className="flex items-center gap-1 text-[11px] font-medium bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] px-2.5 py-1 rounded-full animate-fade">
                <span>{filterDate === 'today' ? 'Added Today' : filterDate === 'week' ? 'Added This Week' : 'Added This Month'}</span>
                <button onClick={() => setFilterDate('all')} className="hover:text-white transition"><X size={10} /></button>
              </span>
            )}
            <button
              onClick={handleClearAllFilters}
              className="text-[10px] uppercase font-semibold text-zinc-400 hover:text-white transition ml-2 border-b border-zinc-500/30 hover:border-white/50"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Roster list total header details */}
      <div className="flex justify-between items-center no-print border-b border-[#D4AF37]/5 pb-1.5">
        <span className="text-xs text-[#F5F5F5]/40 font-medium">
          Showing {Object.keys(familyGroups).length} Family Groups ({processedGuests.length} matching guests)
        </span>
      </div>

      {/* Family Sections Accordion Grid list (Sprint B.7) */}
      <div className="space-y-4 print-table">
        {Object.keys(familyGroups).length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-dashed border-[#D4AF37]/10 text-center space-y-3">
            <AlertTriangle size={36} className="text-[#D4AF37]/50 mx-auto animate-pulse" />
            <h3 className="text-sm font-semibold text-[#F5F5F5]">No matching family groups</h3>
            <p className="text-xs text-[#F5F5F5]/40 max-w-sm mx-auto leading-relaxed">
              Try updating your search query, clearing filters, or adding a new guest.
            </p>
          </div>
        ) : (
          Object.keys(familyGroups).sort().map((famName) => {
            const members = familyGroups[famName];
            const isExpanded = !!expandedFamilies[famName];
            
            // Calculate detailed family specs
            const guestsCount = members.length;
            const totalMembers = members.reduce((acc, curr) => acc + curr.membersCount, 0);
            const side = members[0]?.side || 'bride';
            
            const confirmedRsvp = members.filter(m => m.rsvpStatus === 'attending').length;
            const pendingRsvp = members.filter(m => m.rsvpStatus === 'pending').length;
            const declinedRsvp = members.filter(m => m.rsvpStatus === 'declined').length;
            const maybeRsvp = members.filter(m => m.rsvpStatus === 'maybe').length;
            
            const digitalInv = members.filter(m => m.invitationType === 'digital').length;
            const printedInv = members.filter(m => m.invitationType === 'printed').length;
            const bothInv = members.filter(m => m.invitationType === 'both').length;

            const lastUpdatedDate = members.reduce((acc, curr) => {
              const d = new Date(curr.updatedAt || curr.createdAt);
              return d > acc ? d : acc;
            }, new Date(0));
            
            const lastActivityStr = lastUpdatedDate.getTime() > 0 
              ? formatTimeAgo(lastUpdatedDate.toISOString()) 
              : 'No activity';

            return (
              <Card 
                key={famName} 
                className={`border transition-all duration-300 ${
                  isExpanded ? 'border-[#D4AF37] shadow-lg shadow-[#D4AF37]/5 bg-[#141414]/30' : 'border-[#D4AF37]/10 hover:border-[#D4AF37]/40 bg-[#141414]/10'
                }`}
              >
                {/* Header click trigger panel */}
                <div 
                  onClick={() => toggleFamily(famName)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none no-print"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/15 text-[#D4AF37] mt-0.5">
                      <Home size={18} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold font-cinzel text-[#F5F5F5] tracking-wide">
                          {famName}
                        </h4>
                        <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                          side === 'bride' 
                            ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {side} Side
                        </span>
                      </div>
                      <p className="text-xs text-[#F5F5F5]/60 font-medium">
                        {guestsCount} {guestsCount === 1 ? 'Guest' : 'Guests'} • {totalMembers} {totalMembers === 1 ? 'Member' : 'Members'}
                      </p>
                    </div>
                  </div>

                  {/* Summary Status pill indicators */}
                  <div className="flex flex-wrap items-center gap-3.5 text-xs text-[#F5F5F5]/60 md:mr-4">
                    
                    {/* RSVP Status */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block">RSVP Status</span>
                      <div className="flex gap-2">
                        {confirmedRsvp > 0 && <span className="text-emerald-400 font-semibold">{confirmedRsvp} Attending</span>}
                        {pendingRsvp > 0 && <span className="text-amber-500 font-semibold">{pendingRsvp} Pending</span>}
                        {declinedRsvp > 0 && <span className="text-rose-400 font-semibold">{declinedRsvp} Declined</span>}
                      </div>
                    </div>

                    {/* Invitation Type */}
                    <div className="flex flex-col gap-0.5 border-l border-zinc-800 pl-3.5">
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block">Invitations</span>
                      <span className="font-medium text-[#F5F5F5]/80">
                        {digitalInv > 0 && `${digitalInv} Digital`}
                        {printedInv > 0 && `${digitalInv > 0 ? ', ' : ''}${printedInv} Printed`}
                        {bothInv > 0 && `${digitalInv > 0 || printedInv > 0 ? ', ' : ''}${bothInv} Both`}
                      </span>
                    </div>

                    {/* Last Updated */}
                    <div className="flex flex-col gap-0.5 border-l border-zinc-800 pl-3.5 text-right hidden sm:flex">
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block">Last Update</span>
                      <span className="font-medium flex items-center gap-1 text-[11px] text-zinc-400 justify-end">
                        <Clock size={10} />
                        <span>{lastActivityStr}</span>
                      </span>
                    </div>

                    {/* Caret Indicator */}
                    <div className="text-[#D4AF37] ml-2">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Print Title (Visible on paper manifest lists only) */}
                <div className="hidden print-header border-b border-black pb-1 mb-2">
                  <h3 className="font-cinzel text-xs font-bold text-black uppercase">{famName} ({side} Side) — {guestsCount} Records, {totalMembers} Members</h3>
                </div>

                {/* Expanded Accordion container */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-[#D4AF37]/5 animate-fade-in space-y-4">
                    
                    {/* Summary KPI Cards & Future Actions Section */}
                    <div className="flex flex-col lg:flex-row gap-4 items-start justify-between">
                      {/* Family Summary Card Grid */}
                      <div className="w-full lg:flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#090909]/40 border border-zinc-800/40 p-4 rounded-xl">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold block">Guests / Members</span>
                          <span className="text-sm font-bold text-white font-mono">{guestsCount} / {totalMembers}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold block">RSVP Roster</span>
                          <span className="text-xs font-semibold block text-zinc-300 leading-tight">
                            Acc: {confirmedRsvp} | Pen: {pendingRsvp} | Dec: {declinedRsvp}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold block">Invitations Sent</span>
                          <span className="text-xs font-semibold block text-zinc-300 leading-tight">
                            Dig: {digitalInv} | Prt: {printedInv} | Both: {bothInv}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold block">Last Action</span>
                          <span className="text-xs font-semibold text-zinc-300 block truncate">{lastActivityStr}</span>
                        </div>
                      </div>

                      {/* Header Actions Buttons (Sprint B.7 Specs - Disabled placeholders) */}
                      <div className="flex gap-2.5 self-end lg:self-center no-print shrink-0">
                        <button 
                          disabled 
                          className="px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#090909]/20 text-zinc-600 text-[10px] font-bold uppercase tracking-wider cursor-not-allowed transition"
                        >
                          Edit Family
                        </button>
                        <button 
                          disabled 
                          className="px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#090909]/20 text-zinc-600 text-[10px] font-bold uppercase tracking-wider cursor-not-allowed transition flex items-center gap-1"
                        >
                          <Send size={10} />
                          <span>Send Inv</span>
                        </button>
                        <button 
                          disabled 
                          className="px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#090909]/20 text-zinc-600 text-[10px] font-bold uppercase tracking-wider cursor-not-allowed transition flex items-center gap-1"
                        >
                          <Clock size={10} />
                          <span>Timeline</span>
                        </button>
                      </div>
                    </div>

                    {/* Member Guests Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-poppins print-table">
                        <thead>
                          <tr className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-wider border-b border-[#D4AF37]/10 pb-2">
                            <th className="pb-2.5 pr-4">Name</th>
                            <th className="pb-2.5 pr-4">Members</th>
                            <th className="pb-2.5 pr-4">Invitation</th>
                            <th className="pb-2.5 pr-4">RSVP Status</th>
                            <th className="pb-2.5 pr-4">Phone / WhatsApp</th>
                            <th className="pb-2.5 pr-4">Relation</th>
                            <th className="pb-2.5 pr-4">Address / Notes</th>
                            <th className="pb-2.5 pr-4 no-print text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D4AF37]/5 text-[#F5F5F5]/85">
                          {members.map(member => (
                            <tr key={member.id} className="hover:bg-[#141414]/25 transition duration-150">
                              <td className="py-3 pr-4 font-semibold text-white flex items-center gap-1.5">
                                <span>{member.name}</span>
                                {member.duplicateConfirmed && (
                                  <span className="text-amber-500" title="Duplicate record confirmed by administrator">
                                    <AlertTriangle size={11} className="inline animate-pulse" />
                                  </span>
                                )}
                              </td>
                              <td className="py-3 pr-4 font-mono font-bold">{member.membersCount}</td>
                              <td className="py-3 pr-4 capitalize">{member.invitationType || 'digital'}</td>
                              <td className="py-3 pr-4 font-semibold">
                                <span className={
                                  member.rsvpStatus === 'attending' ? 'text-emerald-400' :
                                  member.rsvpStatus === 'declined' ? 'text-rose-400' :
                                  member.rsvpStatus === 'maybe' ? 'text-blue-400' : 'text-amber-500'
                                }>
                                  {member.rsvpStatus === 'attending' ? 'Accepted' : member.rsvpStatus || 'pending'}
                                </span>
                              </td>
                              <td className="py-3 pr-4 font-mono text-zinc-400">
                                {member.phone || member.whatsApp ? (
                                  <div className="flex flex-col text-[11px]">
                                    {member.phone && <span>P: {member.phone}</span>}
                                    {member.whatsApp && <span>W: {member.whatsApp}</span>}
                                  </div>
                                ) : '—'}
                              </td>
                              <td className="py-3 pr-4 text-zinc-300">{member.relation || '—'}</td>
                              <td className="py-3 pr-4 text-zinc-300">
                                <div className="flex flex-col max-w-[220px] truncate" title={`${member.address || ''} ${member.notes || ''}`}>
                                  {member.address && <span className="font-semibold">{member.address}</span>}
                                  {member.notes && <span className="text-[10px] text-zinc-500 mt-0.5">{member.notes}</span>}
                                </div>
                              </td>
                              <td className="py-3 no-print text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenEditModal(member); }}
                                    className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition"
                                    title="Edit Guest"
                                  >
                                    <Edit size={11} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(member); }}
                                    className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition"
                                    title="Delete Guest"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Add / Edit Guest Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={handleCancelClick}
        title={isReadOnly ? 'View Guest Details' : (selectedGuest ? 'Edit Guest Record' : 'Register New Guest')}
      >
        <form onSubmit={(e) => handleSave(e, false)} className="space-y-4 font-poppins">
          
          {/* Guest Name (Required) */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Guest Name *</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              disabled={isSaving || isReadOnly}
              className={`w-full text-sm bg-[#090909] border ${errors.name ? 'border-red-500' : 'border-[#D4AF37]/15'} focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-50`}
            />
            {errors.name && (
              <span className="text-red-400 text-[10px] mt-1 block">{errors.name}</span>
            )}

            {/* Live Duplicate Suggestions Panel (Sprint B.6) */}
            {!isReadOnly && liveSuggestions.length > 0 && (
              <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-2 mt-2">
                <div className="flex items-center gap-1.5 text-[9px] text-[#D4AF37] font-semibold uppercase tracking-wider">
                  <AlertTriangle size={11} />
                  <span>Possible Existing Guests</span>
                </div>
                <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                  {liveSuggestions.map(g => (
                    <div key={g.id} className="text-xs text-[#F5F5F5]/70 flex items-center justify-between border-b border-[#D4AF37]/5 pb-1">
                      <div>
                        <span className="font-semibold text-white">👤 {g.name}</span>
                        <span className="text-[9px] text-zinc-400 block sm:inline sm:ml-2">Family: {g.familyName}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(g, true)}
                          className="flex items-center gap-0.5 text-[9px] text-zinc-400 hover:text-white font-medium border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 rounded transition"
                        >
                          <Eye size={8} />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(g, false)}
                          className="flex items-center gap-0.5 text-[9px] text-[#D4AF37] hover:text-white font-medium border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-1.5 py-0.5 rounded transition"
                        >
                          <Edit size={8} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Family Name (Required) */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Family Group Name *</label>
            <input
              type="text"
              value={formFamily}
              onChange={(e) => setFormFamily(e.target.value)}
              placeholder="e.g. Jenkins Family"
              disabled={isSaving || isReadOnly}
              className={`w-full text-sm bg-[#090909] border ${errors.familyName ? 'border-red-500' : 'border-[#D4AF37]/15'} focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-50`}
            />
            {errors.familyName && (
              <span className="text-red-400 text-[10px] mt-1 block">{errors.familyName}</span>
            )}
          </div>

          {/* Side & Members Count */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block">Family Side *</label>
              <select
                value={formSide}
                onChange={(e) => setFormSide(e.target.value as any)}
                disabled={isSaving || isReadOnly}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-50"
              >
                <option value="bride">Bride Side</option>
                <option value="groom">Groom Side</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block">Members Count *</label>
              <select
                value={formMembersCount}
                onChange={(e) => setFormMembersCount(Number(e.target.value))}
                disabled={isSaving || isReadOnly}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-50"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Invitation Type & RSVP Status (Sprint B.5 Modal integrations) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block">Invitation Type *</label>
              <select
                value={formInvitationType}
                onChange={(e) => setFormInvitationType(e.target.value as any)}
                disabled={isSaving || isReadOnly}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-50"
              >
                <option value="digital">Digital (WhatsApp/Email)</option>
                <option value="printed">Printed Card</option>
                <option value="both">Both Types</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block">RSVP Status *</label>
              <select
                value={formRsvpStatus}
                onChange={(e) => setFormRsvpStatus(e.target.value as any)}
                disabled={isSaving || isReadOnly}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer font-poppins disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="attending">Accepted (Attending)</option>
                <option value="declined">Declined</option>
                <option value="maybe">Maybe</option>
              </select>
            </div>
          </div>

          {/* Phone & WhatsApp */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Phone Number</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="e.g. +923001234567"
                disabled={isSaving || isReadOnly}
                className={`w-full text-sm bg-[#090909] border ${errors.phone ? 'border-red-500' : 'border-[#D4AF37]/15'} focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-50`}
              />
              {errors.phone && (
                <span className="text-red-400 text-[10px] mt-1 block">{errors.phone}</span>
              )}
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={formWhatsApp}
                onChange={(e) => setFormWhatsApp(e.target.value)}
                placeholder="e.g. +923001234567"
                disabled={isSaving || isReadOnly}
                className={`w-full text-sm bg-[#090909] border ${errors.whatsApp ? 'border-red-500' : 'border-[#D4AF37]/15'} focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-50`}
              />
              {errors.whatsApp && (
                <span className="text-red-400 text-[10px] mt-1 block">{errors.whatsApp}</span>
              )}
            </div>
          </div>

          {/* Relation & Address */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Relation</label>
              <input
                type="text"
                value={formRelation}
                onChange={(e) => setFormRelation(e.target.value)}
                placeholder="e.g. Uncle, Colleague"
                disabled={isSaving || isReadOnly}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Address</label>
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="e.g. Madurai, Tamil Nadu"
                disabled={isSaving || isReadOnly}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block mb-1">Administrative Notes</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Vegetarian catering needed, VIP table."
              rows={3}
              disabled={isSaving || isReadOnly}
              className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition font-poppins disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3.5 border-t border-[#D4AF37]/10">
            {isReadOnly ? (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition text-xs font-bold shadow-md"
              >
                Close
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelClick}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition text-xs font-semibold disabled:opacity-40"
                >
                  Cancel
                </button>
                
                {!selectedGuest && (
                  <button
                    type="button"
                    onClick={(e) => handleSave(e, true)}
                    disabled={isSaving}
                    className="px-4 py-2.5 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/5 transition text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5"
                  >
                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : null}
                    <span>Save & Add Another</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#090909] hover:bg-[#F3E7C4] transition text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 shadow-md"
                >
                  {isSaving ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>{selectedGuest ? 'Update Guest' : 'Save Guest'}</span>
                </button>
              </>
            )}
          </div>

        </form>
      </Modal>

      {/* Discard Changes Confirmation Modal */}
      <Modal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        title="Discard Changes?"
      >
        <div className="space-y-4 font-poppins">
          <p className="text-xs text-[#F5F5F5]/80">
            Your edits have not been saved. Are you sure you want to discard your changes?
          </p>
          <div className="flex justify-end gap-2.5 pt-3.5 border-t border-[#D4AF37]/10">
            <button
              onClick={() => setIsDiscardModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsDiscardModalOpen(false);
                setIsAddEditModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition text-xs font-semibold shadow-md"
            >
              Discard
            </button>
          </div>
        </div>
      </Modal>

      {/* Duplicate Check Warning Modal (Sprint B.6) */}
      <Modal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        title="Possible Duplicate Found"
      >
        {duplicateCheckResult && duplicateCheckResult.matchedGuest && (
          <div className="space-y-4 font-poppins text-xs">
            <p className="text-[#F5F5F5]/80">
              The following guest record appears to already exist based on matching rules:
              <span className="text-amber-500 font-semibold block mt-1">
                Reason: {duplicateCheckResult.reason}
              </span>
            </p>

            <div className="p-4 rounded-xl bg-[#090909] border border-[#D4AF37]/10 space-y-2 text-[#F5F5F5]/80">
              <div>
                <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Name</span>
                <span className="text-[#D4AF37] font-semibold text-sm">{duplicateCheckResult.matchedGuest.name}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D4AF37]/5">
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Family Group</span>
                  <span className="font-medium">{duplicateCheckResult.matchedGuest.familyName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Phone</span>
                  <span className="font-mono">{duplicateCheckResult.matchedGuest.phone || '—'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D4AF37]/5">
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Added By</span>
                  <span className="truncate block font-medium">{duplicateCheckResult.matchedGuest.createdBy || 'System'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Created Date</span>
                  <span className="font-mono">{new Date(duplicateCheckResult.matchedGuest.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-3.5 border-t border-[#D4AF37]/10 justify-end">
              <button
                type="button"
                onClick={() => setIsDuplicateModalOpen(false)}
                className="px-3.5 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDuplicateViewExisting}
                className="px-3.5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-850 hover:bg-zinc-850 text-white transition font-semibold"
              >
                View Existing
              </button>

              <button
                type="button"
                onClick={handleDuplicateUpdateExisting}
                className="px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition font-semibold"
              >
                Update Existing
              </button>

              <button
                type="button"
                onClick={handleDuplicateCreateAnyway}
                className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#090909] hover:bg-[#F3E7C4] transition font-bold shadow-md"
              >
                Create Anyway
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Soft Delete"
      >
        <div className="space-y-4 font-poppins">
          <p className="text-xs text-[#F5F5F5]/80">
            Are you sure you want to remove guest <span className="text-[#D4AF37] font-semibold">"{selectedGuest?.name}"</span>?
          </p>
          <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl flex items-start gap-3">
            <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-red-300/80 leading-normal">
              This is a soft-delete action. The guest record will be hidden from current rosters but remains archived in the database.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-3.5 border-t border-[#D4AF37]/10">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition text-xs font-semibold shadow-md"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Guests;
