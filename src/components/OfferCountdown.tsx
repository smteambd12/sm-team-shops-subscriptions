
import React, { useState, useEffect } from 'react';
import { Clock, Flame } from 'lucide-react';

interface OfferCountdownProps {
  endDate?: string;
  className?: string;
}

const OfferCountdown = ({ endDate, className = "" }: OfferCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // If no endDate provided, set a default 24 hours from now
    const targetDate = endDate ? new Date(endDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className={`flex items-center gap-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg ${className}`}>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 animate-pulse" />
        <Flame className="w-4 h-4 text-yellow-300 animate-bounce" />
      </div>
      
      <div className="flex items-center gap-1 text-sm font-bold">
        <span>অফার শেষ:</span>
        <div className="flex gap-1 ml-2">
          {timeLeft.days > 0 && (
            <div className="bg-white/20 px-2 py-1 rounded text-xs">
              {timeLeft.days}দিন
            </div>
          )}
          <div className="bg-white/20 px-2 py-1 rounded text-xs">
            {timeLeft.hours.toString().padStart(2, '0')}ঘ
          </div>
          <div className="bg-white/20 px-2 py-1 rounded text-xs">
            {timeLeft.minutes.toString().padStart(2, '0')}মি
          </div>
          <div className="bg-white/20 px-2 py-1 rounded text-xs animate-pulse">
            {timeLeft.seconds.toString().padStart(2, '0')}সে
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferCountdown;
