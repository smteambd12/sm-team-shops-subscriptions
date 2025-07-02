
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PremiumCTA = () => {
  return (
    <div className="text-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-white mb-4">
          এখনই শুরু করুন এবং ৩০% ছাড় পান!
        </h3>
        <p className="text-white/80 mb-6">
          সীমিত সময়ের অফার - প্রথম ১০০ জন ব্যবহারকারীর জন্য বিশেষ ছাড়
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105">
              বিনামূল্যে ট্রায়াল শুরু করুন
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg transition-all duration-300">
            আরও জানুন
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumCTA;
