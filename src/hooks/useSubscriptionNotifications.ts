
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
    if (!user) {
      console.log('useSubscriptionNotifications: No user, skipping');
      return;
    }

    const checkExpiringSubscriptions = async () => {
      try {
        console.log('Checking subscription notifications for user:', user.id);
        
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        // Check for subscriptions expiring in 7 days
        const { data: expiringSubscriptions, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .lte('expires_at', sevenDaysFromNow.toISOString())
          .gte('expires_at', now.toISOString());

        if (error) {
          console.error('Error fetching expiring subscriptions:', error);
          return;
        }

        // Check for expired subscriptions
        const { data: expiredSubscriptions, error: expiredError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .lt('expires_at', now.toISOString());

        if (expiredError) {
          console.error('Error fetching expired subscriptions:', expiredError);
          return;
        }

        console.log('Subscription check results:', {
          expiring: expiringSubscriptions?.length || 0,
          expired: expiredSubscriptions?.length || 0
        });

        // Update counts
        setCounts({
          expiringCount: expiringSubscriptions?.length || 0,
          expiredCount: expiredSubscriptions?.length || 0
        });

        // Show notifications for expiring subscriptions
        if (expiringSubscriptions && expiringSubscriptions.length > 0) {
          for (const subscription of expiringSubscriptions) {
            const expiryDate = new Date(subscription.expires_at);
            const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            // Check if we've already shown this notification
            const { data: existingNotification } = await supabase
              .from('subscription_notifications')
              .select('id')
              .eq('subscription_id', subscription.id)
              .eq('notification_type', 'expiry_warning')
              .maybeSingle();

            if (!existingNotification) {
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
                  sent_at: now.toISOString(),
                }]);
            }
          }
        }

        // Handle expired subscriptions
        if (expiredSubscriptions && expiredSubscriptions.length > 0) {
          for (const subscription of expiredSubscriptions) {
            // Deactivate expired subscription
            await supabase
              .from('user_subscriptions')
              .update({ is_active: false })
              .eq('id', subscription.id);

            // Check if we've already shown expiry notification
            const { data: existingExpiredNotification } = await supabase
              .from('subscription_notifications')
              .select('id')
              .eq('subscription_id', subscription.id)
              .eq('notification_type', 'expired')
              .maybeSingle();

            if (!existingExpiredNotification) {
              toast.error(
                `আপনার ${subscription.product_name} সাবস্ক্রিপশনের মেয়াদ শেষ হয়ে গেছে।`,
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
                  sent_at: now.toISOString(),
                }]);
            }
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
