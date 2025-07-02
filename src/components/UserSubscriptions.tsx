
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionNotifications } from '@/hooks/useSubscriptionNotifications';
import SubscriptionNotificationBanner from '@/components/notifications/SubscriptionNotificationBanner';
import { Calendar, Package, Clock, Download, ExternalLink, FileText } from 'lucide-react';

interface UserSubscription {
  id: string;
  product_name: string;
  package_duration: string;
  price: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  auto_renew: boolean;
  subscription_file_url?: string;
  subscription_link?: string;
  file_name?: string;
  created_at: string;
}

const UserSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const notificationCounts = useSubscriptionNotifications();

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      console.log('Fetching subscriptions for user:', user?.id);
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        throw error;
      }
      
      console.log('Subscriptions fetched:', data);
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
    
    if (!subscription.is_active) {
      return <Badge variant="secondary">নিষ্ক্রিয়</Badge>;
    }
    
    if (expiresAt < now) {
      return <Badge variant="destructive">মেয়াদ শেষ</Badge>;
    }
    
    const timeDiff = expiresAt.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff <= 7) {
      return <Badge variant="destructive">শীঘ্রই শেষ</Badge>;
    }
    
    return <Badge variant="default">সক্রিয়</Badge>;
  };

  const getRemainingDays = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const timeDiff = expiry.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return 'মেয়াদ শেষ';
    if (daysDiff === 0) return 'আজই শেষ';
    if (daysDiff === 1) return '১ দিন বাকি';
    return `${daysDiff} দিন বাকি`;
  };

  const handleFileDownload = (url: string, fileName?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'subscription-file';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">আমার সাবস্ক্রিপশন</h2>
          <p className="text-gray-600">আপনার সব সাবস্ক্রিপশন এখানে দেখুন।</p>
        </div>
      </div>

      {/* Notification Banner */}
      <SubscriptionNotificationBanner 
        expiringCount={notificationCounts.expiringCount}
        expiredCount={notificationCounts.expiredCount}
      />

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">কোন সাবস্ক্রিপশন নেই</h3>
            <p className="text-gray-600">আপনার এখনো কোন সক্রিয় সাবস্ক্রিপশন নেই।</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {subscription.product_name}
                    </CardTitle>
                    <CardDescription>
                      প্যাকেজ: {subscription.package_duration}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(subscription)}
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getRemainingDays(subscription.expires_at)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm"><strong>মূল্য:</strong> ৳{subscription.price}</p>
                    <p className="text-sm"><strong>শুরু:</strong> {new Date(subscription.starts_at).toLocaleDateString('bn-BD')}</p>
                    <p className="text-sm"><strong>শেষ:</strong> {new Date(subscription.expires_at).toLocaleDateString('bn-BD')}</p>
                  </div>
                  <div>
                    <p className="text-sm"><strong>অটো রিনিউ:</strong> {subscription.auto_renew ? 'হ্যাঁ' : 'না'}</p>
                    <p className="text-sm"><strong>স্ট্যাটাস:</strong> {subscription.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</p>
                  </div>
                </div>

                {/* File and Link Access */}
                {(subscription.subscription_file_url || subscription.subscription_link) && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      সাবস্ক্রিপশন অ্যাক্সেস
                    </h4>
                    <div className="space-y-2">
                      {subscription.subscription_file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFileDownload(subscription.subscription_file_url!, subscription.file_name)}
                          className="flex items-center gap-2 mr-2"
                        >
                          <FileText className="h-4 w-4" />
                          {subscription.file_name || 'ফাইল ডাউনলোড'}
                        </Button>
                      )}
                      {subscription.subscription_link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(subscription.subscription_link, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          সাবস্ক্রিপশন লিংক
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Show message if no access files/links are available */}
                {!subscription.subscription_file_url && !subscription.subscription_link && subscription.is_active && (
                  <Alert>
                    <AlertDescription>
                      আপনার সাবস্ক্রিপশন অ্যাক্সেস ফাইল/লিংক এখনো প্রস্তুত হয়নি। অনুগ্রহ করে অপেক্ষা করুন।
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSubscriptions;
