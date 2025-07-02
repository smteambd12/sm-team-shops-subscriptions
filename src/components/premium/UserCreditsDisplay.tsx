
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Wallet } from 'lucide-react';

interface UserCreditsDisplayProps {
  credits: number;
  loading: boolean;
}

const UserCreditsDisplay: React.FC<UserCreditsDisplayProps> = ({ credits, loading }) => {
  if (loading) {
    return (
      <div className="mb-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <Card className="max-w-md mx-auto bg-gradient-to-r from-green-500 to-blue-500 text-white border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">আপনার ক্রেডিট ব্যালেন্স</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold">{credits.toLocaleString()}</span>
            <Zap className="w-6 h-6 text-yellow-300" />
          </div>
          <p className="text-sm opacity-75 mt-2">
            AI ফিচার ব্যবহার করার জন্য ক্রেডিট প্রয়োজন
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCreditsDisplay;
