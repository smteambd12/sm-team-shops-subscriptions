
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
  console.log('SubscriptionNotificationBanner render:', { expiringCount, expiredCount });

  if (expiringCount === 0 && expiredCount === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {expiredCount > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-red-800">
              <strong>মেয়াদ শেষ!</strong> আপনার {expiredCount}টি সাবস্ক্রিপশনের মেয়াদ শেষ হয়ে গেছে।
            </span>
            <Button asChild variant="outline" size="sm" className="text-red-700 border-red-300 hover:bg-red-100">
              <Link to="/">নতুন সাবস্ক্রিপশন নিন</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {expiringCount > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-yellow-800">
              <strong>সতর্কতা!</strong> আপনার {expiringCount}টি সাবস্ক্রিপশন শীঘ্রই শেষ হয়ে যাবে (৭ দিনের মধ্যে)।
            </span>
            <Button asChild variant="outline" size="sm" className="text-yellow-700 border-yellow-300 hover:bg-yellow-100">
              <Link to="/">রিনিউ করুন</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SubscriptionNotificationBanner;
