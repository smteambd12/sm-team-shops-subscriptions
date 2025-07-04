
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search } from 'lucide-react';

interface OrderFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  onResetFilters: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  onResetFilters
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          উন্নত ফিল্টার ও সার্চ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">সার্চ করুন</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="নাম, ইমেইল, ফোন, প্রোডাক্ট..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status-filter">স্ট্যাটাস ফিল্টার</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সমস্ত স্ট্যাটাস</SelectItem>
                <SelectItem value="pending">অপেক্ষমান</SelectItem>
                <SelectItem value="confirmed">নিশ্চিত</SelectItem>
                <SelectItem value="processing">প্রক্রিয়াধীন</SelectItem>
                <SelectItem value="shipped">পাঠানো হয়েছে</SelectItem>
                <SelectItem value="delivered">ডেলিভার হয়েছে</SelectItem>
                <SelectItem value="cancelled">বাতিল</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date-filter">তারিখ ফিল্টার</Label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সকল তারিখ</SelectItem>
                <SelectItem value="today">আজকের</SelectItem>
                <SelectItem value="week">গত ৭ দিন</SelectItem>
                <SelectItem value="month">গত ৩০ দিন</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={onResetFilters}
              variant="outline"
              className="w-full"
            >
              ফিল্টার রিসেট
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderFilters;
