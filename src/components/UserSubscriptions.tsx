
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays, Clock, Package, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserSubscription {
  id: string;
  product_name: string;
  package_duration: string;
  price: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  auto_renew: boolean;
}

const UserSubscriptions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserSubscriptions();
    }
  }, [user]);

  const fetchUserSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "ত্রুটি",
        description: "সাবস্ক্রিপশন লোড করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (subscription: UserSubscription) => {
    const daysRemaining = getDaysRemaining(subscription.expires_at);
    
    if (!subscription.is_active) {
      return <Badge variant="secondary">নিষ্ক্রিয়</Badge>;
    }
    
    if (daysRemaining < 0) {
      return <Badge variant="destructive">মেয়াদ শেষ</Badge>;
    }
    
    if (daysRemaining <= 7) {
      return <Badge variant="destructive">শীঘ্রই শেষ</Badge>;
    }
    
    if (daysRemaining <= 30) {
      return <Badge className="bg-yellow-500">সতর্কতা</Badge>;
    }
    
    return <Badge variant="default">সক্রিয়</Badge>;
  };

  const getDurationText = (duration: string) => {
    switch (duration) {
      case '1month': return '১ মাস';
      case '3month': return '৩ মাস';
      case '6month': return '৬ মাস';
      case 'lifetime': return 'লাইফটাইম';
      default: return duration;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">সাবস্ক্রিপশন দেখতে লগইন করুন।</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">আমার সাবস্ক্রিপশন</h1>
            <p className="text-gray-600">আপনার সব সাবস্ক্রিপশন ও তাদের মেয়াদ দেখুন</p>
          </div>
          <Button onClick={fetchUserSubscriptions} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            রিফ্রেশ
          </Button>
        </div>

        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package size={60} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">কোনো সাবস্ক্রিপশন নেই</h3>
              <p className="text-gray-600">আপনার এখনো কোনো সাবস্ক্রিপশন নেই।</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {subscriptions.map((subscription) => {
              const daysRemaining = getDaysRemaining(subscription.expires_at);
              
              return (
                <Card key={subscription.id} className="relative overflow-hidden">
                  {/* ATM Style Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold">{subscription.product_name}</h3>
                        <p className="text-blue-100">প্যাকেজ: {getDurationText(subscription.package_duration)}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(subscription)}
                        <div className="mt-2 text-sm text-blue-100">
                          ৳{subscription.price}
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Days Remaining - ATM Style Display */}
                      <div className="text-center">
                        <div className="bg-gradient-to-b from-gray-800 to-gray-900 text-green-400 p-4 rounded-lg border-2 border-gray-700 font-mono">
                          <div className="text-2xl font-bold mb-1">
                            {daysRemaining > 0 ? daysRemaining : 0}
                          </div>
                          <div className="text-sm">
                            {daysRemaining > 0 ? 'দিন বাকি' : 'মেয়াদ শেষ'}
                          </div>
                        </div>
                      </div>

                      {/* Subscription Details */}
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <CalendarDays className="mr-2 h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">শুরু:</span>
                          <span className="ml-2 font-medium">
                            {new Date(subscription.starts_at).toLocaleDateString('bn-BD')}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">শেষ:</span>
                          <span className="ml-2 font-medium">
                            {new Date(subscription.expires_at).toLocaleDateString('bn-BD')}
                          </span>
                        </div>
                      </div>

                      {/* Status Information */}
                      <div className="space-y-3">
                        <div className="text-sm">
                          <span className="text-gray-600">অটো রিনিউ:</span>
                          <span className="ml-2 font-medium">
                            {subscription.auto_renew ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">স্ট্যাটাস:</span>
                          <span className="ml-2">
                            {subscription.is_active && daysRemaining > 0 ? (
                              <span className="text-green-600 font-medium">চালু</span>
                            ) : (
                              <span className="text-red-600 font-medium">বন্ধ</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>মেয়াদ অগ্রগতি</span>
                        <span>
                          {daysRemaining > 0 ? `${daysRemaining} দিন বাকি` : 'মেয়াদ শেষ'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            daysRemaining <= 0 ? 'bg-red-500' :
                            daysRemaining <= 7 ? 'bg-red-400' :
                            daysRemaining <= 30 ? 'bg-yellow-400' :
                            'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.max(0, Math.min(100, (daysRemaining / 30) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSubscriptions;
