import React from 'react';
import { BarChart3 } from 'lucide-react';
import Card from '../common/Card';

export const AnalyticsCard: React.FC = () => {
  // Mock data for analytics calculation
  const total = 350;
  const confirmed = 148;
  const declined = 37;
  const pending = 165;
  
  const rsvpProcessed = confirmed + declined; // 185
  const processedPercent = Math.round((rsvpProcessed / total) * 100); // 53%
  const confirmedPercent = Math.round((confirmed / total) * 100); // 42%
  const pendingPercent = Math.round((pending / total) * 100); // 47%
  const declinedPercent = Math.round((declined / total) * 100); // 11%

  // SVG parameters for radial circle
  const radius = 36;
  const circumference = 2 * Math.PI * radius; // ~226.19
  const strokeDashoffset = circumference - (processedPercent / 100) * circumference;

  return (
    <Card className="w-full">
      <div>
        <div className="flex items-center gap-3 border-b border-[#D4AF37]/10 pb-4 mb-4">
          <BarChart3 size={18} className="text-[#D4AF37]" />
          <h3 className="text-sm font-semibold tracking-wider font-cinzel uppercase text-[#F5F5F5]">
            RSVP Analytics
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Radial circular progress chart */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#090909]/40 border border-[#D4AF37]/5 shadow-inner">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-[#141414] fill-none"
                  strokeWidth="8"
                />
                {/* Filled Progress Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-[#D4AF37] fill-none transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.4))' }}
                />
              </svg>
              {/* Inner details text */}
              <div className="absolute flex flex-col items-center justify-center font-cinzel text-[#F5F5F5]">
                <span className="text-xl font-bold tracking-tight">{processedPercent}%</span>
                <span className="text-[7px] uppercase tracking-widest text-[#F5F5F5]/45">Processed</span>
              </div>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-[#F5F5F5]/50 mt-3.5 font-poppins">
              {rsvpProcessed} of {total} Responses Collected
            </span>
          </div>

          {/* Breakdown horizontal bar chart */}
          <div className="space-y-4 font-poppins text-xs">
            {/* Confirmed Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#F5F5F5]/80">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0F6D5B]" />
                  <span>Attending (Confirmed)</span>
                </span>
                <span>{confirmed} ({confirmedPercent}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#141414] overflow-hidden border border-[#D4AF37]/5">
                <div 
                  className="h-full bg-[#0F6D5B] rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${confirmedPercent}%` }}
                />
              </div>
            </div>

            {/* Pending Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#F5F5F5]/80">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>No Response (Pending)</span>
                </span>
                <span>{pending} ({pendingPercent}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#141414] overflow-hidden border border-[#D4AF37]/5">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${pendingPercent}%` }}
                />
              </div>
            </div>

            {/* Declined Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#F5F5F5]/80">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>Declined Invitation</span>
                </span>
                <span>{declined} ({declinedPercent}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#141414] overflow-hidden border border-[#D4AF37]/5">
                <div 
                  className="h-full bg-rose-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${declinedPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AnalyticsCard;
