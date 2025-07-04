
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
import { Calendar, Package, Clock, Download, ExternalLink, FileText, RefreshCw, AlertTriangle, ShoppingCart, DollarSign, User, Mail, Phone, MapPin, CreditCard } from 'lucide-react';

interface UserSubscription {
  id: string;
  user_id: string;
  product_id: string;
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
  order_id?: string;
  // Order details from join
  order?: {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    total_amount: number;
    payment_method: string;
    transaction_id?: string;
    promo_code?: string;
    discount_amount: number;
    status: string;
    created_at: string;
  };
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
        .select(`
          *,
          orders:order_id (
            id,
            customer_name,
            customer_email,
            customer_phone,
            customer_address,
            total_amount,
            payment_method,
            transaction_id,
            promo_code,
            discount_amount,
            status,
            created_at
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        throw error;
      }
      
      console.log('Subscriptions fetched:', data);
      
      // Process the data to ensure proper structure
      const processedSubscriptions = (data || []).map(sub => ({
        ...sub,
        order: sub.orders && typeof sub.orders === 'object' && !Array.isArray(sub.orders) 
          ? sub.orders 
          : null
      }));
      
      setSubscriptions(processedSubscriptions);
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

  const getDurationLabel = (duration: string) => {
    const labels = {
      '1month': '১ মাস',
      '3month': '৩ মাস', 
      '6month': '৬ মাস',
      'lifetime': 'লাইফটাইম'
    };
    return labels[duration as keyof typeof labels] || duration;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      'bkash': 'বিকাশ',
      'nagad': 'নগদ',
      'rocket': 'রকেট',
      'card': 'কার্ড',
      'bank': 'ব্যাংক ট্রান্সফার'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('bn-BD')}`;
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

  const handleRefresh = () => {
    fetchSubscriptions();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-72"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
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
          <p className="text-gray-600">আপনার সব সাবস্ক্রিপশন এবং অর্ডার বিস্তারিত এখানে দেখুন।</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          রিফ্রেশ
        </Button>
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
            <p className="text-gray-600 mb-4">আপনার এখনো কোন সক্রিয় সাবস্ক্রিপশন নেই।</p>
            <Button onClick={() => window.location.href = '/'}>
              নতুন সাবস্ক্রিপশন দেখুন
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {subscriptions.map((subscription) => {
            const now = new Date();
            const expiresAt = new Date(subscription.expires_at);
            const isExpired = expiresAt < now;
            const isExpiringSoon = !isExpired && expiresAt.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000;

            return (
              <Card 
                key={subscription.id} 
                className={`hover:shadow-lg transition-all duration-300 ${
                  isExpired ? 'border-red-200 bg-red-50' : 
                  isExpiringSoon ? 'border-yellow-200 bg-yellow-50' : 
                  'border-blue-200 hover:border-blue-300'
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Package className="h-6 w-6 text-blue-600" />
                        {subscription.product_name}
                        {isExpired && (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2 text-base">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-blue-600" />
                            প্যাকেজ মেয়াদ: {getDurationLabel(subscription.package_duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            মূল্য: {formatCurrency(subscription.price)}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {getStatusBadge(subscription)}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getRemainingDays(subscription.expires_at)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Subscription Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <div>
                          <span className="text-sm font-medium text-blue-800">শুরুর তারিখ</span>
                          <p className="text-blue-700">{new Date(subscription.starts_at).toLocaleDateString('bn-BD')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <div>
                          <span className="text-sm font-medium text-purple-800">শেষের তারিখ</span>
                          <p className="text-purple-700">{new Date(subscription.expires_at).toLocaleDateString('bn-BD')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-green-800">অটো রিনিউ:</span>
                        <p className="text-green-700">{subscription.auto_renew ? 'হ্যাঁ' : 'না'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-800">স্ট্যাটাস:</span>
                        <p className="text-gray-700">{subscription.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details (if available) */}
                  {subscription.order && (
                    <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-indigo-800">
                          <ShoppingCart className="h-5 w-5" />
                          অর্ডার বিস্তারিত (#{subscription.order.id.slice(0, 8)})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm">
                              <User className="h-4 w-4 text-blue-600" />
                              <div>
                                <span className="text-sm text-gray-600">গ্রাহকের নাম:</span>
                                <p className="font-semibold text-gray-800">{subscription.order.customer_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm">
                              <Mail className="h-4 w-4 text-blue-600" />
                              <div>
                                <span className="text-sm text-gray-600">ইমেইল:</span>
                                <p className="font-semibold text-gray-800">{subscription.order.customer_email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm">
                              <Phone className="h-4 w-4 text-blue-600" />
                              <div>
                                <span className="text-sm text-gray-600">ফোন:</span>
                                <p className="font-semibold text-gray-800">{subscription.order.customer_phone}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start gap-2 p-3 bg-white rounded-lg shadow-sm">
                              <MapPin className="h-4 w-4 text-blue-600 mt-1" />
                              <div>
                                <span className="text-sm text-gray-600">ঠিকানা:</span>
                                <p className="font-semibold text-gray-800">{subscription.order.customer_address}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm">
                              <CreditCard className="h-4 w-4 text-green-600" />
                              <div>
                                <span className="text-sm text-gray-600">পেমেন্ট মাধ্যম:</span>
                                <p className="font-semibold text-gray-800">{getPaymentMethodLabel(subscription.order.payment_method)}</p>
                              </div>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-lg border border-green-300">
                              <span className="text-sm text-green-700">মোট পরিমাণ:</span>
                              <p className="font-bold text-lg text-green-800">{formatCurrency(subscription.order.total_amount)}</p>
                            </div>
                          </div>
                        </div>

                        {subscription.order.transaction_id && (
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <span className="text-sm font-medium text-yellow-800">ট্রানজেকশন ID:</span>
                            <p className="font-mono text-sm bg-white px-2 py-1 rounded border mt-1">{subscription.order.transaction_id}</p>
                          </div>
                        )}

                        {subscription.order.promo_code && (
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <span className="text-purple-700 font-medium">প্রোমো কোড: {subscription.order.promo_code}</span>
                            <span className="text-purple-700 font-bold">ছাড়: {formatCurrency(subscription.order.discount_amount)}</span>
                          </div>
                        )}

                        <div className="text-center text-sm text-gray-600 bg-white p-2 rounded border">
                          অর্ডার তারিখ: {new Date(subscription.order.created_at).toLocaleDateString('bn-BD')}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* File and Link Access */}
                  {(subscription.subscription_file_url || subscription.subscription_link) && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        সাবস্ক্রিপশন অ্যাক্সেস
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {subscription.subscription_file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileDownload(subscription.subscription_file_url!, subscription.file_name)}
                            className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-100"
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
                            className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-100"
                          >
                            <ExternalLink className="h-4 w-4" />
                            সাবস্ক্রিপশন লিংক
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show message if no access files/links are available but subscription is active */}
                  {!subscription.subscription_file_url && !subscription.subscription_link && subscription.is_active && !isExpired && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        আপনার সাবস্ক্রিপশন অ্যাক্সেস ফাইল/লিংক এখনো প্রস্তুত হয়নি। অনুগ্রহ করে অপেক্ষা করুন বা সাপোর্টের সাথে যোগাযোগ করুন।
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Show renewal message for expired subscriptions */}
                  {isExpired && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        এই সাবস্ক্রিপশনের মেয়াদ শেষ হয়ে গেছে। নতুন করে সাবস্ক্রিপশন নিতে হোমপেজে যান।
                      </AlertDescription>
                    </Alert>
                  )}
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
