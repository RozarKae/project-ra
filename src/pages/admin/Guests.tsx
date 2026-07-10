import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Hourglass, 
  Home, 
  Award, 
  AlertTriangle,
  FileSpreadsheet,
  Grid,
  List
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { getGuests, saveGuest, deleteGuest } from '../../services/guestService';
import { checkPotentialDuplicate } from '../../utils/duplicateDetector';
import { Guest } from '../../types/guest';
import { toast } from 'react-hot-toast';

export const Guests: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSide, setFilterSide] = useState<'all' | 'bride' | 'groom'>('all');
  const [filterRsvp, setFilterRsvp] = useState<'all' | 'attending' | 'declined' | 'pending'>('all');
  const [filterVip, setFilterVip] = useState<'all' | 'vip' | 'regular'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'side' | 'rsvp'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'flat' | 'family'>('flat');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Expanded families tracking (for family grouping layout)
  const [expandedFamilies, setExpandedFamilies] = useState<Record<string, boolean>>({});

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSide, setFormSide] = useState<'bride' | 'groom'>('bride');
  const [formRsvp, setFormRsvp] = useState<'attending' | 'declined' | 'pending'>('pending');
  const [formVip, setFormVip] = useState(false);
  const [formFamily, setFormFamily] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Duplicate Check Result
  const [duplicateWarning, setDuplicateWarning] = useState<{ isDuplicate: boolean; matchedName?: string } | null>(null);

  // Load guests database
  const refreshGuests = () => {
    setGuests(getGuests());
  };

  useEffect(() => {
    refreshGuests();
  }, []);

  // Run duplicate detector on name or phone input changes
  useEffect(() => {
    if (formName.trim().length > 2 || formPhone.trim().length > 4) {
      const result = checkPotentialDuplicate(
        { name: formName, phone: formPhone },
        guests,
        selectedGuest?.id
      );
      if (result.isDuplicate) {
        setDuplicateWarning({ isDuplicate: true, matchedName: result.matchedGuestName });
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [formName, formPhone, guests, selectedGuest]);

  // Handle CRUD Form Submission
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Guest name is required.');
      return;
    }

    const payload: Guest = {
      id: selectedGuest?.id || 'guest_' + Math.random().toString(36).substr(2, 9),
      name: formName.trim(),
      phone: formPhone.trim(),
      side: formSide,
      rsvpStatus: formRsvp,
      isVip: formVip,
      familyName: formFamily.trim() || undefined,
      notes: formNotes.trim() || undefined,
      createdAt: selectedGuest?.createdAt || new Date().toISOString(),
      isDeleted: false
    };

    saveGuest(payload);
    setIsAddEditModalOpen(false);
    resetForm();
    refreshGuests();
    toast.success(selectedGuest ? 'Guest record updated.' : 'Guest added successfully.');
  };

  const handleOpenAddModal = () => {
    setSelectedGuest(null);
    resetForm();
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (guest: Guest) => {
    setSelectedGuest(guest);
    setFormName(guest.name);
    setFormPhone(guest.phone || '');
    setFormSide(guest.side);
    setFormRsvp(guest.rsvpStatus);
    setFormVip(guest.isVip);
    setFormFamily(guest.familyName || '');
    setFormNotes(guest.notes || '');
    setIsAddEditModalOpen(true);
  };

  const handleOpenDeleteModal = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedGuest) {
      deleteGuest(selectedGuest.id);
      setIsDeleteModalOpen(false);
      setSelectedGuest(null);
      refreshGuests();
      toast.success('Guest soft deleted successfully.');
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormSide('bride');
    setFormRsvp('pending');
    setFormVip(false);
    setFormFamily('');
    setFormNotes('');
    setDuplicateWarning(null);
  };

  // Filtered & Sorted Guests
  const processedGuests = useMemo(() => {
    let result = [...guests];

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g => 
        g.name.toLowerCase().includes(q) || 
        (g.phone && g.phone.includes(q)) ||
        (g.familyName && g.familyName.toLowerCase().includes(q))
      );
    }

    // Filters
    if (filterSide !== 'all') {
      result = result.filter(g => g.side === filterSide);
    }
    if (filterRsvp !== 'all') {
      result = result.filter(g => g.rsvpStatus === filterRsvp);
    }
    if (filterVip !== 'all') {
      result = result.filter(g => filterVip === 'vip' ? g.isVip : !g.isVip);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'side') {
        comparison = a.side.localeCompare(b.side);
      } else if (sortBy === 'rsvp') {
        comparison = a.rsvpStatus.localeCompare(b.rsvpStatus);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [guests, searchQuery, filterSide, filterRsvp, filterVip, sortBy, sortOrder]);

  // Family Grouped Guests
  const familyGroups = useMemo(() => {
    const groups: Record<string, Guest[]> = {};
    processedGuests.forEach(g => {
      const famName = g.familyName ? g.familyName.trim() : 'No Family Group';
      if (!groups[famName]) {
        groups[famName] = [];
      }
      groups[famName].push(g);
    });
    return groups;
  }, [processedGuests]);

  // Pagination bounds
  const paginatedGuests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedGuests.slice(startIndex, startIndex + pageSize);
  }, [processedGuests, currentPage, pageSize]);

  const totalPages = Math.ceil(processedGuests.length / pageSize);

  // Toggle family expand/collapse
  const toggleFamily = (famName: string) => {
    setExpandedFamilies(prev => ({
      ...prev,
      [famName]: !prev[famName]
    }));
  };

  // CSV Manifest Downloader
  const handleExportCSV = () => {
    if (processedGuests.length === 0) {
      toast.error('No guest data to export.');
      return;
    }

    const headers = ['Name', 'Phone', 'Side', 'RSVP Status', 'VIP', 'Family Group', 'Notes', 'Created At'];
    const rows = processedGuests.map(g => [
      g.name,
      g.phone || '',
      g.side.toUpperCase(),
      g.rsvpStatus.toUpperCase(),
      g.isVip ? 'YES' : 'NO',
      g.familyName || '',
      g.notes || '',
      g.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `project_ra_guests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV manifest generated.');
  };

  // Excel Manifest Downloader (Tab Delimited)
  const handleExportExcel = () => {
    if (processedGuests.length === 0) {
      toast.error('No guest data to export.');
      return;
    }

    const headers = ['Name', 'Phone', 'Side', 'RSVP Status', 'VIP', 'Family Group', 'Notes', 'Created At'];
    const rows = processedGuests.map(g => [
      g.name,
      g.phone || '',
      g.side.toUpperCase(),
      g.rsvpStatus.toUpperCase(),
      g.isVip ? 'YES' : 'NO',
      g.familyName || '',
      g.notes || '',
      g.createdAt
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `project_ra_guests_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Excel-formatted file downloaded.');
  };

  const handlePrint = () => {
    window.print();
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

      {/* Print Title Header (Invisible on Screen) */}
      <div className="hidden print-header">
        <h1 className="font-cinzel text-2xl font-bold tracking-widest text-black uppercase">Project RA</h1>
        <p className="text-xs text-black/60 uppercase tracking-widest mt-1">Unified Guest Manifest Summary</p>
        <p className="text-[10px] text-black/40 mt-0.5">Report Date: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Header Greeting panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D4AF37]/10 pb-6 no-print">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-cinzel text-[#F5F5F5] font-bold tracking-wide">
            Guest Database
          </h1>
          <p className="text-xs text-[#F5F5F5]/50">
            Create, retrieve, update, and sort invitees across Bride and Groom families.
          </p>
        </div>
        
        {/* Top Header Actions */}
        <div className="flex flex-wrap gap-2.5 self-start sm:self-auto">
          <Button onClick={handleOpenAddModal} variant="primary" className="py-2 px-4 text-xs font-semibold">
            <Plus size={14} />
            <span>Add Guest</span>
          </Button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-[#F5F5F5]/80 text-xs font-semibold transition"
            title="Download CSV"
          >
            <Download size={14} />
            <span className="hidden md:inline">CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-[#F5F5F5]/80 text-xs font-semibold transition"
            title="Download Excel"
          >
            <FileSpreadsheet size={14} />
            <span className="hidden md:inline">Excel</span>
          </button>
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

      {/* Filter and Search controls */}
      <Card className="p-5 no-print filters-wrapper">
        <div className="space-y-4">
          {/* Top Search bar */}
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, phone, or family group..."
              className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 text-[#F5F5F5] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#D4AF37]/40 transition"
            />
            <Search size={16} className="absolute left-3.5 top-3.5 text-[#F5F5F5]/40" />
          </div>

          {/* Lower Filter Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#D4AF37]/5">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              
              {/* Side Filter */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/40 font-semibold block">Family Side</span>
                <select 
                  value={filterSide}
                  onChange={(e) => { setFilterSide(e.target.value as any); setCurrentPage(1); }}
                  className="bg-[#090909] border border-[#D4AF37]/15 text-[#F5F5F5] rounded-lg px-2.5 py-1.5 focus:outline-none text-xs font-medium cursor-pointer"
                >
                  <option value="all">All Sides</option>
                  <option value="bride">Bride Side</option>
                  <option value="groom">Groom Side</option>
                </select>
              </div>

              {/* RSVP Filter */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/40 font-semibold block">RSVP Status</span>
                <select 
                  value={filterRsvp}
                  onChange={(e) => { setFilterRsvp(e.target.value as any); setCurrentPage(1); }}
                  className="bg-[#090909] border border-[#D4AF37]/15 text-[#F5F5F5] rounded-lg px-2.5 py-1.5 focus:outline-none text-xs font-medium cursor-pointer"
                >
                  <option value="all">All RSVPs</option>
                  <option value="attending">Attending</option>
                  <option value="declined">Declined</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* VIP Filter */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/40 font-semibold block">VIP Tier</span>
                <select 
                  value={filterVip}
                  onChange={(e) => { setFilterVip(e.target.value as any); setCurrentPage(1); }}
                  className="bg-[#090909] border border-[#D4AF37]/15 text-[#F5F5F5] rounded-lg px-2.5 py-1.5 focus:outline-none text-xs font-medium cursor-pointer"
                >
                  <option value="all">All Guests</option>
                  <option value="vip">VIP Only</option>
                  <option value="regular">Regular Only</option>
                </select>
              </div>

            </div>

            {/* Sorting controls */}
            <div className="flex items-center gap-3 text-xs self-end">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#F5F5F5]/40 font-semibold block text-right">Order By</span>
                <div className="flex items-center gap-2">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-[#090909] border border-[#D4AF37]/15 text-[#F5F5F5] rounded-lg px-2.5 py-1.5 focus:outline-none text-xs font-medium cursor-pointer"
                  >
                    <option value="name">Name</option>
                    <option value="date">Date Added</option>
                    <option value="side">Family Side</option>
                    <option value="rsvp">RSVP Status</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-2 rounded-lg bg-[#090909] border border-[#D4AF37]/15 text-[#D4AF37] hover:bg-[#141414] transition"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Card>

      {/* Layout Toggle View Mode (Flat table vs Family Expandable groups) */}
      <div className="flex justify-between items-center no-print view-mode-bar">
        <span className="text-xs text-[#F5F5F5]/40">
          Showing {processedGuests.length} active matching records
        </span>
        
        <div className="flex rounded-xl bg-[#141414] border border-[#D4AF37]/10 p-0.5">
          <button
            onClick={() => setViewMode('flat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === 'flat' 
                ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/15' 
                : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5]'
            }`}
          >
            <List size={13} />
            <span>Flat Table</span>
          </button>
          <button
            onClick={() => setViewMode('family')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === 'family' 
                ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/15' 
                : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5]'
            }`}
          >
            <Grid size={13} />
            <span>Family Sections</span>
          </button>
        </div>
      </div>

      {/* Flat List Table Layout */}
      {viewMode === 'flat' && (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl relative">
          <table className="w-full print-table text-left border-collapse text-xs font-poppins">
            <thead>
              <tr className="border-b border-[#D4AF37]/10 bg-[#090909]/40 text-[#D4AF37] uppercase tracking-wider text-[10px] font-semibold sticky top-0 z-10 backdrop-blur-md">
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Side</th>
                <th className="p-4">Family Group</th>
                <th className="p-4">RSVP Status</th>
                <th className="p-4">VIP</th>
                <th className="p-4 no-print text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/5 text-[#F5F5F5]/85">
              {paginatedGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#F5F5F5]/30">
                    No active guest matches found.
                  </td>
                </tr>
              ) : (
                paginatedGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-[#141414]/30 transition duration-150">
                    <td className="p-4 font-semibold text-[#F5F5F5]">{guest.name}</td>
                    <td className="p-4 font-mono text-[#F5F5F5]/70">{guest.phone || '—'}</td>
                    <td className="p-4">
                      <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                        guest.side === 'bride' 
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {guest.side}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-[#F5F5F5]/70">
                      {guest.familyName ? (
                        <span className="flex items-center gap-1.5">
                          <Home size={12} className="text-[#D4AF37]/50" />
                          <span>{guest.familyName}</span>
                        </span>
                      ) : (
                        <span className="text-[#F5F5F5]/30 italic">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase ${
                        guest.rsvpStatus === 'attending' ? 'text-[#0F6D5B]' :
                        guest.rsvpStatus === 'declined' ? 'text-rose-400' : 'text-amber-500'
                      }`}>
                        {guest.rsvpStatus === 'attending' && <CheckCircle2 size={12} />}
                        {guest.rsvpStatus === 'declined' && <XCircle size={12} />}
                        {guest.rsvpStatus === 'pending' && <Hourglass size={12} />}
                        <span>{guest.rsvpStatus}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      {guest.isVip ? (
                        <span className="flex items-center gap-1 text-[#D4AF37] font-semibold" title="VIP Guest">
                          <Award size={13} />
                          <span className="text-[9px] uppercase tracking-wider">VIP</span>
                        </span>
                      ) : (
                        <span className="text-[#F5F5F5]/30">—</span>
                      )}
                    </td>
                    <td className="p-4 no-print text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(guest)}
                          className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition"
                          title="Edit Guest"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(guest)}
                          className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-950 transition"
                          title="Soft Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Table Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#D4AF37]/10 flex items-center justify-between text-xs no-print pagination-wrapper">
              <span className="text-[#F5F5F5]/45">
                Page {currentPage} of {totalPages}
              </span>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#D4AF37] disabled:opacity-30 disabled:pointer-events-none transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#D4AF37] disabled:opacity-30 disabled:pointer-events-none transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsible Family Group Layout */}
      {viewMode === 'family' && (
        <div className="space-y-4 print-table">
          {Object.keys(familyGroups).length === 0 ? (
            <Card className="p-8 text-center text-xs text-[#F5F5F5]/30">
              No matching family logs.
            </Card>
          ) : (
            Object.keys(familyGroups).map((famName) => {
              const members = familyGroups[famName];
              const isExpanded = !!expandedFamilies[famName];
              
              // Compute family RSVP summary
              const attendingCount = members.filter(m => m.rsvpStatus === 'attending').length;
              const pendingCount = members.filter(m => m.rsvpStatus === 'pending').length;
              const declinedCount = members.filter(m => m.rsvpStatus === 'declined').length;

              return (
                <Card key={famName} className="p-4 border border-[#D4AF37]/10">
                  <div 
                    onClick={() => toggleFamily(famName)}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer select-none no-print"
                  >
                    <div className="flex items-center gap-3">
                      <Home size={18} className="text-[#D4AF37]" />
                      <div>
                        <h4 className="text-sm font-semibold tracking-wide font-cinzel text-[#F5F5F5]">
                          {famName}
                        </h4>
                        <span className="text-[10px] text-[#F5F5F5]/40">
                          {members.length} {members.length === 1 ? 'member' : 'members'} registered
                        </span>
                      </div>
                    </div>

                    {/* RSVP summary pills */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-2 text-[9px] uppercase tracking-wider font-semibold">
                        {attendingCount > 0 && (
                          <span className="bg-[#0F6D5B]/15 text-[#148C75] border border-[#0F6D5B]/30 px-2 py-0.5 rounded-full">
                            {attendingCount} Attending
                          </span>
                        )}
                        {pendingCount > 0 && (
                          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            {pendingCount} Pending
                          </span>
                        )}
                        {declinedCount > 0 && (
                          <span className="bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">
                            {declinedCount} Declined
                          </span>
                        )}
                      </div>
                      <div className="text-[#D4AF37]">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Print Title (Visible on paper only) */}
                  <div className="hidden print-header border-b border-black pb-1 mb-2">
                    <h3 className="font-cinzel text-xs font-bold text-black uppercase">{famName}</h3>
                  </div>

                  {/* Collapsible Member list */}
                  {(isExpanded || window.matchMedia('print').matches) && (
                    <div className="mt-4 pt-4 border-t border-[#D4AF37]/5 overflow-x-auto">
                      <table className="w-full text-left text-xs font-poppins print-table">
                        <thead>
                          <tr className="text-[#D4AF37]/60 text-[10px] uppercase font-semibold">
                            <th className="pb-2 pr-4">Name</th>
                            <th className="pb-2 pr-4">Phone</th>
                            <th className="pb-2 pr-4">Side</th>
                            <th className="pb-2 pr-4">RSVP Status</th>
                            <th className="pb-2 pr-4">VIP</th>
                            <th className="pb-2 pr-4 no-print">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D4AF37]/5 text-[#F5F5F5]/80">
                          {members.map(member => (
                            <tr key={member.id} className="hover:bg-[#141414]/20 transition-all">
                              <td className="py-2.5 font-medium text-[#F5F5F5]">{member.name}</td>
                              <td className="py-2.5 font-mono text-[#F5F5F5]/60">{member.phone || '—'}</td>
                              <td className="py-2.5 text-[10px] uppercase">{member.side}</td>
                              <td className="py-2.5 font-semibold text-[10px] uppercase">
                                <span className={
                                  member.rsvpStatus === 'attending' ? 'text-[#0F6D5B]' :
                                  member.rsvpStatus === 'declined' ? 'text-rose-400' : 'text-amber-500'
                                }>
                                  {member.rsvpStatus}
                                </span>
                              </td>
                              <td className="py-2.5">
                                {member.isVip ? (
                                  <span className="text-[#D4AF37] font-semibold text-[9px] uppercase">VIP</span>
                                ) : (
                                  <span className="text-[#F5F5F5]/30">—</span>
                                )}
                              </td>
                              <td className="py-2.5 no-print">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleOpenEditModal(member)}
                                    className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#D4AF37] transition"
                                  >
                                    <Edit size={10} />
                                  </button>
                                  <button
                                    onClick={() => handleOpenDeleteModal(member)}
                                    className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 transition"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Add / Edit Guest Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={selectedGuest ? 'Edit Guest Record' : 'Register New Guest'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Guest Name */}
          <div>
            <Input
              type="text"
              label="Guest Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              required
            />
            {duplicateWarning && (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-500 mt-1.5 font-medium animate-pulse">
                <AlertTriangle size={12} />
                <span>Potential Duplicate Warning: Similiar record matches "{duplicateWarning.matchedName}"</span>
              </div>
            )}
          </div>

          {/* Guest Phone */}
          <Input
            type="text"
            label="Phone Number"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            placeholder="e.g. +92 300 123456"
          />

          {/* Family Side & RSVP Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block">Family Side</label>
              <select
                value={formSide}
                onChange={(e) => setFormSide(e.target.value as any)}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer"
              >
                <option value="bride">Bride Side</option>
                <option value="groom">Groom Side</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block">RSVP Status</label>
              <select
                value={formRsvp}
                onChange={(e) => setFormRsvp(e.target.value as any)}
                className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="attending">Attending</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>

          {/* Family Group Tag */}
          <Input
            type="text"
            label="Family Group Name (Optional)"
            value={formFamily}
            onChange={(e) => setFormFamily(e.target.value)}
            placeholder="e.g. Jenkins Family"
          />

          {/* VIP Toggle Checkbox */}
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#090909] border border-[#D4AF37]/10">
            <input
              type="checkbox"
              id="isVipCheckbox"
              checked={formVip}
              onChange={(e) => setFormVip(e.target.checked)}
              className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
            />
            <label htmlFor="isVipCheckbox" className="text-xs text-[#F5F5F5]/70 font-semibold cursor-pointer select-none">
              Designate as VIP Guest (Puts gold badge indicator)
            </label>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#F5F5F5]/60 font-semibold block">Administrative Notes</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Groom's high school friend, needs vegetarian catering."
              rows={3}
              className="w-full text-sm bg-[#090909] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-[#F5F5F5] rounded-xl px-3 py-3 focus:outline-none transition font-poppins"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3.5 border-t border-[#D4AF37]/10">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition text-xs font-semibold"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" className="py-2.5 px-5 text-xs">
              Save Guest
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Soft Delete"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#F5F5F5]/80">
            Are you sure you want to remove guest <span className="text-[#D4AF37] font-semibold">"{selectedGuest?.name}"</span>?
          </p>
          <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl flex items-start gap-3">
            <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-red-300/80 leading-normal">
              This is a soft-delete action. The guest record will be hidden from current rosters but remains archived in the system databases.
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
