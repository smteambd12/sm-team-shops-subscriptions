
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Calendar, Package, Clock, RefreshCw } from 'lucide-react';

interface UserSubscription {
  id: string;
  product_id: string;
  product_name: string;
  package_duration: string;
  price: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  auto_renew: boolean;
  created_at: string;
}

interface UserSubscriptionsProps {
  user: User;
}

const UserSubscriptions: React.FC<UserSubscriptionsProps> = ({ user }) => {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
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

  const getStatusBadge = (subscription: UserSubscription) => {
    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (!subscription.is_active) {
      return <Badge variant="secondary">নিষ্ক্রিয়</Badge>;
    }
    
    if (expiresAt < now) {
      return <Badge variant="destructive">মেয়াদ শেষ</Badge>;
    }
    
    if (daysLeft <= 7) {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">শীঘ্রই শেষ</Badge>;
    }
    
    return <Badge variant="default">সক্রিয়</Badge>;
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'মেয়াদ শেষ';
    if (daysLeft === 0) return 'আজই শেষ';
    if (daysLeft === 1) return '১ দিন বাকি';
    return `${daysLeft} দিন বাকি`;
  };

  const getDurationLabel = (duration: string) => {
    const labels = {
      '1month': '১ মাস',
      '3month': '৩ মাস',
      '6month': '৬ মাস',
      'lifetime': 'আজীবন'
    };
    return labels[duration as keyof typeof labels] || duration;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            আমার সাবস্ক্রিপশন
          </CardTitle>
          <CardDescription>
            আপনার কেনা প্রোডাক্ট ও সেবার তালিকা
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">আপনার কোন সক্রিয় সাবস্ক্রিপশন নেই।</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          আমার সাবস্ক্রিপশন
        </CardTitle>
        <CardDescription>
          আপনার কেনা প্রোডাক্ট ও সেবার তালিকা
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{subscription.product_name}</h3>
                  <p className="text-sm text-gray-600">
                    {getDurationLabel(subscription.package_duration)} • ৳{subscription.price}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(subscription)}
                  {subscription.auto_renew && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      অটো রিনিউ
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <strong>শুরু:</strong> {new Date(subscription.starts_at).toLocaleDateString('bn-BD')}
                  </p>
                  <p className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <strong>শেষ:</strong> {new Date(subscription.expires_at).toLocaleDateString('bn-BD')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p>
                    <strong>অবস্থা:</strong> {subscription.package_duration === 'lifetime' ? 'আজীবন' : getDaysRemaining(subscription.expires_at)}
                  </p>
                  <p>
                    <strong>ক্রয়ের তারিখ:</strong> {new Date(subscription.created_at).toLocaleDateString('bn-BD')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSubscriptions;
