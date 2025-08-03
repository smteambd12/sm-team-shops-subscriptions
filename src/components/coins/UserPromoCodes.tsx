
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ticket, Copy, CheckCircle, Calendar } from 'lucide-react';
import { useCoins } from '@/hooks/useCoins';
import { toast } from 'sonner';

const UserPromoCodes = () => {
  const { userPromoCodes } = useCoins();

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('প্রোমো কোড কপি হয়েছে!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Ticket className="h-6 w-6 text-green-600" />
          আপনার প্রোমো কোড
        </h2>
        <p className="text-gray-600">কেনা প্রোমো কোডগুলি দেখুন এবং ব্যবহার করুন</p>
      </div>

      {userPromoCodes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">কোনো প্রোমো কোড নেই</h3>
            <p className="text-gray-500">আপনি এখনো কোনো প্রোমো কোড কেনেননি।</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userPromoCodes.map((userPromo) => (
            <Card key={userPromo.id} className={`relative overflow-hidden border-2 ${
              userPromo.is_used ? 'border-gray-200 opacity-75' : 'border-green-200'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Ticket className="h-5 w-5" />
                    {userPromo.purchasable_promo_codes?.title || 'প্রোমো কোড'}
                  </CardTitle>
                  {userPromo.is_used ? (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      ব্যবহৃত
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700">
                      সক্রিয়
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {userPromo.purchasable_promo_codes?.description && (
                  <p className="text-sm text-gray-600">
                    {userPromo.purchasable_promo_codes.description}
                  </p>
                )}

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-mono font-bold text-purple-600">
                      {userPromo.code}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(userPromo.code)}
                      disabled={userPromo.is_used}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">ছাড়:</span>
                    <span className="font-medium">
                      {userPromo.purchasable_promo_codes?.discount_type === 'percentage' 
                        ? `${userPromo.purchasable_promo_codes.discount_value}%`
                        : `৳${userPromo.purchasable_promo_codes?.discount_value}`
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">ক্রয়ের তারিখ:</span>
                    <span className="font-medium">
                      {formatDate(userPromo.purchased_at)}
                    </span>
                  </div>

                  {userPromo.is_used && userPromo.used_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">ব্যবহারের তারিখ:</span>
                      <span className="font-medium">
                        {formatDate(userPromo.used_at)}
                      </span>
                    </div>
                  )}

                  {userPromo.purchasable_promo_codes?.min_order_amount && userPromo.purchasable_promo_codes.min_order_amount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">সর্বনিম্ন অর্ডার:</span>
                      <span className="font-medium">
                        ৳{userPromo.purchasable_promo_codes.min_order_amount}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPromoCodes;
