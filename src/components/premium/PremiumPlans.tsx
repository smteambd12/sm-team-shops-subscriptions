
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Crown, Check, Star, Zap } from 'lucide-react';

interface PremiumPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_months: number;
  features: string[];
  monthly_credits: number;
  is_popular: boolean;
  is_active: boolean;
}

const PremiumPlans: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching premium plans:', error);
      toast({
        title: "ত্রুটি",
        description: "প্রিমিয়াম প্ল্যান লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: PremiumPlan) => {
    setSubscribing(plan.id);
    
    try {
      // In a real implementation, you would integrate with a payment gateway
      // For now, we'll simulate a subscription
      
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + plan.duration_months);

      const { error } = await supabase
        .from('user_premium_subscriptions')
        .insert({
          user_id: user?.id,
          plan_id: plan.id,
          status: 'active',
          starts_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      // Also update user credits with monthly credits
      const { error: creditsError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: user?.id,
          credits_balance: plan.monthly_credits,
          total_purchased: plan.monthly_credits,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (creditsError) throw creditsError;

      toast({
        title: "সাবস্ক্রিপশন সফল!",
        description: `${plan.name} সফলভাবে সক্রিয় করা হয়েছে। ${plan.monthly_credits} ক্রেডিট যোগ করা হয়েছে।`,
      });

    } catch (error) {
      console.error('Error subscribing to plan:', error);
      toast({
        title: "ত্রুটি",
        description: "সাবস্ক্রিপশনে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">প্রিমিয়াম প্ল্যান</h3>
        <p className="text-gray-600">সব AI ফিচার আনলক করুন এবং বেশি ক্রেডিট পান</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-200 hover:shadow-lg ${
              plan.is_popular ? 'border-2 border-yellow-500 scale-105' : ''
            }`}
          >
            {plan.is_popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-500 text-white px-4 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  সবচেয়ে জনপ্রিয়
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-yellow-500" />
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              
              <CardDescription className="mb-4">{plan.description}</CardDescription>
              
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-600">
                  ৳{plan.price}
                </div>
                <div className="text-sm text-gray-500">
                  {plan.duration_months} মাসের জন্য
                </div>
                <div className="flex items-center justify-center gap-1 text-sm">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>মাসিক {plan.monthly_credits} ক্রেডিট</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={() => handleSubscribe(plan)}
                disabled={subscribing === plan.id}
                className={`w-full ${plan.is_popular ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                size="lg"
              >
                {subscribing === plan.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    সাবস্ক্রাইব করা হচ্ছে...
                  </>
                ) : (
                  <>
                    এখনই সাবস্ক্রাইব করুন
                    <Crown className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          যেকোনো সময় আপগ্রেড বা ডাউনগ্রেড করুন। কোনো লুকানো খরচ নেই।
        </p>
      </div>
    </div>
  );
};

export default PremiumPlans;
