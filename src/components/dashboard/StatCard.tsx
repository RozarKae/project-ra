import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  iconColorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  suffix = '',
  prefix = '',
  description,
  icon: Icon,
  iconColorClass = 'text-[#D4AF37]',
}) => {
  // Motion value for counter
  const count = useMotionValue(0);
  // Transform to round values
  const rounded = useTransform(count, (latest: number) => Math.round(latest));

  useEffect(() => {
    // Animate from 0 to value
    const controls = animate(count, value, {
      duration: 1.2,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [value, count]);

  return (
    <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[140px] font-poppins">
      
      {/* Decorative background glow node */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#D4AF37]/5 rounded-full filter blur-[20px] pointer-events-none" />

      {/* Header title + icon block */}
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F5F5F5]/50 font-poppins">
          {title}
        </span>
        <div className={`p-2 rounded-lg bg-[#141414] border border-[#D4AF37]/10 flex items-center justify-center ${iconColorClass} shadow-md`}>
          <Icon size={16} />
        </div>
      </div>

      {/* Large Counter Display */}
      <div className="my-3 flex items-baseline">
        {prefix && <span className="text-xl font-cinzel text-[#D4AF37] mr-1">{prefix}</span>}
        <motion.span className="text-3xl font-semibold tracking-tight text-[#F5F5F5] font-cinzel">
          {rounded}
        </motion.span>
        {suffix && <span className="text-base text-[#F5F5F5]/60 font-poppins ml-1">{suffix}</span>}
      </div>

      {/* Helper description */}
      <div className="text-[11px] text-[#F5F5F5]/45 leading-normal">
        {description}
      </div>

    </div>
  );
};

export default StatCard;
