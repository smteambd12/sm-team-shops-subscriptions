
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

        // Check for subscriptions expiring in 7 days (but not yet expired)
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

        // Check for expired subscriptions (still marked as active)
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

        // Auto-deactivate expired subscriptions
        if (expiredSubscriptions && expiredSubscriptions.length > 0) {
          for (const subscription of expiredSubscriptions) {
            await supabase
              .from('user_subscriptions')
              .update({ is_active: false })
              .eq('id', subscription.id);

            console.log('Deactivated expired subscription:', subscription.id);
          }
        }
      } catch (error) {
        console.error('Error checking subscription notifications:', error);
      }
    };

    // Check immediately
    checkExpiringSubscriptions();

    // Set up interval to check every 30 minutes instead of every hour
    const interval = setInterval(checkExpiringSubscriptions, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return counts;
};
