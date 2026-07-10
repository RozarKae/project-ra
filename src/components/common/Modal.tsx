import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-lg glass-panel p-6 rounded-3xl border border-[#D4AF37]/20 shadow-[0_15px_40px_rgba(0,0,0,0.6)] z-10"
          >
            <div className="flex items-center justify-between border-b border-[#D4AF37]/10 pb-4 mb-4">
              <h3 className="text-sm font-semibold tracking-wider font-cinzel uppercase text-[#F5F5F5]">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-[#D4AF37] hover:text-[#F3E7C4] transition"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="text-xs text-[#F5F5F5]/80 space-y-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
