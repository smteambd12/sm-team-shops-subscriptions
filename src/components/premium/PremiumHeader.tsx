
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Gift, Zap, Shield } from 'lucide-react';

const PremiumHeader = () => {
  return (
    <div className="text-center mb-12">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
          <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-4 border border-white/20">
            <Crown className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>
      
      <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
        প্রিমিয়াম সাবস্ক্রিপশন প্ল্যান
      </h2>
      
      <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
        সবচেয়ে কম দামে পেয়ে যান আপনার পছন্দের সব সেবা
      </p>

      {/* Feature Badges */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-6 py-3 backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
          <Gift className="w-5 h-5 mr-2" />
          ৫০% পর্যন্ত ছাড়
        </Badge>
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-6 py-3 backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
          <Zap className="w-5 h-5 mr-2" />
          তাৎক্ষণিক ডেলিভারি
        </Badge>
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-6 py-3 backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
          <Shield className="w-5 h-5 mr-2" />
          ২৪/৭ সাপোর্ট
        </Badge>
      </div>
    </div>
  );
};

export default PremiumHeader;
