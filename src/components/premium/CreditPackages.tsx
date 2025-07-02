
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Gift, Zap, CreditCard, Percent } from 'lucide-react';

interface CreditPackage {
  id: string;
  name: string;
  credits_amount: number;
  price: number;
  discount_percentage: number;
  is_active: boolean;
}

interface CreditPackagesProps {
  onPurchaseSuccess: () => void;
}

const CreditPackages: React.FC<CreditPackagesProps> = ({ onPurchaseSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching credit packages:', error);
      toast({
        title: "ত্রুটি",
        description: "ক্রেডিট প্যাকেজ লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: CreditPackage) => {
    setPurchasing(pkg.id);
    
    try {
      // In a real implementation, you would integrate with a payment gateway
      // For now, we'll simulate a purchase
      
      // First, get or create user credits record
      const { data: existingCredits, error: fetchError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const currentBalance = existingCredits?.credits_balance || 0;
      const currentPurchased = existingCredits?.total_purchased || 0;

      // Update or insert user credits
      const { error: upsertError } = await supabase
        .from('user_credits')
        .upsert({
          user_id: user?.id,
          credits_balance: currentBalance + pkg.credits_amount,
          total_purchased: currentPurchased + pkg.credits_amount,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) throw upsertError;

      toast({
        title: "সফল কেনাকাটা!",
        description: `${pkg.credits_amount} ক্রেডিট আপনার অ্যাকাউন্টে যোগ করা হয়েছে।`,
      });

      onPurchaseSuccess();
    } catch (error) {
      console.error('Error purchasing credits:', error);
      toast({
        title: "ত্রুটি",
        description: "ক্রেডিট কিনতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
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
        <h3 className="text-2xl font-bold mb-2">ক্রেডিট প্যাকেজ</h3>
        <p className="text-gray-600">AI ফিচার ব্যবহারের জন্য ক্রেডিট কিনুন</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg, index) => {
          const isPopular = index === 1; // Middle package is popular
          
          return (
            <Card 
              key={pkg.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                isPopular ? 'border-2 border-purple-500 scale-105' : ''
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-4 py-1">
                    জনপ্রিয়
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="w-6 h-6 text-blue-500" />
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-bold text-blue-600">
                      {pkg.credits_amount.toLocaleString()}
                    </span>
                    <Zap className="w-6 h-6 text-yellow-500" />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold">৳{pkg.price}</span>
                    {pkg.discount_percentage > 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Percent className="w-3 h-3 mr-1" />
                        {pkg.discount_percentage}% ছাড়
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-center mb-6">
                  প্রতি ক্রেডিট ৳{(pkg.price / pkg.credits_amount).toFixed(2)} হারে
                </CardDescription>
                
                <Button 
                  onClick={() => handlePurchase(pkg)}
                  disabled={purchasing === pkg.id}
                  className={`w-full ${isPopular ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                  size="lg"
                >
                  {purchasing === pkg.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ক্রয় করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      এখনই কিনুন
                      <CreditCard className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          সব পেমেন্ট নিরাপদ এবং এনক্রিপ্টেড। কোনো লুকানো খরচ নেই।
        </p>
      </div>
    </div>
  );
};

export default CreditPackages;
