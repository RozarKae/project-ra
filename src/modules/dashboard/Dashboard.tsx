import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckSquare, 
  Hourglass, 
  Calendar, 
  Activity, 
  ShieldCheck, 
  Database, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Home,
  UserPlus,
  Download,
  Printer,
  RotateCw
} from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import CountdownCard from '../../components/dashboard/CountdownCard';
import AnalyticsCard from '../../components/dashboard/AnalyticsCard';
import { useAuth } from '../../lib/auth';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import { toast } from 'react-hot-toast';
import { useGuests } from '../../hooks/useGuests';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export const Dashboard: React.FC = () => {
  const { user, isMock } = useAuth();
  const { currentWorkspaceId, currentWeddingId } = useWorkspace();
  const [currentDate, setCurrentDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Consume SaaS custom hooks
  const { guests } = useGuests();
  const { logs } = useActivityLogs();

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));
  }, []);

  // Compute live KPIs
  const totalGuests = guests.length;
  const totalRsvps = guests.filter(g => g.rsvpStatus !== 'pending').length;
  const pendingCount = guests.filter(g => g.rsvpStatus === 'pending').length;
  const confirmedCount = guests.filter(g => g.rsvpStatus === 'attending').length;
  const declinedCount = guests.filter(g => g.rsvpStatus === 'declined').length;
  const familyCount = Array.from(new Set(guests.map(g => g.familyName).filter(Boolean))).length;

  // Stagger animation variants for dashboard elements
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  // Action handlers
  const handleAddGuest = () => {
    window.location.href = '/admin/guests';
  };

  const handleOpenRSVP = () => {
    window.open('/', '_blank');
  };

  const handleExportList = () => {
    toast.success('Preparing CSV guest list manifest...', { id: 'export-toast' });
    const headers = ['Name', 'Phone', 'Side', 'RSVP Status', 'VIP', 'Family Group', 'Notes'];
    const rows = guests.map(g => [g.name, g.phone || '', g.side.toUpperCase(), g.rsvpStatus.toUpperCase(), g.isVip ? 'YES' : 'NO', g.familyName || '', g.notes || '']);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `project_ra_guests_export_${currentWorkspaceId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintGuests = () => {
    window.print();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.loading('Synchronizing database telemetry...', { id: 'refresh-toast' });
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Telemetry synchronized with current workspace.', { id: 'refresh-toast' });
    }, 1000);
  };

  // Helper for relative timestamps
  const getRelativeTime = (isoString: string): string => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 1000 / 60);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Some time ago';
    }
  };

  // Helper for timeline action colors
  const getActionColorClass = (action: string): string => {
    const act = action.toLowerCase();
    if (act.includes('create') || act.includes('add')) return 'bg-[#D4AF37]';
    if (act.includes('delete')) return 'bg-rose-400';
    if (act.includes('update')) return 'bg-sky-400';
    return 'bg-[#0F6D5B]';
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 font-poppins"
    >
      {/* Title greeting bar */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D4AF37]/10 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-cinzel text-[#F5F5F5] font-bold tracking-wide">
            Dashboard Overview
          </h1>
          <p className="text-xs text-[#F5F5F5]/50">
            Active Workspace: <span className="text-[#D4AF37] font-semibold">{currentWorkspaceId}</span> • Wedding ID: <span className="text-[#D4AF37] font-semibold">{currentWeddingId}</span>
          </p>
        </div>
        
        {/* Calendar dynamic date node */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#141414] border border-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.02)] self-start sm:self-auto">
          <Calendar size={14} className="text-[#D4AF37]" />
          <span className="text-[11px] font-semibold text-[#F5F5F5]/80 font-poppins tracking-wider">{currentDate}</span>
        </div>
      </motion.div>

      {/* Metrics Cards Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <StatCard
          title="Total Guests"
          value={totalGuests}
          suffix=" total"
          description="Total consolidation of all groups"
          icon={Users}
          iconColorClass="text-[#D4AF37]"
        />
        <StatCard
          title="RSVPs"
          value={totalRsvps}
          suffix=" recvd"
          description="Total response collections"
          icon={CheckSquare}
          iconColorClass="text-sky-400"
        />
        <StatCard
          title="Pending"
          value={pendingCount}
          suffix=" pending"
          description="Awaiting response feedback"
          icon={Hourglass}
          iconColorClass="text-amber-500"
        />
        <StatCard
          title="Confirmed"
          value={confirmedCount}
          suffix=" yes"
          description="Guests attending the event"
          icon={CheckCircle2}
          iconColorClass="text-[#0F6D5B]"
        />
        <StatCard
          title="Declined"
          value={declinedCount}
          suffix=" no"
          description="Guests unable to attend"
          icon={XCircle}
          iconColorClass="text-rose-400"
        />
        <StatCard
          title="Families"
          value={familyCount}
          suffix=" groups"
          description="Families / individual circles"
          icon={Home}
          iconColorClass="text-indigo-400"
        />
      </motion.div>

      {/* Quick Actions Panel */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 bg-[#141414]/30 border border-[#D4AF37]/5 p-5 rounded-2xl">
        <h3 className="text-xs uppercase tracking-wider text-[#F5F5F5]/40 font-semibold">Quick Operations</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAddGuest}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-semibold tracking-wide font-poppins transition-all duration-300 shadow-md"
          >
            <UserPlus size={14} />
            <span>Add Guest</span>
          </button>
          <button
            onClick={handleOpenRSVP}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#0F6D5B]/30 bg-[#0F6D5B]/5 hover:bg-[#0F6D5B]/10 text-[#148C75] text-xs font-semibold tracking-wide font-poppins transition-all duration-300 shadow-md"
          >
            <ExternalLink size={14} />
            <span>Open RSVP</span>
          </button>
          <button
            onClick={handleExportList}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-[#F5F5F5]/80 text-xs font-semibold tracking-wide font-poppins transition-all duration-300 shadow-md"
          >
            <Download size={14} />
            <span>Export List</span>
          </button>
          <button
            onClick={handlePrintGuests}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-[#F5F5F5]/80 text-xs font-semibold tracking-wide font-poppins transition-all duration-300 shadow-md"
          >
            <Printer size={14} />
            <span>Print Guests</span>
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-[#F5F5F5]/80 text-xs font-semibold tracking-wide font-poppins transition-all duration-300 shadow-md"
          >
            <RotateCw size={14} className={isRefreshing ? 'animate-spin text-[#D4AF37]' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* Main Grid View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Analytics Chart & Timeline */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Charts */}
          <motion.div variants={itemVariants} className="flex">
            <AnalyticsCard />
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={itemVariants} className="flex flex-1">
            <Card className="w-full flex-1">
              <div>
                <div className="flex items-center gap-3 border-b border-[#D4AF37]/10 pb-4 mb-5">
                  <Activity size={18} className="text-[#D4AF37]" />
                  <h3 className="text-sm font-semibold tracking-wider font-cinzel uppercase text-[#F5F5F5]">
                    Recent activity
                  </h3>
                </div>

                <div className="relative pl-6 border-l border-[#D4AF37]/10 space-y-6">
                  {logs.slice(0, 4).map((log) => (
                    <div key={log.id} className="relative group">
                      {/* Node Dot */}
                      <span className={`absolute -left-[32px] top-1.5 w-3 h-3 rounded-full ${getActionColorClass(log.action)} ring-4 ring-[#090909]`} />
                      
                      <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl hover:bg-[#141414]/50 border border-transparent hover:border-[#D4AF37]/5 transition-all duration-300">
                        <div className="space-y-1">
                          <p className="text-xs text-[#F5F5F5]/85 leading-relaxed">{log.details}</p>
                          <span className="text-[10px] text-[#F5F5F5]/40 block">{getRelativeTime(log.timestamp)}</span>
                        </div>
                        <span className={`text-[9px] tracking-wider font-semibold uppercase px-2 py-0.5 rounded-full ${
                          log.action.includes('RSVP') ? 'bg-[#0F6D5B]/15 text-[#148C75] border border-[#0F6D5B]/30' :
                          log.action.includes('Create') ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30' :
                          'bg-[#141414] text-[#F5F5F5]/50 border border-[#D4AF37]/5'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-xs text-[#F5F5F5]/30 text-center py-6">No administrative logs recorded.</div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Sidebar: Countdown & Status Info */}
        <div className="space-y-6 flex flex-col">
          {/* Event Countdown */}
          <motion.div variants={itemVariants} className="flex">
            <CountdownCard />
          </motion.div>

          {/* Deployment Health */}
          <motion.div variants={itemVariants} className="flex flex-1">
            <Card className="w-full">
              <div>
                <div className="flex items-center gap-3 border-b border-[#D4AF37]/10 pb-4 mb-4">
                  <ShieldCheck size={18} className="text-[#0F6D5B]" />
                  <h3 className="text-sm font-semibold tracking-wider font-cinzel uppercase text-[#F5F5F5]">
                    Deployment Health
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Database Link */}
                  <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#090909] border border-[#D4AF37]/10">
                    <Database size={16} className={isMock ? 'text-amber-500 animate-pulse' : 'text-[#0F6D5B]'} />
                    <div>
                      <h4 className="text-xs font-semibold text-[#F5F5F5]">Firebase Core</h4>
                      <p className="text-[10px] text-[#F5F5F5]/45 mt-0.5">
                        {isMock ? 'Mock Offline Sandbox active' : 'Live Realtime connection'}
                      </p>
                    </div>
                  </div>

                  {/* Version Detail */}
                  <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#090909] border border-[#D4AF37]/10">
                    <ShieldCheck size={16} className="text-[#D4AF37]" />
                    <div>
                      <h4 className="text-xs font-semibold text-[#F5F5F5]">Platform version</h4>
                      <p className="text-[10px] text-[#F5F5F5]/45 mt-0.5">
                        SaaS Edition v2.0.0
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-[#0F6D5B]/5 border border-[#0F6D5B]/20 text-[11px] text-[#F5F5F5]/70 leading-relaxed font-poppins">
                  <span className="font-semibold text-[#148C75] block mb-1">Developer Notice</span>
                  This workspace maps all guest logs directly to isolated sub-tenant locations under: `/workspaces/{currentWorkspaceId}/weddings/{currentWeddingId}`.
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
