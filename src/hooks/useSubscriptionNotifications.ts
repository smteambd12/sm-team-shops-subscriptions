
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SubscriptionCounts {
  expiringCount: number;
  expiredCount: number;
}

export const useSubscriptionNotifications = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<SubscriptionCounts>({
    expiringCount: 0,
    expiredCount: 0
  });

  useEffect(() => {
    if (!user) return;

    const checkExpiringSubscriptions = async () => {
      try {
        console.log('Checking subscription notifications for user:', user.id);
        
        // Check for subscriptions expiring in 7 days
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const { data: expiringSubscriptions, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .lte('expires_at', sevenDaysFromNow.toISOString())
          .gte('expires_at', new Date().toISOString());

        if (error) {
          console.error('Error fetching expiring subscriptions:', error);
          throw error;
        }

        // Check for expired subscriptions
        const { data: expiredSubscriptions, error: expiredError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .lt('expires_at', new Date().toISOString());

        if (expiredError) {
          console.error('Error fetching expired subscriptions:', expiredError);
          throw expiredError;
        }

        // Update counts
        setCounts({
          expiringCount: expiringSubscriptions?.length || 0,
          expiredCount: expiredSubscriptions?.length || 0
        });

        // Show notifications for new expiring subscriptions
        for (const subscription of expiringSubscriptions || []) {
          const { data: existingNotification } = await supabase
            .from('subscription_notifications')
            .select('id')
            .eq('subscription_id', subscription.id)
            .eq('notification_type', 'expiry_warning')
            .single();

          if (!existingNotification) {
            const expiryDate = new Date(subscription.expires_at);
            const daysLeft = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            toast.warning(
              `আপনার ${subscription.product_name} সাবস্ক্রিপশন ${daysLeft} দিনের মধ্যে শেষ হয়ে যাবে।`,
              {
                duration: 10000,
                action: {
                  label: 'রিনিউ করুন',
                  onClick: () => {
                    window.location.href = '/subscriptions';
                  },
                },
              }
            );

            // Record the notification
            await supabase
              .from('subscription_notifications')
              .insert([{
                subscription_id: subscription.id,
                notification_type: 'expiry_warning',
                sent_at: new Date().toISOString(),
              }]);
          }
        }

        // Deactivate and notify expired subscriptions
        for (const subscription of expiredSubscriptions || []) {
          await supabase
            .from('user_subscriptions')
            .update({ is_active: false })
            .eq('id', subscription.id);

          const { data: existingExpiredNotification } = await supabase
            .from('subscription_notifications')
            .select('id')
            .eq('subscription_id', subscription.id)
            .eq('notification_type', 'expired')
            .single();

          if (!existingExpiredNotification) {
            toast.error(
              `আপনার ${subscription.product_name} সাবস্ক্রিপশন মেয়াদ শেষ হয়ে গেছে।`,
              {
                duration: 15000,
                action: {
                  label: 'রিনিউ করুন',
                  onClick: () => {
                    window.location.href = '/subscriptions';
                  },
                },
              }
            );

            await supabase
              .from('subscription_notifications')
              .insert([{
                subscription_id: subscription.id,
                notification_type: 'expired',
                sent_at: new Date().toISOString(),
              }]);
          }
        }
      } catch (error) {
        console.error('Error checking subscription notifications:', error);
      }
    };

    // Check immediately
    checkExpiringSubscriptions();

    // Set up interval to check every hour
    const interval = setInterval(checkExpiringSubscriptions, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return counts;
};
