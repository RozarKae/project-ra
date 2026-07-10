import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import Card from '../common/Card';
import { useWeddingSettings } from '../../hooks/useWeddingSettings';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownCard: React.FC = () => {
  const { settings } = useWeddingSettings();
  
  // Resolve the Nikah event or the first available event date
  const nikahEvent = settings?.events?.find(
    e => e.id === 'nikah' || e.name.toLowerCase().includes('nikah')
  ) || settings?.events?.[0];
  
  const targetDate = nikahEvent 
    ? new Date(nikahEvent.date).getTime() 
    : new Date('2026-08-30T11:00:00').getTime();

  const calculateTimeLeft = (): TimeLeft => {
    const difference = targetDate - Date.now();
    let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    // Recalculate on mount or target date change
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeSegments = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  const dateLabel = nikahEvent ? nikahEvent.name : 'Nikah Date';
  const dateFormatted = nikahEvent 
    ? `${new Date(nikahEvent.date).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })} • ${new Date(nikahEvent.date).toLocaleTimeString(undefined, { 
        hour: 'numeric', 
        minute: '2-digit' 
      })}`
    : 'August 30, 2026 • 11:00 AM';

  return (
    <Card className="w-full">
      <div>
        <div className="flex items-center gap-3 border-b border-[#D4AF37]/10 pb-4 mb-4">
          <Clock size={18} className="text-[#D4AF37]" />
          <h3 className="text-sm font-semibold tracking-wider font-cinzel uppercase text-[#F5F5F5]">
            Wedding Countdown
          </h3>
        </div>

        <p className="text-[10px] text-[#F5F5F5]/45 uppercase tracking-widest font-medium mb-4 block">
          {dateLabel}: {dateFormatted}
        </p>

        <div className="grid grid-cols-4 gap-2">
          {timeSegments.map((seg, idx) => (
            <div 
              key={idx} 
              className="flex flex-col items-center p-2 rounded-xl bg-[#090909]/75 border border-[#D4AF37]/10 shadow-inner relative overflow-hidden"
            >
              {/* Top ambient gold bar */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
              
              <span className="text-xl md:text-2xl font-semibold tracking-tight text-[#D4AF37] font-cinzel">
                {String(seg.value).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#F5F5F5]/40 font-poppins mt-1">
                {seg.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Decorative motivational text */}
      <div className="mt-5 text-center text-[10px] italic text-[#F5F5F5]/30 border-t border-[#D4AF37]/5 pt-3.5">
        "May Allah bless this union and grant it infinite tranquility."
      </div>
    </Card>
  );
};

export default CountdownCard;
