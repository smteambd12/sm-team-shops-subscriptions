
import React from 'react';
import { Star, Crown, Zap } from 'lucide-react';
import AnimatedBackground from './premium/AnimatedBackground';
import PremiumHeader from './premium/PremiumHeader';
import PremiumPlanCard from './premium/PremiumPlanCard';
import PremiumCTA from './premium/PremiumCTA';

const PremiumSubscriptionSection = () => {
  const plans = [
    {
      title: 'বেসিক প্ল্যান',
      description: 'শুরুর জন্য পারফেক্ট',
      price: '৯৯৯ টাকা',
      period: 'প্রতি মাসে',
      features: [
        { text: '৫টি প্রিমিয়াম অ্যাপ', iconColor: 'text-blue-400' },
        { text: '২৪/৭ সাপোর্ট', iconColor: 'text-blue-400' },
        { text: 'মাসিক আপডেট', iconColor: 'text-blue-400' }
      ],
      buttonText: 'শুরু করুন',
      buttonClassName: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white',
      icon: <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Star className="w-8 h-8 text-white" />
      </div>
    },
    {
      title: 'প্রো প্ল্যান',
      description: 'সবচেয়ে জনপ্রিয় পছন্দ',
      price: '১৯৯৯ টাকা',
      period: 'প্রতি মাসে',
      discount: '৩০% ছাড়!',
      features: [
        { text: '১৫টি প্রিমিয়াম অ্যাপ', iconColor: 'text-yellow-400' },
        { text: 'অগ্রাধিকার সাপোর্ট', iconColor: 'text-yellow-400' },
        { text: 'সাপ্তাহিক আপডেট', iconColor: 'text-yellow-400' },
        { text: 'এক্সক্লুসিভ ফিচার', iconColor: 'text-yellow-400' }
      ],
      buttonText: 'এখনই নিন',
      buttonClassName: 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold shadow-lg',
      cardClassName: 'bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg border-2 border-yellow-400/50 hover:border-yellow-400/70 transition-all duration-500 transform hover:scale-110 hover:shadow-2xl relative overflow-hidden',
      icon: <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
        <Crown className="w-10 h-10 text-white" />
      </div>,
      isPopular: true
    },
    {
      title: 'এন্টারপ্রাইজ',
      description: 'ব্যবসার জন্য সেরা',
      price: '৪৯৯৯ টাকা',
      period: 'প্রতি মাসে',
      features: [
        { text: 'আনলিমিটেড অ্যাপ', iconColor: 'text-purple-400' },
        { text: 'ডেডিকেটেড সাপোর্ট', iconColor: 'text-purple-400' },
        { text: 'কাস্টম ইন্টিগ্রেশন', iconColor: 'text-purple-400' },
        { text: 'এডভান্স অ্যানালিটিক্স', iconColor: 'text-purple-400' }
      ],
      buttonText: 'যোগাযোগ করুন',
      buttonClassName: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white',
      icon: <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <Zap className="w-8 h-8 text-white" />
      </div>
    }
  ];

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <AnimatedBackground />

      <div className="container mx-auto max-w-6xl relative z-10">
        <PremiumHeader />

        {/* Premium Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <PremiumPlanCard
              key={index}
              title={plan.title}
              description={plan.description}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              buttonText={plan.buttonText}
              buttonClassName={plan.buttonClassName}
              cardClassName={plan.cardClassName}
              icon={plan.icon}
              discount={plan.discount}
              isPopular={plan.isPopular}
            />
          ))}
        </div>

        <PremiumCTA />
      </div>
    </section>
  );
};

export default PremiumSubscriptionSection;
