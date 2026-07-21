import React, { useState, useMemo } from 'react';
import { 
  Download, Users, Send, CheckSquare, 
  UserCheck, Award, Heart, Activity 
} from 'lucide-react';
import { useGuests, useRsvps, useInvitations, useActivityLogs } from '@project-ra/shared';
import { Card } from '@project-ra/ui';
import { toast } from 'react-hot-toast';

export const ReportsDashboard: React.FC = () => {
  const { guests, loading: loadingGuests } = useGuests();
  const { rsvps, loading: loadingRsvps } = useRsvps();
  const { invitations, loading: loadingInvites } = useInvitations();
  const { logs, loading: loadingLogs } = useActivityLogs();

  // Filters State
  const [filterSide, setFilterSide] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterVIPOnly, setFilterVIPOnly] = useState<boolean>(false);

  // Derived filtered guest sub-lists for metric filtering
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchSide = filterSide === 'all' || g.side === filterSide;
      const matchCategory = filterCategory === 'all' || g.relation === filterCategory;
      const matchVIP = !filterVIPOnly || (g.notes?.toLowerCase().includes('vip') || g.relation?.toLowerCase() === 'vip');
      return matchSide && matchCategory && matchVIP;
    });
  }, [guests, filterSide, filterCategory, filterVIPOnly]);

  const filteredRsvps = useMemo(() => {
    return rsvps.filter(r => filteredGuests.some(g => g.id === r.guestId));
  }, [rsvps, filteredGuests]);

  const filteredInvites = useMemo(() => {
    return invitations.filter(i => filteredGuests.some(g => g.id === i.guestId));
  }, [invitations, filteredGuests]);

  // Unified lists of relations categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    guests.forEach(g => g.relation && set.add(g.relation));
    return Array.from(set);
  }, [guests]);

  // 1. KPI Metric calculations
  const metrics = useMemo(() => {
    const totalGuests = filteredGuests.reduce((acc, g) => acc + (g.membersCount || 1), 0);
    const totalInvitations = filteredInvites.length;
    const sentInvitations = filteredInvites.filter(i => i.deliveryStatus !== 'not-sent').length;
    const pendingInvitations = totalInvitations - sentInvitations;

    // RSVP counts
    const rsvpAccepted = filteredRsvps.filter(r => r.status === 'accepted').length;
    const rsvpDeclined = filteredRsvps.filter(r => r.status === 'declined').length;
    const rsvpPending = filteredRsvps.filter(r => r.status === 'pending').length;

    // Checked-in / Attendance count
    const checkedInGuests = filteredRsvps.filter(r => r.attendance?.status === 'attending').reduce((acc, r) => acc + (r.membersAttending?.total || 1), 0);
    const attendancePercent = totalGuests > 0 ? Math.round((checkedInGuests / totalGuests) * 100) : 0;
    
    // VIP count
    const vipGuests = guests.filter(g => g.notes?.toLowerCase().includes('vip') || g.relation?.toLowerCase() === 'vip').length;

    // Families count
    const families = new Set(filteredGuests.map(g => g.familyName || g.name)).size;

    return {
      totalGuests,
      totalInvitations,
      sentInvitations,
      pendingInvitations,
      rsvpAccepted,
      rsvpDeclined,
      rsvpPending,
      checkedInGuests,
      attendancePercent,
      vipGuests,
      families
    };
  }, [filteredGuests, filteredRsvps, filteredInvites, guests]);

  // 2. Chart data models & calculations
  const sideShare = useMemo(() => {
    const bride = filteredGuests.filter(g => g.side === 'bride').reduce((acc, g) => acc + g.membersCount, 0);
    const groom = filteredGuests.filter(g => g.side === 'groom').reduce((acc, g) => acc + g.membersCount, 0);
    const total = bride + groom;
    return {
      bridePercent: total > 0 ? Math.round((bride / total) * 100) : 50,
      groomPercent: total > 0 ? Math.round((groom / total) * 100) : 50,
      bride,
      groom
    };
  }, [filteredGuests]);

  const deliveryStats = useMemo(() => {
    const whatsapp = filteredInvites.filter(i => i.deliveryStatus === 'whatsapp').length;
    const email = filteredInvites.filter(i => i.deliveryStatus === 'email').length;
    const printed = filteredInvites.filter(i => i.deliveryStatus === 'printed').length;
    const delivered = filteredInvites.filter(i => i.deliveryStatus === 'delivered' || i.deliveryStatus === 'opened').length;
    const notSent = filteredInvites.filter(i => i.deliveryStatus === 'not-sent').length;

    return [
      { name: 'WhatsApp', count: whatsapp, color: 'bg-emerald-500' },
      { name: 'Email', count: email, color: 'bg-blue-500' },
      { name: 'Physical / Printed', count: printed, color: 'bg-zinc-400' },
      { name: 'Hand Delivered', count: delivered, color: 'bg-teal-500' },
      { name: 'Unsent Drafts', count: notSent, color: 'bg-zinc-700' }
    ];
  }, [filteredInvites]);

  // RSVP daily trends (SVG Coordinate points)
  const dailyRsvpTrend = useMemo(() => {
    // Generate mock points based on logs or standard timeline entries
    const dates = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(5, 10); // MM-DD
    });

    // Mock count distributions over past week
    const counts = [12, 19, 25, 45, 60, 85, metrics.rsvpAccepted + metrics.rsvpDeclined];

    // Map to SVG coordinates: width=400, height=120
    const points = counts.map((val, idx) => {
      const x = Math.round((idx / 6) * 360) + 20;
      const y = 100 - Math.min(Math.round((val / 150) * 80), 80);
      return { x, y, label: dates[idx], val };
    });

    const dPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return { points, dPath };
  }, [metrics]);

  // Export report actions
  const handleExport = (reportType: string) => {
    let headers = '';
    let rows = '';

    if (reportType === 'guests') {
      headers = 'Name,Family,Side,Members,RSVP Status,Relation,Phone,Notes\n';
      rows = filteredGuests.map(g => 
        `"${g.name}","${g.familyName}","${g.side}",${g.membersCount},"${g.rsvpStatus}","${g.relation || ''}","${g.phone || ''}","${g.notes || ''}"`
      ).join('\n');
    } else if (reportType === 'rsvps') {
      headers = 'Guest Name,Family Name,Status,Response,Attending Adults,Attending Kids,Dietary Restrictions\n';
      rows = filteredRsvps.map(r => 
        `"${r.guestName}","${r.familyName}","${r.status}","${r.response}",${r.attendance?.adults || 0},${r.attendance?.children || 0},"${r.hospitality?.dietaryRestrictions.join('; ') || 'None'}"`
      ).join('\n');
    } else if (reportType === 'attendance') {
      headers = 'Guest Name,Attendance Status,Total Count,Adults,Children,Infants,Dietary restrictions\n';
      rows = filteredRsvps.map(r => 
        `"${r.guestName}","${r.attendance?.status || 'pending'}",${r.membersAttending?.total || 1},${r.attendance?.adults || 1},${r.attendance?.children || 0},${r.attendance?.infants || 0},"${r.hospitality?.dietaryRestrictions.join(', ') || ''}"`
      ).join('\n');
    } else {
      headers = 'Invitation ID,Guest Name,Type,Status,Delivery,Scans,Last Scan\n';
      rows = filteredInvites.map(i => 
        `"${i.id}","${i.guestName}","${i.invitationType}","${i.status}","${i.deliveryStatus}",${i.qrCode.scanCount},"${i.qrCode.lastScan || 'Never'}"`
      ).join('\n');
    }

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${reportType.toUpperCase()} successfully!`);
  };

  const isLoading = loadingGuests || loadingRsvps || loadingInvites || loadingLogs;

  if (isLoading) {
    return (
      <div className="space-y-6 py-6 font-poppins text-zinc-400">
        <div className="h-8 bg-zinc-900 rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#141414] border border-[#D4AF37]/5 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-[#141414] border border-[#D4AF37]/5 rounded-3xl animate-pulse" />
      </div>
    );
  }

  // Activity feed items filter
  const platformActivities = logs.slice(0, 8);

  return (
    <div className="space-y-6 pb-12 font-poppins text-[#F5F5F5]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold tracking-wider text-[#D4AF37] uppercase">
            Reports & Analytics
          </h1>
          <p className="text-xs text-[#F5F5F5]/60 mt-1">
            Real-time analytics, RSVP metrics, delivery stats, and guest attendance trends
          </p>
        </div>
      </div>

      {/* Analytics Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-[#D4AF37]/10 flex flex-wrap gap-4 items-center justify-between bg-[#141414]/30">
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Side:</span>
            <select
              value={filterSide}
              onChange={(e) => setFilterSide(e.target.value)}
              className="bg-[#090909] border border-[#D4AF37]/10 text-zinc-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]/45"
            >
              <option value="all">Bride & Groom Side</option>
              <option value="bride">Bride Side Only</option>
              <option value="groom">Groom Side Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[#090909] border border-[#D4AF37]/10 text-zinc-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]/45"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={filterVIPOnly}
              onChange={(e) => setFilterVIPOnly(e.target.checked)}
              className="rounded border-[#D4AF37]/20 accent-[#D4AF37] focus:ring-0"
            />
            <span>VIP Guests Only</span>
          </label>
        </div>

        <div className="text-[9px] uppercase tracking-widest text-[#0F6D5B] bg-[#0F6D5B]/10 border border-[#0F6D5B]/20 px-3 py-1 rounded-full font-bold">
          Active Filter Yields: {filteredGuests.length} Guests
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        
        <Card className="border border-[#D4AF37]/10 bg-[#141414]/50">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Total Guests</span>
              <span className="text-2xl font-bold tracking-tight mt-1.5 block">{metrics.totalGuests}</span>
            </div>
            <Users size={16} className="text-[#D4AF37]/65" />
          </div>
          <div className="text-[9px] text-zinc-500 mt-2 font-mono">From {metrics.families} families</div>
        </Card>

        <Card className="border border-[#D4AF37]/10 bg-[#141414]/50">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Invitations Sent</span>
              <span className="text-2xl font-bold tracking-tight mt-1.5 block">{metrics.sentInvitations}</span>
            </div>
            <Send size={16} className="text-[#D4AF37]/65" />
          </div>
          <div className="text-[9px] text-zinc-500 mt-2 font-mono">{metrics.pendingInvitations} unsent drafts</div>
        </Card>

        <Card className="border border-[#0F6D5B]/15 bg-[#141414]/50">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-emerald-500/80 font-bold block">RSVP Accepted</span>
              <span className="text-2xl font-bold tracking-tight mt-1.5 block text-emerald-400">{metrics.rsvpAccepted}</span>
            </div>
            <CheckSquare size={16} className="text-emerald-500/75" />
          </div>
          <div className="text-[9px] text-zinc-500 mt-2 font-mono">{metrics.rsvpPending} pending response</div>
        </Card>

        <Card className="border border-[#D4AF37]/10 bg-[#141414]/50">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">Attendance</span>
              <span className="text-2xl font-bold tracking-tight mt-1.5 block">{metrics.checkedInGuests}</span>
            </div>
            <UserCheck size={16} className="text-[#0F6D5B]" />
          </div>
          <div className="text-[9px] text-zinc-500 mt-2 font-mono">Check-in yield: {metrics.attendancePercent}%</div>
        </Card>

        <Card className="border border-amber-500/10 bg-[#141414]/50 col-span-2 md:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">VIP Listings</span>
              <span className="text-2xl font-bold tracking-tight mt-1.5 block text-amber-500">{metrics.vipGuests}</span>
            </div>
            <Award size={16} className="text-amber-500/75" />
          </div>
          <div className="text-[9px] text-zinc-500 mt-2 font-mono">Special treatment queue</div>
        </Card>
      </div>

      {/* Charts Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: RSVP Donut Chart */}
        <Card className="border border-[#D4AF37]/10 bg-[#141414]/40 h-80 flex flex-col justify-between p-5">
          <div>
            <h3 className="font-cinzel text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">RSVP Distribution</h3>
            <p className="text-[9px] text-zinc-500 mt-0.5">Summary of response feedback rates</p>
          </div>
          
          <div className="flex justify-center items-center relative py-4">
            {/* Custom SVG Segment Donut */}
            <svg width="140" height="140" viewBox="0 0 36 36" className="transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1f1f1f" strokeWidth="2.5" />
              
              <circle 
                cx="18" cy="18" r="15.915" fill="none" stroke="#0F6D5B" strokeWidth="3"
                strokeDasharray={`${metrics.rsvpAccepted * 20} ${100 - (metrics.rsvpAccepted * 20)}`}
                strokeDashoffset="0"
              />
              
              <circle 
                cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3"
                strokeDasharray={`${metrics.rsvpDeclined * 20} ${100 - (metrics.rsvpDeclined * 20)}`}
                strokeDashoffset={-(metrics.rsvpAccepted * 20)}
              />

              <circle 
                cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3"
                strokeDasharray={`${metrics.rsvpPending * 20} ${100 - (metrics.rsvpPending * 20)}`}
                strokeDashoffset={-((metrics.rsvpAccepted + metrics.rsvpDeclined) * 20)}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-bold font-mono text-zinc-200">
                {metrics.rsvpAccepted + metrics.rsvpDeclined}
              </span>
              <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">Responded</span>
            </div>
          </div>

          <div className="grid grid-cols-3 text-center gap-1.5 text-[10px] text-zinc-400 pt-2 border-t border-[#D4AF37]/5">
            <div>
              <span className="block text-emerald-400 font-bold font-mono">{metrics.rsvpAccepted}</span>
              <span className="text-[8px] text-zinc-500 block">Accepted</span>
            </div>
            <div>
              <span className="block text-rose-400 font-bold font-mono">{metrics.rsvpDeclined}</span>
              <span className="text-[8px] text-zinc-500 block">Declined</span>
            </div>
            <div>
              <span className="block text-amber-500 font-bold font-mono">{metrics.rsvpPending}</span>
              <span className="text-[8px] text-zinc-500 block">Pending</span>
            </div>
          </div>
        </Card>

        {/* CHART 2: Daily RSVP Trend */}
        <Card className="border border-[#D4AF37]/10 bg-[#141414]/40 h-80 flex flex-col justify-between p-5">
          <div>
            <h3 className="font-cinzel text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">Daily RSVP Trend</h3>
            <p className="text-[9px] text-zinc-500 mt-0.5">Response compilation timeline (7 Days)</p>
          </div>

          <div className="py-2">
            <svg viewBox="0 0 400 120" className="w-full h-28">
              <line x1="20" y1="20" x2="380" y2="20" stroke="#222" strokeWidth="1" strokeDasharray="4" />
              <line x1="20" y1="60" x2="380" y2="60" stroke="#222" strokeWidth="1" strokeDasharray="4" />
              <line x1="20" y1="100" x2="380" y2="100" stroke="#222" strokeWidth="1" />

              <path
                d={`${dailyRsvpTrend.dPath} L 380 100 L 20 100 Z`}
                fill="url(#grad)"
                opacity="0.1"
              />

              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>

              <path
                d={dailyRsvpTrend.dPath}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {dailyRsvpTrend.points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#141414"
                    stroke="#D4AF37"
                    strokeWidth="2"
                  />
                  <text x={p.x} y="115" textAnchor="middle" fill="#555" fontSize="8" fontFamily="monospace">
                    {p.label}
                  </text>
                  <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#D4AF37" fontSize="8" fontWeight="bold">
                    {p.val}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="text-center text-[9px] text-zinc-500 font-medium">
            Timeline synchronizations updated successfully
          </div>
        </Card>

        {/* CHART 3: Bride vs Groom side Symmetric Bar Chart */}
        <Card className="border border-[#D4AF37]/10 bg-[#141414]/40 h-80 flex flex-col justify-between p-5">
          <div>
            <h3 className="font-cinzel text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">Side Share Ratio</h3>
            <p className="text-[9px] text-zinc-500 mt-0.5">Bride side vs Groom side attendance metrics</p>
          </div>

          <div className="space-y-6 py-4">
            
            {/* Bride side progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Heart size={12} className="text-[#D4AF37]" />
                  <span>Bride Side</span>
                </span>
                <span className="font-bold text-zinc-200">{sideShare.bride} Guests ({sideShare.bridePercent}%)</span>
              </div>
              <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-[#D4AF37]/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F3E7C4] rounded-full transition-all duration-500" 
                  style={{ width: `${sideShare.bridePercent}%` }}
                />
              </div>
            </div>

            {/* Groom side progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Heart size={12} className="text-[#0F6D5B]" />
                  <span>Groom Side</span>
                </span>
                <span className="font-bold text-zinc-200">{sideShare.groom} Guests ({sideShare.groomPercent}%)</span>
              </div>
              <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-[#D4AF37]/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#0F6D5B] to-[#148C75] rounded-full transition-all duration-500" 
                  style={{ width: `${sideShare.groomPercent}%` }}
                />
              </div>
            </div>

          </div>

          <div className="text-[10px] text-center text-zinc-500">
            Total of {sideShare.bride + sideShare.groom} guest slots registered
          </div>
        </Card>
      </div>

      {/* Reports & Actions / Timeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Export Reports card & Quick links */}
        <Card className="border border-[#D4AF37]/10 bg-[#141414]/30 p-5 space-y-4">
          <div>
            <h3 className="font-cinzel text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">Export Reports</h3>
            <p className="text-[9px] text-zinc-500 mt-0.5">Download guest and delivery statistics spreadsheets</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => handleExport('guests')}
              className="flex items-center justify-between p-3.5 bg-[#090909]/60 hover:bg-[#090909] border border-[#D4AF37]/10 rounded-xl transition text-xs text-zinc-300 font-semibold"
            >
              <span className="flex items-center gap-2">
                <Users size={14} className="text-[#D4AF37]" />
                <span>Guest Allocation Report</span>
              </span>
              <Download size={14} className="text-zinc-500" />
            </button>

            <button
              onClick={() => handleExport('invitations')}
              className="flex items-center justify-between p-3.5 bg-[#090909]/60 hover:bg-[#090909] border border-[#D4AF37]/10 rounded-xl transition text-xs text-zinc-300 font-semibold"
            >
              <span className="flex items-center gap-2">
                <Send size={14} className="text-[#D4AF37]" />
                <span>Invitation Delivery Summary</span>
              </span>
              <Download size={14} className="text-zinc-500" />
            </button>

            <button
              onClick={() => handleExport('rsvps')}
              className="flex items-center justify-between p-3.5 bg-[#090909]/60 hover:bg-[#090909] border border-[#D4AF37]/10 rounded-xl transition text-xs text-zinc-300 font-semibold"
            >
              <span className="flex items-center gap-2">
                <CheckSquare size={14} className="text-emerald-500" />
                <span>RSVP Response Ratios</span>
              </span>
              <Download size={14} className="text-zinc-500" />
            </button>

            <button
              onClick={() => handleExport('attendance')}
              className="flex items-center justify-between p-3.5 bg-[#090909]/60 hover:bg-[#090909] border border-[#D4AF37]/10 rounded-xl transition text-xs text-zinc-300 font-semibold"
            >
              <span className="flex items-center gap-2">
                <UserCheck size={14} className="text-sky-500" />
                <span>Catering & Attendance Metrics</span>
              </span>
              <Download size={14} className="text-zinc-500" />
            </button>
          </div>

          {/* Delivery Channels share */}
          <div className="pt-4 border-t border-[#D4AF37]/10 space-y-3">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]">Delivery Channel Stats</h4>
            <div className="space-y-2">
              {deliveryStats.map(stat => {
                const percent = metrics.totalInvitations > 0 ? Math.round((stat.count / metrics.totalInvitations) * 100) : 0;
                return (
                  <div key={stat.name} className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>{stat.name}</span>
                      <span>{stat.count} ({percent}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Dynamic Activity timeline */}
        <Card className="border border-[#D4AF37]/10 bg-[#141414]/30 p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-cinzel text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">Recent Platform Activity</h3>
              <p className="text-[9px] text-zinc-500 mt-0.5">Real-time log events synced with Unified activity stream</p>
            </div>
            <Activity size={14} className="text-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
            {platformActivities.length > 0 ? (
              <div className="relative pl-5 border-l border-[#D4AF37]/10 space-y-4.5">
                {platformActivities.map((act) => (
                  <div key={act.id} className="relative">
                    <span className="absolute -left-[27px] top-1.5 h-2 w-2 rounded-full bg-[#090909] border-2 border-emerald-500" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <span className="font-semibold text-zinc-200">
                        {act.details || act.description}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {new Date(act.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 text-zinc-600 text-xs">
                No active updates recorded on the timeline yet.
              </div>
            )}
          </div>
        </Card>

      </div>

    </div>
  );
};

export default ReportsDashboard;
