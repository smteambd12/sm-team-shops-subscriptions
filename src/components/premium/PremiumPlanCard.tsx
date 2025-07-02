
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface PlanFeature {
  text: string;
  iconColor: string;
}

interface PremiumPlanCardProps {
  title: string;
  description: string;
  price: string;
  period: string;
  features: PlanFeature[];
  buttonText: string;
  buttonClassName: string;
  cardClassName?: string;
  icon: React.ReactNode;
  discount?: string;
  isPopular?: boolean;
}

const PremiumPlanCard: React.FC<PremiumPlanCardProps> = ({
  title,
  description,
  price,
  period,
  features,
  buttonText,
  buttonClassName,
  cardClassName = "bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl",
  icon,
  discount,
  isPopular = false
}) => {
  return (
    <Card className={cardClassName}>
      {isPopular && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-4 py-2 rounded-full text-sm transform rotate-12">
          জনপ্রিয়
        </div>
      )}
      
      <CardContent className="p-8 text-center relative z-10">
        <div className="mb-6">
          <div className="mx-auto mb-4">
            {icon}
          </div>
          <h3 className={`font-bold text-white mb-2 ${isPopular ? 'text-3xl' : 'text-2xl'}`}>{title}</h3>
          <p className={`text-white/${isPopular ? '80' : '70'}`}>{description}</p>
        </div>
        
        <div className="mb-6">
          <div className={`font-bold text-white mb-2 ${isPopular ? 'text-5xl' : 'text-4xl'}`}>{price}</div>
          <div className="text-white/70">{period}</div>
          {discount && (
            <div className="text-yellow-400 text-sm font-semibold mt-1">{discount}</div>
          )}
        </div>

        <ul className="text-left space-y-3 mb-8 text-white/90">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Sparkles className={`w-4 h-4 mr-3 ${feature.iconColor}`} />
              {feature.text}
            </li>
          ))}
        </ul>

        <Button className={`w-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${isPopular ? 'py-4' : 'py-3'} ${buttonClassName}`}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PremiumPlanCard;
