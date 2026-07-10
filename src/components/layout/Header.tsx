import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Sun, Moon, Menu, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { toast } from 'react-hot-toast';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, text: 'New RSVP response received from Sarah Jenkins', time: '5m ago' },
    { id: 2, text: 'Guest list imported successfully', time: '1h ago' },
    { id: 3, text: 'Firebase database link active', time: '2d ago' },
  ];

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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0F6D5B] shadow-[0_0_8px_#0F6D5B]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-panel rounded-xl overflow-hidden shadow-xl z-50">
              <div className="p-4 border-b border-[#D4AF37]/10 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider font-cinzel text-[#D4AF37]">Notifications</span>
                <span className="text-[9px] text-[#0F6D5B] bg-[#0F6D5B]/10 px-2 py-0.5 rounded-full font-semibold uppercase">3 New</span>
              </div>
              <div className="divide-y divide-[#D4AF37]/10">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-[#141414]/90 transition cursor-pointer">
                    <p className="text-xs text-[#F5F5F5]/85 leading-relaxed">{notif.text}</p>
                    <span className="text-[9px] text-[#F5F5F5]/40 mt-1 block">{notif.time}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-[#090909]/40 border-t border-[#D4AF37]/10 text-center">
                <button className="text-[10px] uppercase tracking-wider text-[#D4AF37] hover:text-[#F3E7C4] font-semibold transition">
                  Clear All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-[#090909] border border-[#D4AF37]/15 hover:border-[#D4AF37]/35 transition"
          >
            <div className="w-7 h-7 rounded-full bg-[#0F6D5B]/30 border border-[#0F6D5B]/50 flex items-center justify-center text-[#D4AF37] font-semibold text-xs uppercase shadow-[0_0_8px_rgba(15,109,91,0.15)]">
              {user?.email ? user.email.charAt(0) : 'A'}
            </div>
            <span className="hidden sm:block text-xs font-medium text-[#F5F5F5]/80 max-w-[80px] truncate">
              {user?.displayName || 'Admin'}
            </span>
            <ChevronDown size={14} className="text-[#F5F5F5]/50" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 glass-panel rounded-xl overflow-hidden shadow-xl z-50">
              <div className="p-4 border-b border-[#D4AF37]/10">
                <p className="text-xs font-semibold text-[#F5F5F5]/90 truncate">{user?.displayName || 'Administrator'}</p>
                <p className="text-[10px] text-[#F5F5F5]/50 truncate mt-0.5">{user?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    toast.success('Profile Settings is scheduled for Sprint B!');
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-xs hover:bg-[#141414] rounded-lg transition text-[#F5F5F5]/70 hover:text-[#F5F5F5]"
                >
                  <User size={14} />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-xs text-red-400 hover:bg-red-950/20 rounded-lg transition"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
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
