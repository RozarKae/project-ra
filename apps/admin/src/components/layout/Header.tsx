import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Sun, Moon, Menu, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@project-ra/firebase';
import { useActivityLogs } from '@project-ra/shared';
import { toast } from 'react-hot-toast';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const { logs } = useActivityLogs();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sync theme with document class
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast.success(
      isDarkMode ? 'Theme changed to Light Mode' : 'Theme changed to Luxury Dark Mode',
      { id: 'theme-change-toast' }
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Logout failed.');
    }
  };

  const getRelativeTime = (isoString: string): string => {
    try {
      const now = new Date();
      const date = new Date(isoString);
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMs < 0 || diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return 'Some time ago';
    }
  };

  // Display top 5 most recent activity entries
  const recentActivities = logs.slice(0, 5);

  return (
    <header className="h-16 border-b border-[#D4AF37]/10 bg-[#141414]/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 font-poppins text-[#F5F5F5]">
      
      {/* Page Title & Hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden text-[#D4AF37] hover:text-[#F3E7C4] transition p-1.5 rounded-lg bg-[#141414] border border-[#D4AF37]/15"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold tracking-wider font-cinzel uppercase text-[#F5F5F5]">
            Admin Control Center
          </h2>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        
        {/* Mock Search Bar */}
        <div className="relative hidden md:block w-64">
          <input
            type="text"
            placeholder="Search guests or events..."
            className="w-full text-xs bg-[#090909] border border-[#D4AF37]/15 text-[#F5F5F5] rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20 transition"
          />
          <Search size={14} className="absolute left-3.5 top-2.5 text-[#F5F5F5]/40" />
        </div>
        <button className="md:hidden text-[#F5F5F5]/70 hover:text-[#D4AF37] transition p-2 rounded-full hover:bg-[#141414]">
          <Search size={16} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="text-[#F5F5F5]/70 hover:text-[#D4AF37] transition p-2 rounded-full hover:bg-[#141414] border border-transparent hover:border-[#D4AF37]/10"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to luxury dark'}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-[#F5F5F5]/70 hover:text-[#D4AF37] transition p-2 rounded-full hover:bg-[#141414] border border-transparent hover:border-[#D4AF37]/10"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {recentActivities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0F6D5B] shadow-[0_0_8px_#0F6D5B]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-panel rounded-xl overflow-hidden shadow-xl z-50">
              <div className="p-4 border-b border-[#D4AF37]/10 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider font-cinzel text-[#D4AF37]">Notifications</span>
                <span className="text-[9px] text-[#0F6D5B] bg-[#0F6D5B]/10 px-2 py-0.5 rounded-full font-semibold uppercase">
                  {recentActivities.length} Alert{recentActivities.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-[#D4AF37]/10 max-h-[300px] overflow-y-auto">
                {recentActivities.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-[#141414]/90 transition cursor-pointer">
                    <p className="text-xs text-[#F5F5F5]/85 leading-relaxed">{notif.details || notif.description}</p>
                    <span className="text-[9px] text-[#F5F5F5]/40 mt-1 block font-mono">{getRelativeTime(notif.timestamp)}</span>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <div className="p-6 text-center text-zinc-500 text-xs font-poppins">
                    No active notifications.
                  </div>
                )}
              </div>
              {recentActivities.length > 0 && (
                <div className="p-3 bg-[#090909]/40 border-t border-[#D4AF37]/10 text-center">
                  <span className="text-[9px] uppercase tracking-wider text-[#D4AF37]/65 block">
                    Synced with System Activity Feed
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition"
          >
            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/20 flex items-center justify-center bg-zinc-900 overflow-hidden font-cinzel text-xs font-bold text-[#D4AF37]">
              {user?.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <ChevronDown size={14} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 glass-panel rounded-xl overflow-hidden shadow-xl z-50">
              <div className="p-3 border-b border-[#D4AF37]/10">
                <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold">Logged in as</span>
                <span className="text-xs font-semibold block text-zinc-300 truncate">{user?.email || 'admin@projectra.com'}</span>
              </div>
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-rose-400 hover:bg-rose-500/5 rounded-lg transition"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
