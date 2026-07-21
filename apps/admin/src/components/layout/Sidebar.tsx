import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Settings, 
  Compass, 
  LogOut, 
  X,
  Database,
  Send,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@project-ra/firebase';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout, isMock } = useAuth();

  interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    subItems?: { name: string; href: string }[];
    disabled?: boolean;
  }

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Guest List', href: '/admin/guests', icon: Users },
    { 
      name: 'RSVP', 
      href: '/admin/rsvp', 
      icon: CheckSquare,
      subItems: [
        { name: 'Dashboard', href: '/admin/rsvp' },
        { name: 'RSVP Details', href: '/admin/rsvp/details' },
        { name: 'Attendance', href: '/admin/rsvp/attendance' },
        { name: 'Hospitality', href: '/admin/rsvp/hospitality' }
      ]
    },
    { name: 'Invitations', href: '/admin/invitations', icon: Send },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { 
      name: 'Settings', 
      href: '/admin/settings/workspace', 
      icon: Settings,
      subItems: [
        { name: 'Workspace', href: '/admin/settings/workspace' },
        { name: 'Wedding Details', href: '/admin/settings/wedding' },
        { name: 'My Profile', href: '/admin/settings/profile' },
        { name: 'Team', href: '/admin/settings/team' }
      ]
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 glass-panel border-r border-[#D4AF37]/10
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Insignia Header */}
        <div className="p-6 border-b border-[#D4AF37]/10 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="font-cinzel text-[14px] tracking-[0.08em] text-[#D4AF37] font-bold">NIKAHS & WEDDINGS</h1>
            <span className="text-[9px] uppercase tracking-widest text-[#0F6D5B] font-semibold mt-1">Management Portal</span>
          </div>
          <button 
            className="lg:hidden text-[#D4AF37] hover:text-[#F3E7C4] transition"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.subItems && item.subItems.some(sub => location.pathname === sub.href));
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-4 px-4 py-3 text-[#F5F5F5]/30 cursor-not-allowed select-none rounded-lg text-sm border border-transparent"
                  title="Coming Soon in a future Sprint"
                >
                  <Icon size={16} />
                  <span className="font-poppins">{item.name}</span>
                  <span className="ml-auto text-[8px] tracking-wider uppercase bg-[#141414] border border-[#D4AF37]/5 px-1.5 py-0.5 rounded text-[#D4AF37]/40">Soon</span>
                </div>
              );
            }

            return (
              <div key={item.name} className="space-y-1">
                <Link
                  to={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-all duration-300 font-poppins border
                    ${isActive 
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)]' 
                      : 'text-[#F5F5F5]/70 hover:bg-[#141414] hover:text-[#F5F5F5] border-transparent'
                    }
                  `}
                >
                  <Icon size={16} className={isActive ? 'text-[#D4AF37]' : 'text-[#F5F5F5]/50'} />
                  <span>{item.name}</span>
                </Link>

                {item.subItems && (
                  <div className="pl-10 space-y-1">
                    {item.subItems.map((sub) => {
                      const isSubActive = location.pathname === sub.href;
                      return (
                        <Link
                          key={sub.name}
                          to={sub.href}
                          onClick={onClose}
                          className={`
                            block px-3 py-2 text-xs font-poppins rounded-lg transition-all border
                            ${isSubActive 
                              ? 'text-[#D4AF37] border-[#D4AF37]/20 bg-[#D4AF37]/5 font-semibold' 
                              : 'text-[#F5F5F5]/50 hover:text-white border-transparent'
                            }
                          `}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom utility bar */}
        <div className="p-4 border-t border-[#D4AF37]/10 space-y-3.5">
          {/* Public invitation website preview */}
          <a
            href="/"
            onClick={onClose}
            className="flex items-center justify-center gap-2.5 w-full px-4 py-2.5 rounded-lg border border-[#0F6D5B]/30 bg-[#0F6D5B]/5 hover:bg-[#0F6D5B]/10 text-[#148C75] hover:text-[#F5F5F5] transition text-xs font-poppins"
          >
            <Compass size={14} />
            <span>Preview Invitation</span>
          </a>

          {/* Mode Badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-[#141414]/50 border border-[#D4AF37]/5 text-[10px]">
            <Database size={12} className={isMock ? 'text-amber-500' : 'text-[#148C75]'} />
            <span className="text-[#F5F5F5]/60 font-poppins">
              Auth: {isMock ? 'Mock Offline' : 'Firebase Live'}
            </span>
          </div>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-950/20 hover:text-red-300 rounded-lg transition font-poppins"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
