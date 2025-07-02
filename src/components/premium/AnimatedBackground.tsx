
import React from 'react';
import { Crown, Star, Sparkles, Zap } from 'lucide-react';

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700">
      <div className="absolute inset-0 opacity-20">
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd">
            <g fill="#ffffff" fillOpacity="0.1">
              <circle cx="30" cy="30" r="2"/>
            </g>
          </g>
        </svg>
      </div>
      
      {/* Floating Icons Animation */}
      <div className="absolute top-10 left-10 animate-bounce">
        <Crown className="w-8 h-8 text-white/30" />
      </div>
      <div className="absolute top-20 right-20 animate-pulse">
        <Star className="w-6 h-6 text-white/30" />
      </div>
      <div className="absolute bottom-20 left-20 animate-bounce delay-300">
        <Sparkles className="w-7 h-7 text-white/30" />
      </div>
      <div className="absolute bottom-10 right-10 animate-pulse delay-500">
        <Zap className="w-8 h-8 text-white/30" />
      </div>
    </div>
  );
};

export default AnimatedBackground;
