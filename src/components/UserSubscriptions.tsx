
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Package, RefreshCw, Settings, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  product_id: string;
  product_name: string;
  package_duration: string;
  price: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  auto_renew: boolean;
  order_id: string;
}

const UserSubscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
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
      toast.error('সাবস্ক্রিপশন লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
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

  const getStatusBadge = (subscription: Subscription) => {
    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    const isExpired = now > expiresAt;
    
    if (!subscription.is_active || isExpired) {
      return <Badge variant="destructive">মেয়াদ শেষ</Badge>;
    }
    
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 7) {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">শীঘ্রই শেষ</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-600">সক্রিয়</Badge>;
  };

  const getRemainingDays = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const getProductImage = (productId: string) => {
    // Default product images based on common services
    const images: { [key: string]: string } = {
      'netflix': '/lovable-uploads/4b4eb95d-25d0-46d7-8b98-706dba898e03.png',
      'spotify': 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=100&h=100&fit=crop',
      'youtube': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop',
      'default': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop'
    };
    
    return images[productId.toLowerCase()] || images.default;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">সাবস্ক্রিপশন দেখতে প্রথমে লগইন করুন।</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">আমার সাবস্ক্রিপশন</h1>
          <p className="text-gray-600 mt-2">আপনার সক্রিয় সাবস্ক্রিপশনসমূহ দেখুন এবং পরিচালনা করুন</p>
        </div>
        <Button onClick={fetchSubscriptions} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          রিফ্রেশ
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">কোন সাবস্ক্রিপশন নেই</h3>
            <p className="text-gray-600 mb-6">আপনার এখনো কোন সক্রিয় সাবস্ক্রিপশন নেই।</p>
            <Button asChild>
              <a href="/">পণ্য দেখুন</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => {
            const remainingDays = getRemainingDays(subscription.expires_at);
            const isExpired = remainingDays <= 0;
            
            return (
              <Card key={subscription.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${isExpired ? 'opacity-75' : ''}`}>
                <div className="absolute top-0 right-0 p-4">
                  {getStatusBadge(subscription)}
                </div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={getProductImage(subscription.product_id)}
                        alt={subscription.product_name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                      />
                      {subscription.is_active && !isExpired && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{subscription.product_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {getDurationText(subscription.package_duration)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-gray-600">শুরু</p>
                        <p className="font-medium">
                          {new Date(subscription.starts_at).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-gray-600">শেষ</p>
                        <p className="font-medium">
                          {new Date(subscription.expires_at).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">মূল্য</span>
                      <span className="font-bold text-lg">৳{subscription.price.toLocaleString()}</span>
                    </div>
                    {!isExpired && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">অবশিষ্ট দিন</span>
                        <span className={`font-medium ${remainingDays <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                          {remainingDays} দিন
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      disabled={isExpired}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      পরিচালনা
                    </Button>
                    {subscription.package_duration !== 'lifetime' && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        disabled={isExpired}
                      >
                        রিনিউ করুন
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserSubscriptions;
