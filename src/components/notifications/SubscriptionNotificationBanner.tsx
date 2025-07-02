
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bell, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotificationBannerProps {
  expiringCount: number;
  expiredCount: number;
}

const SubscriptionNotificationBanner: React.FC<NotificationBannerProps> = ({
  expiringCount,
  expiredCount
}) => {
  if (expiringCount === 0 && expiredCount === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {expiredCount > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-red-800">
              আপনার {expiredCount}টি সাবস্ক্রিপশনের মেয়াদ শেষ হয়ে গেছে।
            </span>
            <Button asChild variant="outline" size="sm">
              <Link to="/subscriptions">রিনিউ করুন</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {expiringCount > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-yellow-800">
              আপনার {expiringCount}টি সাবস্ক্রিপশন শীঘ্রই শেষ হয়ে যাবে।
            </span>
            <Button asChild variant="outline" size="sm">
              <Link to="/subscriptions">দেখুন</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SubscriptionNotificationBanner;
