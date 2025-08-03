
import React from 'react';
import { Coins, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCoins } from '@/hooks/useCoins';

const CoinBalance = () => {
  const { coins } = useCoins();

  if (!coins) {
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-full">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-yellow-700">কয়েন ব্যালেন্স</p>
              <p className="text-xl font-bold text-yellow-800">০ কয়েন</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Coins className="h-5 w-5" />
          আপনার কয়েন
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-yellow-700">মোট কয়েন:</span>
            <span className="text-lg font-bold text-yellow-800">{coins.total_coins}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-yellow-600">অর্জিত:</span>
            <span className="text-sm font-medium text-green-600">+{coins.earned_coins}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-yellow-600">খরচ:</span>
            <span className="text-sm font-medium text-red-600">-{coins.spent_coins}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoinBalance;
