import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Users, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Download, 
  Send, 
  Eye, 
  Activity, 
  AlertCircle,
  TrendingUp,
  PieChart,
  UserCheck,
  UserX
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import StatCard from '../../components/dashboard/StatCard';
import { toast } from 'react-hot-toast';
import { useGuests } from '../../hooks/useGuests';
import { Guest } from '../../types/guest';

export const RsvpDashboard: React.FC = () => {
  const { guests, loading } = useGuests();
  const navigate = useNavigate();

  // Modal filters states
  const [activeModal, setActiveModal] = useState<'pending' | 'accepted' | null>(null);

  // Compute stats on live guests collection
  const totalInvitations = guests.length;
  
  // RSVP Status counts (Invitations / Guest documents count)
  const acceptedInvites = guests.filter(g => g.rsvpStatus === 'attending').length;
  const declinedInvites = guests.filter(g => g.rsvpStatus === 'declined').length;
  const pendingInvites = guests.filter(g => g.rsvpStatus === 'pending').length;
  const maybeInvites = guests.filter(g => g.rsvpStatus === 'maybe').length;

  const totalResponded = acceptedInvites + declinedInvites + maybeInvites;
  const responseRate = totalInvitations > 0 
    ? ((totalResponded / totalInvitations) * 100).toFixed(1) 
    : '0.0';

  // Headcount counts (sum of membersCount)
  const totalHeadcount = guests.reduce((sum, g) => sum + (g.membersCount || 1), 0);
  const acceptedHeadcount = guests
    .filter(g => g.rsvpStatus === 'attending')
    .reduce((sum, g) => sum + (g.membersCount || 1), 0);
  const pendingHeadcount = guests
    .filter(g => g.rsvpStatus === 'pending')
    .reduce((sum, g) => sum + (g.membersCount || 1), 0);
  const declinedHeadcount = guests
    .filter(g => g.rsvpStatus === 'declined')
    .reduce((sum, g) => sum + (g.membersCount || 1), 0);
  const maybeHeadcount = guests
    .filter(g => g.rsvpStatus === 'maybe')
    .reduce((sum, g) => sum + (g.membersCount || 1), 0);

  // Bride vs Groom breakdowns
  const brideAccepted = guests.filter(g => g.side === 'bride' && g.rsvpStatus === 'attending').length;
  const bridePending = guests.filter(g => g.side === 'bride' && g.rsvpStatus === 'pending').length;
  const brideDeclined = guests.filter(g => g.side === 'bride' && g.rsvpStatus === 'declined').length;
  const brideMaybe = guests.filter(g => g.side === 'bride' && g.rsvpStatus === 'maybe').length;

  const groomAccepted = guests.filter(g => g.side === 'groom' && g.rsvpStatus === 'attending').length;
  const groomPending = guests.filter(g => g.side === 'groom' && g.rsvpStatus === 'pending').length;
  const groomDeclined = guests.filter(g => g.side === 'groom' && g.rsvpStatus === 'declined').length;
  const groomMaybe = guests.filter(g => g.side === 'groom' && g.rsvpStatus === 'maybe').length;

  // Invitation Types breakdowns
  const getInviteBreakdown = (type: 'digital' | 'printed' | 'both') => {
    const list = guests.filter(g => g.invitationType === type);
    return {
      accepted: list.filter(g => g.rsvpStatus === 'attending').length,
      pending: list.filter(g => g.rsvpStatus === 'pending').length,
      declined: list.filter(g => g.rsvpStatus === 'declined').length,
      maybe: list.filter(g => g.rsvpStatus === 'maybe').length,
      total: list.length
    };
  };

  const digitalBreakdown = getInviteBreakdown('digital');
  const printedBreakdown = getInviteBreakdown('printed');
  const bothBreakdown = getInviteBreakdown('both');

  // Filter recent responses (excluding pending, sorted by updatedAt or createdAt)
  const recentResponses = [...guests]
    .filter(g => g.rsvpStatus !== 'pending')
    .sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      return timeB - timeA;
    })
    .slice(0, 10);

  // Table status styling
  const getStatusBadge = (status: 'attending' | 'declined' | 'pending' | 'maybe') => {
    switch (status) {
      case 'attending':
        return 'bg-[#0F6D5B]/15 text-[#148C75] border-[#0F6D5B]/30';
      case 'declined':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'maybe':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'pending':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700/50';
    }
  };

  // CSV Exporter for RSVPs
  const handleExportRsvps = () => {
    toast.success('Compiling RSVP manifest...', { id: 'export-toast' });
    const headers = ['Guest Name', 'Family Group', 'Side', 'Invitation Type', 'RSVP Status', 'Headcount', 'Phone', 'Notes', 'Response Date'];
    
    const rows = guests
      .filter(g => !g.isDeleted)
      .map(g => [
        g.name,
        g.familyName || 'General',
        g.side.toUpperCase(),
        g.invitationType || 'Digital',
        g.rsvpStatus.toUpperCase(),
        g.membersCount || 1,
        g.phone || '—',
        g.notes || '',
        g.updatedAt ? new Date(g.updatedAt).toLocaleDateString() : new Date(g.createdAt).toLocaleDateString()
      ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `project_ra_rsvp_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Relative Time Formatter
  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDays = Math.floor(diffHr / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Unknown';
    }
  };

  // Donut chart calculations
  const radius = 35;
  const circumference = 2 * Math.PI * radius; // 219.91
  
  const chartSlices = [
    { value: acceptedInvites, color: '#D4AF37', label: 'Accepted' }, // Gold
    { value: declinedInvites, color: '#F43F5E', label: 'Declined' }, // Rose/Red
    { value: maybeInvites, color: '#F59E0B', label: 'Maybe' },    // Amber
    { value: pendingInvites, color: '#3F3F46', label: 'Pending' }   // Zinc/Gray
  ];

  const totalChartVal = chartSlices.reduce((sum, slice) => sum + slice.value, 0);

  // Line Chart Trend calculations (Last 7 days RSVP submissions)
  const getTrendData = () => {
    const trendMap: Record<string, number> = {};
    const datesList: string[] = [];
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      trendMap[dateStr] = 0;
      datesList.push(dateStr);
    }

    // Populate counts
    guests.forEach(g => {
      if (g.rsvpStatus !== 'pending') {
        const dateStr = new Date(g.updatedAt || g.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (trendMap[dateStr] !== undefined) {
          trendMap[dateStr] += 1;
        }
      }
    });

    return datesList.map(date => ({ date, count: trendMap[date] }));
  };

  const trendData = getTrendData();
  const maxTrendVal = Math.max(...trendData.map(d => d.count), 4); // Min ceiling of 4 for chart scaling

  // Build SVG path coordinate points
  const points = trendData.map((d, index) => {
    const x = 10 + index * 13.3; // x-axis step (10 to 90)
    const y = 80 - (d.count / maxTrendVal) * 60; // y-axis step (80 to 20)
    return { x, y, ...d };
  });

  const linePathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaPathD = points.length > 0
    ? `${linePathD} L ${points[points.length - 1].x} 80 L ${points[0].x} 80 Z`
    : '';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-400 space-y-3 font-poppins">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Loading RSVP Analytics Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-poppins relative">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D4AF37]/10 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-cinzel text-[#F5F5F5] font-bold tracking-wide">
            RSVP Dashboard
          </h1>
          <p className="text-xs text-[#F5F5F5]/50">
            Real-time analytics and management for guest responses.
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/rsvp/details')}
          variant="primary"
          className="sm:self-end flex items-center gap-1.5 py-2.5 px-4 text-xs font-bold uppercase tracking-wider shadow-lg"
        >
          <CheckSquare size={13} />
          <span>RSVP Details Roster</span>
        </Button>
      </div>

      {/* Section 1: Overview KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 animate-fade">
        <StatCard title="Total Invitations" value={totalInvitations} description={`Headcount: ${totalHeadcount}`} icon={Users} />
        <StatCard title="Accepted" value={acceptedInvites} description={`Headcount: ${acceptedHeadcount}`} icon={CheckCircle2} iconColorClass="text-[#D4AF37]" />
        <StatCard title="Declined" value={declinedInvites} description={`Headcount: ${declinedHeadcount}`} icon={XCircle} iconColorClass="text-rose-400" />
        <StatCard title="Maybe" value={maybeInvites} description={`Headcount: ${maybeHeadcount}`} icon={HelpCircle} iconColorClass="text-amber-500" />
        <StatCard title="Pending" value={pendingInvites} description={`Headcount: ${pendingHeadcount}`} icon={Clock} iconColorClass="text-zinc-500" />
        
        {/* Response Rate Gauge */}
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[140px] font-poppins">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#0F6D5B]/5 rounded-full filter blur-[20px] pointer-events-none" />
          <div className="flex items-start justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F5F5F5]/50">Response Rate</span>
            <div className="p-2 rounded-lg bg-[#141414] border border-[#D4AF37]/10 flex items-center justify-center text-emerald-400 shadow-md">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="my-3 flex items-baseline">
            <span className="text-3xl font-semibold tracking-tight text-[#F5F5F5] font-cinzel">{responseRate}</span>
            <span className="text-base text-[#F5F5F5]/60 font-poppins ml-1">%</span>
          </div>
          <div className="text-[11px] text-[#F5F5F5]/45 leading-normal">
            {totalResponded} / {totalInvitations} Responded
          </div>
        </div>
      </div>

      {/* Section 2 & 5: RSVP breakdown cards & Custom SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart: Response Distribution (Donut Chart) */}
        <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3">
            <PieChart size={16} className="text-[#D4AF37]" />
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Response Distribution
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background tracks */}
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                
                {/* Slices rendering */}
                {totalChartVal > 0 && (() => {
                  let accumulatedPercent = 0;
                  return chartSlices.map((slice, idx) => {
                    const percent = slice.value / totalChartVal;
                    const strokeDash = circumference * percent;
                    const strokeOffset = circumference * (1 - percent) - (circumference * accumulatedPercent);
                    accumulatedPercent += percent;
                    
                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="8"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeDashoffset={-strokeOffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 hover:stroke-[9.5px] cursor-pointer"
                        title={`${slice.label}: ${slice.value}`}
                      />
                    );
                  });
                })()}
              </svg>
              
              {/* Central text overlay */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-bold text-zinc-100 font-cinzel">{totalResponded}</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500">Replies</span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="grid grid-cols-2 gap-2.5 w-full text-[10px]">
              {chartSlices.map((slice, idx) => {
                const percent = totalChartVal > 0 ? ((slice.value / totalChartVal) * 100).toFixed(0) : '0';
                return (
                  <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded bg-[#090909]/40 border border-zinc-900/60">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                    <span className="text-zinc-400 capitalize">{slice.label}</span>
                    <span className="ml-auto font-bold text-zinc-200">{slice.value} ({percent}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Chart: Response Trend (Line Chart) */}
        <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3">
            <TrendingUp size={16} className="text-[#D4AF37]" />
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Response Trend (Last 7 Days)
            </h3>
          </div>

          <div className="py-4">
            <svg viewBox="0 0 100 90" className="w-full h-40">
              {/* Y-Axis lines */}
              <line x1="10" y1="20" x2="90" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="10" y1="80" x2="90" y2="80" stroke="rgba(212,175,55,0.12)" strokeWidth="1" />
              
              {/* Trend Gradient Area */}
              {areaPathD && (
                <path
                  d={areaPathD}
                  fill="url(#trend-gradient)"
                  opacity="0.15"
                />
              )}

              {/* Trend Line */}
              {linePathD && (
                <path
                  d={linePathD}
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points nodes */}
              {points.map((p, idx) => (
                <g key={idx} className="cursor-pointer group">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="2"
                    fill="#0F6D5B"
                    stroke="#D4AF37"
                    strokeWidth="1"
                  />
                  {/* Tooltip text on click/hover simulated */}
                  <text
                    x={p.x}
                    y={p.y - 5}
                    textAnchor="middle"
                    fill="#D4AF37"
                    fontSize="6"
                    fontWeight="bold"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {p.count}
                  </text>
                  {/* X-Axis labels */}
                  <text
                    x={p.x}
                    y="88"
                    textAnchor="middle"
                    fill="rgba(245,245,245,0.3)"
                    fontSize="5.5"
                    className="font-mono"
                  >
                    {p.date}
                  </text>
                </g>
              ))}

              <defs>
                <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </Card>

        {/* RSVP Status Cards (Bride / Groom Splits & Invites Splits) */}
        <div className="space-y-4">
          {/* Side breakdowns */}
          <Card className="p-4 border border-[#D4AF37]/10 space-y-3.5">
            <h4 className="font-cinzel text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-900 pb-2">
              Side Breakdown
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 border-r border-zinc-900/60 pr-2">
                <span className="text-[10px] font-semibold text-emerald-400 block uppercase tracking-wider">Bride Side</span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-zinc-400">
                  <div className="flex justify-between"><span>Yes:</span> <strong className="text-zinc-200">{brideAccepted}</strong></div>
                  <div className="flex justify-between"><span>No:</span> <strong className="text-zinc-200">{brideDeclined}</strong></div>
                  <div className="flex justify-between"><span>Maybe:</span> <strong className="text-zinc-200">{brideMaybe}</strong></div>
                  <div className="flex justify-between"><span>Wait:</span> <strong className="text-zinc-200">{bridePending}</strong></div>
                </div>
              </div>

              <div className="space-y-2 pl-1">
                <span className="text-[10px] font-semibold text-[#D4AF37] block uppercase tracking-wider">Groom Side</span>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-zinc-400">
                  <div className="flex justify-between"><span>Yes:</span> <strong className="text-zinc-200">{groomAccepted}</strong></div>
                  <div className="flex justify-between"><span>No:</span> <strong className="text-zinc-200">{groomDeclined}</strong></div>
                  <div className="flex justify-between"><span>Maybe:</span> <strong className="text-zinc-200">{groomMaybe}</strong></div>
                  <div className="flex justify-between"><span>Wait:</span> <strong className="text-zinc-200">{groomPending}</strong></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Invitation type splits */}
          <Card className="p-4 border border-[#D4AF37]/10 space-y-3.5">
            <h4 className="font-cinzel text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] border-b border-zinc-900 pb-2">
              Invitation Methods
            </h4>
            
            <div className="space-y-2.5 text-[10px] text-zinc-400">
              <div className="flex justify-between py-0.5 border-b border-zinc-900/60">
                <span className="font-semibold text-zinc-300">Digital Invites</span>
                <span>Replies: <strong>{digitalBreakdown.accepted}Y / {digitalBreakdown.declined}N</strong> (Total {digitalBreakdown.total})</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-zinc-900/60">
                <span className="font-semibold text-zinc-300">Printed Cards</span>
                <span>Replies: <strong>{printedBreakdown.accepted}Y / {printedBreakdown.declined}N</strong> (Total {printedBreakdown.total})</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="font-semibold text-zinc-300">Both Methods</span>
                <span>Replies: <strong>{bothBreakdown.accepted}Y / {bothBreakdown.declined}N</strong> (Total {bothBreakdown.total})</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Section 3 & 4: Table & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Table: Recent Responses */}
        <Card className="p-5 border border-[#D4AF37]/10 space-y-4 lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3">
            <Activity size={16} className="text-[#D4AF37]" />
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Recent RSVP Responses
            </h3>
          </div>

          <div className="overflow-x-auto text-xs">
            <Table headers={['Guest Name', 'Family Group', 'RSVP Reply', 'Headcount', 'Time Responded']}>
              {recentResponses.map((g) => (
                <tr key={g.id} className="hover:bg-[#141414]/25 transition duration-150">
                  <td className="p-3 font-semibold text-zinc-200">{g.name}</td>
                  <td className="p-3 text-[#F5F5F5]/65">{g.familyName || 'General'}</td>
                  <td className="p-3">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(g.rsvpStatus)}`}>
                      {g.rsvpStatus === 'attending' ? 'Accepted' : g.rsvpStatus}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{g.membersCount || 1}</td>
                  <td className="p-3 text-zinc-500 font-mono text-[10px]">
                    {getRelativeTime(g.updatedAt || g.createdAt)}
                  </td>
                </tr>
              ))}
              {recentResponses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-zinc-500 font-poppins">
                    No RSVP replies recorded yet.
                  </td>
                </tr>
              )}
            </Table>
          </div>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="p-5 border border-[#D4AF37]/10 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D4AF37]/5 pb-3">
            <Settings size={16} className="text-[#D4AF37]" />
            <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Quick Controls
            </h3>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={() => setActiveModal('pending')}
              variant="secondary"
              className="py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Eye size={13} />
              <span>View Pending ({pendingInvites})</span>
            </Button>

            <Button
              onClick={() => setActiveModal('accepted')}
              variant="secondary"
              className="py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Eye size={13} />
              <span>View Accepted ({acceptedInvites})</span>
            </Button>

            <Button
              onClick={handleExportRsvps}
              variant="emerald"
              className="py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Download size={13} />
              <span>Export RSVP CSV</span>
            </Button>

            <div className="relative group select-none">
              <Button
                disabled
                variant="primary"
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 opacity-40 cursor-not-allowed"
              >
                <Send size={13} />
                <span>Send Reminder</span>
              </Button>
              <span className="absolute top-1 right-2 text-[8px] tracking-wider bg-[#141414] border border-[#D4AF37]/20 px-1.5 py-0.5 rounded text-[#D4AF37]/70 font-poppins">
                SOON
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal: View Pending RSVP lists */}
      <Modal isOpen={activeModal === 'pending'} onClose={() => setActiveModal(null)} title={`Pending Invitations List (${pendingInvites})`}>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 font-poppins text-xs">
          <div className="border-b border-zinc-900 pb-2 mb-2 grid grid-cols-3 font-semibold text-[#D4AF37] uppercase text-[10px]">
            <span>Guest Name</span>
            <span>Family Group</span>
            <span className="text-right">Headcount</span>
          </div>
          {guests.filter(g => g.rsvpStatus === 'pending').map((g) => (
            <div key={g.id} className="grid grid-cols-3 py-1.5 border-b border-zinc-900/60 text-zinc-300">
              <span className="font-semibold text-zinc-100">{g.name}</span>
              <span>{g.familyName || 'General'}</span>
              <span className="text-right font-mono">{g.membersCount || 1}</span>
            </div>
          ))}
          {pendingInvites === 0 && (
            <div className="text-center py-4 text-zinc-500">No pending RSVP invitations remaining!</div>
          )}
        </div>
      </Modal>

      {/* Modal: View Accepted RSVP lists */}
      <Modal isOpen={activeModal === 'accepted'} onClose={() => setActiveModal(null)} title={`Accepted RSVP List (${acceptedInvites})`}>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 font-poppins text-xs">
          <div className="border-b border-zinc-900 pb-2 mb-2 grid grid-cols-4 font-semibold text-[#D4AF37] uppercase text-[10px]">
            <span>Guest Name</span>
            <span>Family Group</span>
            <span>Side</span>
            <span className="text-right">Headcount</span>
          </div>
          {guests.filter(g => g.rsvpStatus === 'attending').map((g) => (
            <div key={g.id} className="grid grid-cols-4 py-1.5 border-b border-zinc-900/60 text-zinc-300">
              <span className="font-semibold text-zinc-100 truncate pr-2">{g.name}</span>
              <span className="truncate pr-2">{g.familyName || 'General'}</span>
              <span className="capitalize">{g.side}</span>
              <span className="text-right font-mono">{g.membersCount || 1}</span>
            </div>
          ))}
          {acceptedInvites === 0 && (
            <div className="text-center py-4 text-zinc-500">No accepted RSVP replies yet.</div>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default RsvpDashboard;
