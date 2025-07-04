
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  Package, 
  XCircle 
} from 'lucide-react';

export const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { label: 'অপেক্ষমান', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
    confirmed: { label: 'নিশ্চিত', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
    processing: { label: 'প্রক্রিয়াধীন', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: RefreshCw },
    shipped: { label: 'পাঠানো হয়েছে', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Package },
    delivered: { label: 'ডেলিভার হয়েছে', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
    cancelled: { label: 'বাতিল', color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge className={`flex items-center gap-1 px-3 py-1 ${config.color} font-semibold text-sm border`}>
      <Icon size={14} />
      {config.label}
    </Badge>
  );
};

export const getStatusLabel = (status: string) => {
  const labels = {
    pending: 'অপেক্ষমান',
    confirmed: 'নিশ্চিত',
    processing: 'প্রক্রিয়াধীন',
    shipped: 'পাঠানো হয়েছে',
    delivered: 'ডেলিভার হয়েছে',
    cancelled: 'বাতিল'
  };
  return labels[status as keyof typeof labels] || status;
};

export const getDurationLabel = (duration: string) => {
  const labels = {
    '1month': '১ মাস',
    '3month': '৩ মাস', 
    '6month': '৬ মাস',
    'lifetime': 'লাইফটাইম'
  };
  return labels[duration as keyof typeof labels] || duration;
};

export const getPaymentMethodLabel = (method: string) => {
  const methods = {
    'bkash': 'বিকাশ',
    'nagad': 'নগদ',
    'rocket': 'রকেট',
    'card': 'কার্ড',
    'bank': 'ব্যাংক ট্রান্সফার'
  };
  return methods[method as keyof typeof methods] || method;
};

export const getCategoryLabel = (category: string) => {
  const categories = {
    'web': 'ওয়েব অ্যাপ্লিকেশন',
    'mobile': 'মোবাইল অ্যাপ',
    'tutorial': 'টিউটোরিয়াল'
  };
  return categories[category as keyof typeof categories] || category;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount: number) => {
  return `৳${amount.toLocaleString('bn-BD')}`;
};
