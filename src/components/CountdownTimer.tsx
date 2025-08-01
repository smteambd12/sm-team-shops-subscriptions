
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate?: Date;
}

const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set default target date to 7 days from now if not provided
    const target = targetDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = target.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-3 bg-red-100 px-4 py-2 rounded-lg border border-red-200">
      <Clock className="h-5 w-5 text-red-600 animate-pulse" />
      <div className="flex items-center gap-2 text-sm font-medium text-red-700">
        <div className="flex items-center gap-1">
          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            {timeLeft.days.toString().padStart(2, '0')}
          </span>
          <span className="text-xs">দিন</span>
        </div>
        <span className="text-red-600">:</span>
        <div className="flex items-center gap-1">
          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            {timeLeft.hours.toString().padStart(2, '0')}
          </span>
          <span className="text-xs">ঘন্টা</span>
        </div>
        <span className="text-red-600">:</span>
        <div className="flex items-center gap-1">
          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            {timeLeft.minutes.toString().padStart(2, '0')}
          </span>
          <span className="text-xs">মিনিট</span>
        </div>
        <span className="text-red-600">:</span>
        <div className="flex items-center gap-1">
          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
            {timeLeft.seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-xs">সেকেন্ড</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
