import { motion } from 'framer-motion';

export const CrescentLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090909] font-poppins">
      <div className="relative flex items-center justify-center">
        {/* Soft golden outer glow ring */}
        <motion.div
          className="absolute w-28 h-28 rounded-full border-t border-l border-[#D4AF37]/40 filter blur-[3px]"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        />
        
        {/* Main Golden Crescent Moon SVG */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="w-20 h-20 flex items-center justify-center"
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full fill-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
          >
            {/* Smooth crescent shape path */}
            <path d="M50,10 A40,40 0 1,0 90,50 A30,30 0 1,1 50,10" />
          </svg>
        </motion.div>
      </div>
      
      {/* Elegantly animated cinematic text */}
      <motion.p
        className="mt-8 text-xs tracking-[0.25em] uppercase font-cinzel text-[#F3E7C4] text-center"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        Loading dashboard...
      </motion.p>
    </div>
  );
};

export default CrescentLoader;
