import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@project-ra/firebase';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { CrescentLoader } from '@project-ra/ui';

export const AdminLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    document.title = "Nikahs & Weddings | Admin Portal";
  }, []);

  if (loading) {
    return <CrescentLoader />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen bg-[#090909] text-[#F5F5F5] overflow-hidden">
      
      {/* Sidebar Menu */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header Navigation */}
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Inner Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#090909] relative">
          
          {/* Subtle Accent Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full filter blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0F6D5B]/5 rounded-full filter blur-[100px] pointer-events-none" />

          {/* Animate Page transitions on route changes */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-10 w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
