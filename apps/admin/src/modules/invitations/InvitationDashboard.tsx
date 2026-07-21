import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Eye, RefreshCw, 
  Download, QrCode, Search, AlertCircle, CheckCircle2, History, ExternalLink 
} from 'lucide-react';
import { useInvitations } from '@project-ra/shared';
import { Invitation, InvitationStatus, DeliveryStatus, InvitationType } from '@project-ra/types';
import { useAuth } from '@project-ra/firebase';
import { toast } from 'react-hot-toast';
import { Button, Card } from '@project-ra/ui';
import { motion, AnimatePresence } from 'framer-motion';

export const InvitationDashboard: React.FC = () => {
  const { user } = useAuth();
  const operatorName = user?.email?.split('@')[0] || 'admin';
  
  const {
    invitations,
    guests,
    loading,
    saveInvitation,
    deleteInvitation,
    bulkGenerate,
    bulkDelete,
    bulkUpdateDelivery,
    bulkUpdateStatus,
    recordQrScan
  } = useInvitations();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDelivery, setFilterDelivery] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals state
  const [previewInvite, setPreviewInvite] = useState<Invitation | null>(null);
  const [historyInvite, setHistoryInvite] = useState<Invitation | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New invitation form state
  const [newInviteGuestId, setNewInviteGuestId] = useState('');
  const [newInviteType, setNewInviteType] = useState<InvitationType>('digital');

  // Filter lists computation
  const categories = useMemo(() => {
    const set = new Set<string>();
    guests.forEach(g => g.relation && set.add(g.relation));
    return Array.from(set);
  }, [guests]);

  // Derived filtered invitations
  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      const matchSearch = 
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.qrCode.code && inv.qrCode.code.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = filterType === 'all' || inv.invitationType === filterType;
      const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
      const matchDelivery = filterDelivery === 'all' || inv.deliveryStatus === filterDelivery;
      const matchCategory = filterCategory === 'all' || inv.guestCategory === filterCategory;

      return matchSearch && matchType && matchStatus && matchDelivery && matchCategory;
    });
  }, [invitations, searchTerm, filterType, filterStatus, filterDelivery, filterCategory]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = invitations.length;
    const draft = invitations.filter(i => i.status === 'draft').length;
    const sent = invitations.filter(i => i.status === 'sent').length;
    const viewed = invitations.filter(i => i.status === 'viewed').length;
    const accepted = invitations.filter(i => i.status === 'accepted').length;
    const declined = invitations.filter(i => i.status === 'declined').length;
    const deliveryRate = total > 0 
      ? Math.round((invitations.filter(i => i.deliveryStatus !== 'not-sent').length / total) * 100) 
      : 0;

    return { total, draft, sent, viewed, accepted, declined, deliveryRate };
  }, [invitations]);

  // Guests without invitation dropdown options
  const eligibleGuests = useMemo(() => {
    return guests.filter(g => !invitations.some(i => i.guestId === g.id));
  }, [guests, invitations]);

  // Selection toggle
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredInvitations.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk operation triggers
  const handleBulkGenerate = async () => {
    try {
      await bulkGenerate(operatorName);
      toast.success('Successfully generated invitations for all remaining guests!');
    } catch {
      toast.error('Failed to generate invitations.');
    }
  };

  const handleBulkDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected invitations?`)) {
      try {
        await bulkDelete(selectedIds, operatorName);
        setSelectedIds([]);
        toast.success('Successfully deleted selected invitations.');
      } catch {
        toast.error('Failed to delete invitations.');
      }
    }
  };

  const handleBulkUpdateStatus = async (status: InvitationStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkUpdateStatus(selectedIds, status, operatorName);
      setSelectedIds([]);
      toast.success(`Successfully updated status to ${status.toUpperCase()}!`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleBulkUpdateDelivery = async (delivery: DeliveryStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkUpdateDelivery(selectedIds, delivery, operatorName);
      setSelectedIds([]);
      toast.success(`Delivery channel updated to ${delivery.toUpperCase()}!`);
    } catch {
      toast.error('Failed to update delivery.');
    }
  };

  const handleSingleGenerate = async (guestId: string, type: InvitationType) => {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;

    const nowStr = new Date().toISOString();
    const inviteId = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newInvite: Invitation = {
      id: inviteId,
      guestId: guest.id,
      guestName: guest.name,
      familyName: guest.familyName || 'None',
      guestCategory: guest.relation || 'General',
      invitationType: type,
      status: 'draft',
      deliveryStatus: 'not-sent',
      qrCode: {
        code: `QR-${guest.id}`,
        scanCount: 0,
        encryptedLink: `https://batpaiyancatponnu.online/#/invitation?id=${guest.id}`
      },
      rsvpStatus: guest.rsvpStatus === 'attending' ? 'accepted' : (guest.rsvpStatus || 'pending'),
      attendanceCount: guest.membersCount || 1,
      createdAt: nowStr,
      history: [{ event: 'Invitation Draft Created', timestamp: nowStr, operator: operatorName }]
    };

    try {
      await saveInvitation(newInvite, operatorName);
      setShowAddModal(false);
      setNewInviteGuestId('');
      toast.success(`Created invitation draft ${inviteId}`);
    } catch {
      toast.error('Failed to create invitation draft.');
    }
  };

  const handleDownloadCSV = () => {
    if (filteredInvitations.length === 0) {
      toast.error('No invitations to export.');
      return;
    }
    const headers = 'Invitation ID,Guest Name,Family Name,Category,Type,Status,Delivery,QR Code,Scans,RSVP\n';
    const rows = filteredInvitations.map(i => 
      `"${i.id}","${i.guestName}","${i.familyName}","${i.guestCategory}","${i.invitationType}","${i.status}","${i.deliveryStatus}","${i.qrCode.code}",${i.qrCode.scanCount},"${i.rsvpStatus}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `invitations_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Invitations exported as CSV successfully!');
  };

  const handlePrintSelected = () => {
    if (selectedIds.length === 0) return;
    toast.success(`Send ${selectedIds.length} cards to print layout queue.`);
  };

  // Color helper functions
  const getStatusColor = (status: InvitationStatus) => {
    switch (status) {
      case 'accepted': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'declined': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'sent': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'viewed': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'draft': return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
      default: return 'text-zinc-300 bg-zinc-500/5 border-zinc-500/10';
    }
  };

  const getDeliveryColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'whatsapp': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'email': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'delivered': return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
      case 'opened': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'printed': return 'text-zinc-300 bg-zinc-700/20 border-zinc-700/30';
      default: return 'text-zinc-500 bg-zinc-800/10 border-zinc-800/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-6 font-poppins text-zinc-400">
        <div className="h-8 bg-zinc-900 rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-[#141414] border border-[#D4AF37]/5 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-[#141414] border border-[#D4AF37]/5 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-poppins text-[#F5F5F5]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold tracking-wider text-[#D4AF37] uppercase">
            Invitation Control Center
          </h1>
          <p className="text-xs text-[#F5F5F5]/60 mt-1">
            Generate, customize, and trace delivery metrics for wedding invitations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" className="flex items-center gap-2 text-xs py-2 px-3 border-[#D4AF37]/20" onClick={handleBulkGenerate}>
            <RefreshCw size={14} className="text-[#D4AF37]" />
            <span>Generate Remaining</span>
          </Button>
          <Button variant="secondary" className="flex items-center gap-2 text-xs py-2 px-3" onClick={() => setShowAddModal(true)}>
            <Plus size={14} />
            <span>Single Draft</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border border-[#D4AF37]/15 bg-[#141414]/60">
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold">Total Generated</span>
            <span className="text-2xl font-bold block mt-1 tracking-tight text-[#F5F5F5]">{stats.total}</span>
          </div>
        </Card>
        <Card className="border border-[#D4AF37]/10 bg-[#141414]/60">
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold">Drafts</span>
            <span className="text-2xl font-bold block mt-1 tracking-tight text-[#D4AF37]/65">{stats.draft}</span>
          </div>
        </Card>
        <Card className="border border-sky-500/10 bg-[#141414]/60">
          <div>
            <span className="text-[10px] text-sky-500/80 block uppercase tracking-wider font-semibold">Sent Queue</span>
            <span className="text-2xl font-bold block mt-1 tracking-tight text-sky-400">{stats.sent}</span>
          </div>
        </Card>
        <Card className="border border-amber-500/10 bg-[#141414]/60">
          <div>
            <span className="text-[10px] text-amber-500/80 block uppercase tracking-wider font-semibold">Viewed / Opened</span>
            <span className="text-2xl font-bold block mt-1 tracking-tight text-amber-400">{stats.viewed}</span>
          </div>
        </Card>
        <Card className="border border-emerald-500/15 bg-[#141414]/60">
          <div>
            <span className="text-[10px] text-[#0F6D5B] block uppercase tracking-wider font-semibold">RSVP Accepted</span>
            <span className="text-2xl font-bold block mt-1 tracking-tight text-emerald-400">{stats.accepted}</span>
          </div>
        </Card>
        <Card className="border border-[#D4AF37]/10 bg-[#141414]/60">
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold">Delivery Rate</span>
            <span className="text-2xl font-bold block mt-1 tracking-tight text-[#0F6D5B]">{stats.deliveryRate}%</span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/10 space-y-4 bg-[#141414]/40">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full lg:max-w-md">
            <input
              type="text"
              placeholder="Search by Guest, Invitation ID, QR or Family..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 text-[#F5F5F5] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20 transition"
            />
            <Search size={14} className="absolute left-3.5 top-3.5 text-[#F5F5F5]/40" />
          </div>

          {/* Download Report Button */}
          <button
            onClick={handleDownloadCSV}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#0F6D5B]/30 bg-[#0F6D5B]/5 hover:bg-[#0F6D5B]/10 text-emerald-400 text-xs font-semibold transition"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filters dropdown grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Invitation Type Filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-[#090909] border border-[#D4AF37]/10 text-zinc-300 text-xs rounded-lg p-2 focus:outline-none focus:border-[#D4AF37]/45"
            >
              <option value="all">All Types</option>
              <option value="digital">Digital</option>
              <option value="printed">Printed</option>
              <option value="vip">VIP</option>
              <option value="family">Family</option>
              <option value="friends">Friends</option>
              <option value="bride_side">Bride Side</option>
              <option value="groom_side">Groom Side</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Invitation Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-[#090909] border border-[#D4AF37]/10 text-zinc-300 text-xs rounded-lg p-2 focus:outline-none focus:border-[#D4AF37]/45"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="generated">Generated</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Delivery Channel Filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Delivery</label>
            <select
              value={filterDelivery}
              onChange={(e) => setFilterDelivery(e.target.value)}
              className="w-full bg-[#090909] border border-[#D4AF37]/10 text-zinc-300 text-xs rounded-lg p-2 focus:outline-none focus:border-[#D4AF37]/45"
            >
              <option value="all">All Channels</option>
              <option value="not-sent">Not Sent</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="printed">Printed</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
            </select>
          </div>

          {/* Guest Category Filter */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-[#090909] border border-[#D4AF37]/10 text-zinc-300 text-xs rounded-lg p-2 focus:outline-none focus:border-[#D4AF37]/45"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Operations Toolbar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-4 rounded-xl border border-[#D4AF37]/20 bg-[#141414] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 z-20"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] font-mono">
                {selectedIds.length} Selected
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Delivery Sync */}
              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkUpdateDelivery(e.target.value as DeliveryStatus);
                  e.target.value = '';
                }}
                className="bg-[#090909] border border-zinc-700 text-zinc-300 text-[10px] rounded p-1.5 focus:outline-none uppercase font-semibold"
              >
                <option value="">Set Delivery</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="printed">Printed</option>
                <option value="delivered">Delivered</option>
                <option value="opened">Opened</option>
              </select>

              {/* Status Sync */}
              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkUpdateStatus(e.target.value as InvitationStatus);
                  e.target.value = '';
                }}
                className="bg-[#090909] border border-zinc-700 text-zinc-300 text-[10px] rounded p-1.5 focus:outline-none uppercase font-semibold"
              >
                <option value="">Set Status</option>
                <option value="draft">Draft</option>
                <option value="generated">Generated</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="expired">Expired</option>
              </select>

              <button
                onClick={handlePrintSelected}
                className="flex items-center gap-1 bg-[#141414] hover:bg-zinc-800 text-zinc-300 text-[10px] border border-zinc-700 px-3 py-1.5 rounded transition uppercase font-semibold"
              >
                <span>Print Queue</span>
              </button>

              <button
                onClick={handleBulkDeleteSelected}
                className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/25 text-[10px] px-3 py-1.5 rounded transition uppercase font-semibold"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main List Area */}
      <div className="glass-panel rounded-3xl border border-[#D4AF37]/10 overflow-hidden bg-[#141414]/20">
        {filteredInvitations.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 space-y-3">
            <AlertCircle size={36} className="mx-auto text-[#D4AF37]/45" />
            <h3 className="font-cinzel text-sm uppercase tracking-widest text-[#F5F5F5]">No matching invitations</h3>
            <p className="text-[11px] max-w-sm mx-auto text-[#F5F5F5]/45">
              Clear your searches or click 'Generate Remaining' at the top to draft invitations automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="hidden md:table w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#D4AF37]/10 bg-[#090909]/60 text-zinc-400">
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === filteredInvitations.length && filteredInvitations.length > 0}
                      className="rounded border-[#D4AF37]/20 accent-[#D4AF37] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-4 uppercase tracking-wider font-cinzel font-semibold text-[#D4AF37]/75">Invitation</th>
                  <th className="p-4 uppercase tracking-wider font-cinzel font-semibold text-[#D4AF37]/75">Guest / Family</th>
                  <th className="p-4 uppercase tracking-wider font-cinzel font-semibold text-[#D4AF37]/75 text-center">Category</th>
                  <th className="p-4 uppercase tracking-wider font-cinzel font-semibold text-[#D4AF37]/75 text-center">Type</th>
                  <th className="p-4 uppercase tracking-wider font-cinzel font-semibold text-[#D4AF37]/75 text-center">Status</th>
                  <th className="p-4 uppercase tracking-wider font-cinzel font-semibold text-[#D4AF37]/75 text-center">Delivery</th>
                  <th className="p-4 uppercase tracking-wider font-cinzel font-semibold text-[#D4AF37]/75 text-center">QR / Scans</th>
                  <th className="p-4 uppercase tracking-wider font-cinzel font-semibold text-[#D4AF37]/75 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {filteredInvitations.map((inv) => {
                  const isSelected = selectedIds.includes(inv.id);
                  return (
                    <tr 
                      key={inv.id} 
                      className={`hover:bg-[#141414]/50 transition-colors ${
                        isSelected ? 'bg-[#D4AF37]/5' : ''
                      }`}
                    >
                      {/* Checkbox column */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(inv.id)}
                          className="rounded border-[#D4AF37]/20 accent-[#D4AF37] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Inv ID */}
                      <td className="p-4 font-mono font-bold text-zinc-300">
                        {inv.id}
                      </td>

                      {/* Guest Name & Family */}
                      <td className="p-4">
                        <div className="font-semibold text-[#F5F5F5]">{inv.guestName}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Family: {inv.familyName}</div>
                      </td>

                      {/* Guest Category */}
                      <td className="p-4 text-center text-zinc-400 font-medium">
                        {inv.guestCategory}
                      </td>

                      {/* Invitation Type */}
                      <td className="p-4 text-center font-semibold text-xs tracking-wider uppercase text-zinc-300">
                        {inv.invitationType}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold border ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>

                      {/* Delivery Status */}
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-semibold border ${getDeliveryColor(inv.deliveryStatus)}`}>
                          {inv.deliveryStatus}
                        </span>
                      </td>

                      {/* QR / Scans */}
                      <td className="p-4 text-center font-mono">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400">
                          <QrCode size={12} className="text-[#D4AF37]" />
                          <span>{inv.qrCode.code}</span>
                          <span className="text-[9px] text-[#0F6D5B] bg-[#0F6D5B]/15 px-1.5 py-0.5 rounded font-bold">
                            {inv.qrCode.scanCount} Scans
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => setPreviewInvite(inv)}
                          title="Preview Invitation Layout"
                          className="p-2 bg-[#090909] text-zinc-400 hover:text-[#D4AF37] border border-[#D4AF37]/10 hover:border-[#D4AF37]/35 rounded-lg transition"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setHistoryInvite(inv)}
                          title="View Delivery History Logs"
                          className="p-2 bg-[#090909] text-zinc-400 hover:text-emerald-400 border border-[#D4AF37]/10 hover:border-emerald-500/30 rounded-lg transition"
                        >
                          <History size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove this invitation record: ${inv.id}?`)) {
                              deleteInvitation(inv.id, operatorName);
                            }
                          }}
                          title="Delete Invitation"
                          className="p-2 bg-[#090909] text-zinc-500 hover:text-rose-400 border border-transparent hover:border-rose-500/25 rounded-lg transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile View - Cards Layout */}
            <div className="md:hidden divide-y divide-[#D4AF37]/10 p-4 space-y-4">
              {filteredInvitations.map((inv) => (
                <div key={inv.id} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-zinc-300 font-bold">{inv.id}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-semibold border ${getDeliveryColor(inv.deliveryStatus)}`}>
                        {inv.deliveryStatus}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#F5F5F5]">{inv.guestName}</h4>
                    <p className="text-[10px] text-zinc-500">Family: {inv.familyName} | Category: {inv.guestCategory}</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <QrCode size={11} className="text-[#D4AF37]" />
                      <span>{inv.qrCode.code}</span>
                    </div>
                    <span className="text-[#0F6D5B] font-bold">{inv.qrCode.scanCount} Scans</span>
                  </div>

                  {/* Actions mobile */}
                  <div className="flex justify-end gap-2 pt-1.5">
                    <button
                      onClick={() => setPreviewInvite(inv)}
                      className="flex items-center gap-1 text-[10px] bg-[#090909] border border-[#D4AF37]/10 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-[#D4AF37] transition"
                    >
                      <Eye size={12} />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => setHistoryInvite(inv)}
                      className="flex items-center gap-1 text-[10px] bg-[#090909] border border-[#D4AF37]/10 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 transition"
                    >
                      <History size={12} />
                      <span>History</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove invitation record: ${inv.id}?`)) {
                          deleteInvitation(inv.id, operatorName);
                        }
                      }}
                      className="flex items-center gap-1 text-[10px] bg-rose-500/10 border border-rose-500/10 px-2.5 py-1.5 rounded-lg text-rose-400"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD MANUAL INVITATION DRAFT */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black" onClick={() => setShowAddModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-[#D4AF37]/20 shadow-[0_15px_40px_rgba(0,0,0,0.6)] z-10 text-[#F5F5F5]"
            >
              <div className="pb-3 border-b border-[#D4AF37]/10 mb-4">
                <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#D4AF37]">Create Single Invitation</h3>
              </div>
              
              <div className="space-y-4">
                {eligibleGuests.length === 0 ? (
                  <div className="text-center p-6 text-zinc-400 space-y-2">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                    <p className="text-xs">All existing guests already have invitations generated!</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold">Select Guest</label>
                      <select
                        value={newInviteGuestId}
                        onChange={(e) => setNewInviteGuestId(e.target.value)}
                        className="w-full bg-[#090909] border border-[#D4AF37]/15 text-[#F5F5F5] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#D4AF37]/45"
                      >
                        <option value="">-- Choose Guest --</option>
                        {eligibleGuests.map(g => (
                          <option key={g.id} value={g.id}>{g.name} ({g.familyName})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-zinc-500 font-semibold">Invitation Type</label>
                      <select
                        value={newInviteType}
                        onChange={(e) => setNewInviteType(e.target.value as InvitationType)}
                        className="w-full bg-[#090909] border border-[#D4AF37]/15 text-[#F5F5F5] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#D4AF37]/45"
                      >
                        <option value="digital">Digital</option>
                        <option value="printed">Printed</option>
                        <option value="vip">VIP</option>
                        <option value="family">Family</option>
                        <option value="friends">Friends</option>
                        <option value="bride_side">Bride Side</option>
                        <option value="groom_side">Groom Side</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-3">
                      <Button variant="secondary" className="flex-1 text-xs border-[#D4AF37]/15" onClick={() => setShowAddModal(false)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="flex-1 text-xs" 
                        disabled={!newInviteGuestId}
                        onClick={() => handleSingleGenerate(newInviteGuestId, newInviteType)}
                      >
                        Create Draft
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: INVITATION PREVIEW */}
      <AnimatePresence>
        {previewInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black" onClick={() => setPreviewInvite(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl h-[85vh] glass-panel p-5 rounded-3xl border border-[#D4AF37]/20 shadow-2xl z-10 flex flex-col justify-between bg-[#090909]"
            >
              <div className="flex items-center justify-between border-b border-[#D4AF37]/10 pb-3 mb-3">
                <div>
                  <h3 className="font-cinzel text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
                    Preview: {previewInvite.guestName}'s Invitation
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                    Invitation URL: batpaiyancatponnu.online/#/invitation?id={previewInvite.guestId}
                  </span>
                </div>
                <button
                  onClick={() => setPreviewInvite(null)}
                  className="text-zinc-500 hover:text-white font-semibold text-xs transition"
                >
                  Close
                </button>
              </div>

              {/* iframe Container */}
              <div className="flex-1 w-full bg-[#090909] rounded-2xl overflow-hidden border border-[#D4AF37]/5 relative">
                <iframe
                  src={`/invitation/index.html?guestId=${previewInvite.guestId}`}
                  title="Cinematic Wedding Invitation Live View"
                  className="w-full h-full border-none outline-none scale-[0.98] transition-transform origin-top"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                />
              </div>

              {/* Detail footer options */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-3 border-t border-[#D4AF37]/10">
                {/* QR Code trigger */}
                <div className="flex items-center gap-3">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`https://batpaiyancatponnu.online/#/invitation?id=${previewInvite.guestId}`)}`}
                    alt="QR invitation code"
                    className="w-12 h-12 bg-white p-1 rounded-lg border border-[#D4AF37]/20"
                  />
                  <div className="text-[10px] font-mono text-zinc-400">
                    <span className="block font-bold uppercase text-[#D4AF37]">{previewInvite.qrCode.code}</span>
                    <button
                      onClick={() => {
                        recordQrScan(previewInvite.id, operatorName);
                        toast.success('Simulated QR Code scanning! Added +1 scan logs.');
                      }}
                      className="mt-1 text-emerald-400 hover:underline flex items-center gap-1 font-sans font-semibold"
                    >
                      <QrCode size={10} />
                      <span>Simulate QR Scan</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Dear ${previewInvite.guestName}, we are delighted to invite you to our wedding. Please click the link to view your invitation: https://batpaiyancatponnu.online/#/invitation?id=${previewInvite.guestId}`)}`}
                    target="_blank" 
                    rel="noreferrer"
                    onClick={() => {
                      bulkUpdateDelivery([previewInvite.id], 'whatsapp', operatorName);
                    }}
                    className="flex items-center gap-1.5 bg-[#0F6D5B]/10 hover:bg-[#0F6D5B]/20 border border-[#0F6D5B]/25 text-[#148C75] px-3.5 py-2.5 rounded-xl transition text-xs font-semibold"
                  >
                    <ExternalLink size={12} />
                    <span>WhatsApp Invitation Link</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: INVITATION HISTORICAL LOGS */}
      <AnimatePresence>
        {historyInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black" onClick={() => setHistoryInvite(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg glass-panel p-6 rounded-3xl border border-[#D4AF37]/20 shadow-2xl z-10 bg-[#141414] text-[#F5F5F5]"
            >
              <div className="pb-3 border-b border-[#D4AF37]/10 mb-4 flex items-center justify-between">
                <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Delivery Log: {historyInvite.id}
                </h3>
                <button
                  onClick={() => setHistoryInvite(null)}
                  className="text-zinc-500 hover:text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {historyInvite.history && historyInvite.history.length > 0 ? (
                  <div className="relative pl-6 border-l border-[#D4AF37]/15 space-y-4">
                    {historyInvite.history.map((h, index) => (
                      <div key={index} className="relative">
                        {/* Dot indicator */}
                        <span className="absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full bg-[#090909] border border-[#D4AF37] flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                        </span>
                        
                        <div className="space-y-1">
                          <h4 className="text-xs font-semibold text-zinc-300">{h.event}</h4>
                          <span className="text-[9px] text-zinc-500 font-mono block">
                            {new Date(h.timestamp).toLocaleString()} {h.operator ? `by ${h.operator}` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 text-zinc-500 text-xs">
                    No history log entries recorded for this invitation.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default InvitationDashboard;
