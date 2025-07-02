
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  Crown, 
  Zap, 
  Star,
  Check,
  ArrowRight,
  Gift,
  CreditCard
} from 'lucide-react';
import AIFeatureGrid from './premium/AIFeatureGrid';
import CreditPackages from './premium/CreditPackages';
import PremiumPlans from './premium/PremiumPlans';
import UserCreditsDisplay from './premium/UserCreditsDisplay';

const PremiumSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserCredits();
    }
  }, [user]);

  const fetchUserCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits_balance')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching credits:', error);
        return;
      }

      setUserCredits(data?.credits_balance || 0);
    } catch (error) {
      console.error('Error fetching user credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCredits = () => {
    fetchUserCredits();
  };

  if (!user) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              প্রিমিয়াম AI ফিচার
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              লগইন করুন এবং শক্তিশালী AI টুলস ব্যবহার করুন
            </p>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              লগইন করুন
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              প্রিমিয়াম AI ফিচার
            </h2>
            <Sparkles className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            শক্তিশালী AI টুলস, ক্রেডিট প্যাকেজ এবং প্রিমিয়াম প্ল্যান দিয়ে আপনার কাজের গতি বাড়ান
          </p>
        </div>

        {/* User Credits Display */}
        <UserCreditsDisplay credits={userCredits} loading={loading} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="features" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Zap size={16} />
              AI ফিচার
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <Gift size={16} />
              ক্রেডিট প্যাক
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Crown size={16} />
              প্রিমিয়াম প্ল্যান
            </TabsTrigger>
          </TabsList>

          <TabsContent value="features">
            <AIFeatureGrid userCredits={userCredits} onCreditsUpdate={refreshCredits} />
          </TabsContent>

          <TabsContent value="credits">
            <CreditPackages onPurchaseSuccess={refreshCredits} />
          </TabsContent>

          <TabsContent value="plans">
            <PremiumPlans />
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="w-6 h-6 text-yellow-300" />
                <h3 className="text-2xl font-bold">এখনই শুরু করুন!</h3>
                <Star className="w-6 h-6 text-yellow-300" />
              </div>
              <p className="text-lg mb-6 opacity-90">
                আজই প্রিমিয়াম প্ল্যান নিন এবং সব AI ফিচার আনলক করুন
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                প্রিমিয়াম প্ল্যান দেখুন
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PremiumSection;
