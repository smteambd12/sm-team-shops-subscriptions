
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewSubscriptionBanner = () => {
  return (
    <Card className="bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200 mb-8">
      <CardContent className="py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-500 p-3 rounded-full">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                নতুন সাবস্ক্রিপশন ও অ্যাপস
              </h3>
              <p className="text-gray-600">
                সর্বশেষ প্রিমিয়াম সাবস্ক্রিপশন ও অ্যাপস দেখুন এবং সেরা দামে কিনুন
              </p>
            </div>
          </div>
          <Link to="/categories">
            <Button className="bg-purple-600 hover:bg-purple-700">
              দেখুন
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewSubscriptionBanner;
