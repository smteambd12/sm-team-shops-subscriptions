
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, X, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ExpiringSubscription {
  id: string;
  product_name: string;
  expires_at: string;
  package_duration: string;
  price: number;
  days_remaining: number;
}

const SubscriptionExpiryNotification = () => {
  const { user } = useAuth();
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<ExpiringSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchExpiringSubscriptions();
    }
  }, [user]);

  const fetchExpiringSubscriptions = async () => {
    try {
      const { data: subscriptions, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .lte('expires_at', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const expiring = (subscriptions || []).map(sub => {
        const expiresAt = new Date(sub.expires_at);
        const now = new Date();
        const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...sub,
          days_remaining: daysRemaining
        };
      }).filter(sub => sub.days_remaining <= 30 && sub.days_remaining > 0);

      setExpiringSubscriptions(expiring);
    } catch (error) {
      console.error('Error fetching expiring subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (subscriptionId: string) => {
    setDismissed(prev => [...prev, subscriptionId]);
  };

  const visibleNotifications = expiringSubscriptions.filter(
    sub => !dismissed.includes(sub.id)
  );

  if (loading || visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleNotifications.map((subscription) => (
        <Card key={subscription.id} className="border-l-4 border-l-orange-500 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-800 mb-1">
                    সাবস্ক্রিপশন শীঘ্রই শেষ হবে
                  </h4>
                  <p className="text-sm text-orange-700 mb-2">
                    <strong>{subscription.product_name}</strong> এর সাবস্ক্রিপশন{' '}
                    <Badge 
                      variant={subscription.days_remaining <= 7 ? "destructive" : "secondary"}
                      className="mx-1"
                    >
                      {subscription.days_remaining} দিন বাকি
                    </Badge>
                  </p>
                  <div className="flex items-center gap-4 text-xs text-orange-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(subscription.expires_at).toLocaleDateString('bn-BD')} এ শেষ
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {subscription.package_duration}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-orange-700 border-orange-300 hover:bg-orange-100"
                  onClick={() => window.location.href = '/'}
                >
                  নবায়ন করুন
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(subscription.id)}
                  className="text-orange-600 hover:bg-orange-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SubscriptionExpiryNotification;
