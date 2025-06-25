
import { Product } from '../types';

export const products: Product[] = [
  // Web Subscriptions
  {
    id: 'netflix-sub',
    name: 'Netflix Premium',
    description: '4K স্ট্রিমিং, ৪টি ডিভাইসে একসাথে দেখুন',
    category: 'web',
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop',
    features: ['4K Ultra HD', '৪টি স্ক্রিন', 'ডাউনলোড সুবিধা', 'সব কন্টেন্ট'],
    packages: [
      { id: 'nf-1m', duration: '1month', price: 350, originalPrice: 500, discount: 30 },
      { id: 'nf-3m', duration: '3month', price: 900, originalPrice: 1500, discount: 40 },
      { id: 'nf-6m', duration: '6month', price: 1600, originalPrice: 3000, discount: 47 },
      { id: 'nf-life', duration: 'lifetime', price: 2500, originalPrice: 5000, discount: 50 }
    ]
  },
  {
    id: 'spotify-sub',
    name: 'Spotify Premium',
    description: 'অ্যাড ফ্রি মিউজিক, অফলাইন ডাউনলোড',
    category: 'web',
    image: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&h=300&fit=crop',
    features: ['অ্যাড ফ্রি', 'অফলাইন ডাউনলোড', 'উন্নত অডিও', 'সব গান'],
    packages: [
      { id: 'sp-1m', duration: '1month', price: 200, originalPrice: 300, discount: 33 },
      { id: 'sp-3m', duration: '3month', price: 550, originalPrice: 900, discount: 39 },
      { id: 'sp-6m', duration: '6month', price: 1000, originalPrice: 1800, discount: 44 },
      { id: 'sp-life', duration: 'lifetime', price: 1800, originalPrice: 3600, discount: 50 }
    ]
  },
  {
    id: 'canva-sub',
    name: 'Canva Pro',
    description: 'প্রো টেমপ্লেট, ব্যাকগ্রাউন্ড রিমুভার',
    category: 'web',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    features: ['প্রো টেমপ্লেট', 'ব্যাকগ্রাউন্ড রিমুভার', 'ব্র্যান্ড কিট', 'টিম ফিচার'],
    packages: [
      { id: 'cv-1m', duration: '1month', price: 400, originalPrice: 600, discount: 33 },
      { id: 'cv-3m', duration: '3month', price: 1100, originalPrice: 1800, discount: 39 },
      { id: 'cv-6m', duration: '6month', price: 2000, originalPrice: 3600, discount: 44 },
      { id: 'cv-life', duration: 'lifetime', price: 3500, originalPrice: 7200, discount: 51 }
    ]
  },
  // Mobile Apps
  {
    id: 'kinemaster-sub',
    name: 'KineMaster Pro',
    description: 'প্রো ভিডিও এডিটিং, ওয়াটারমার্ক ফ্রি',
    category: 'mobile',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop',
    features: ['ওয়াটারমার্ক ফ্রি', 'প্রো এফেক্ট', '4K এক্সপোর্ট', 'সব ফিচার'],
    packages: [
      { id: 'km-1m', duration: '1month', price: 300, originalPrice: 450, discount: 33 },
      { id: 'km-3m', duration: '3month', price: 800, originalPrice: 1350, discount: 41 },
      { id: 'km-6m', duration: '6month', price: 1400, originalPrice: 2700, discount: 48 },
      { id: 'km-life', duration: 'lifetime', price: 2200, originalPrice: 4500, discount: 51 }
    ]
  },
  {
    id: 'capcut-sub',
    name: 'CapCut Pro',
    description: 'এআই পাওয়ার্ড ভিডিও এডিটিং',
    category: 'mobile',
    image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=300&fit=crop',
    features: ['এআই এডিটিং', 'প্রো টেমপ্লেট', 'ক্লাউড স্টোরেজ', 'HD এক্সপোর্ট'],
    packages: [
      { id: 'cc-1m', duration: '1month', price: 250, originalPrice: 400, discount: 38 },
      { id: 'cc-3m', duration: '3month', price: 650, originalPrice: 1200, discount: 46 },
      { id: 'cc-6m', duration: '6month', price: 1200, originalPrice: 2400, discount: 50 },
      { id: 'cc-life', duration: 'lifetime', price: 2000, originalPrice: 4000, discount: 50 }
    ]
  },
  // Tutorials
  {
    id: 'web-dev-course',
    name: 'ওয়েব ডেভেলপমেন্ট কোর্স',
    description: 'সম্পূর্ণ ওয়েব ডেভেলপমেন্ট শিখুন',
    category: 'tutorial',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
    features: ['HTML/CSS/JS', 'React/Node.js', 'প্রজেক্ট বেসড', 'লাইভ সাপোর্ট'],
    packages: [
      { id: 'wd-1m', duration: '1month', price: 1500, originalPrice: 2500, discount: 40 },
      { id: 'wd-3m', duration: '3month', price: 3500, originalPrice: 6000, discount: 42 },
      { id: 'wd-6m', duration: '6month', price: 6000, originalPrice: 12000, discount: 50 },
      { id: 'wd-life', duration: 'lifetime', price: 8000, originalPrice: 15000, discount: 47 }
    ]
  }
];

export const paymentMethods = [
  {
    name: 'bkash' as const,
    displayName: 'বিকাশ',
    number: '01712345678',
    icon: '💰'
  },
  {
    name: 'nagad' as const,
    displayName: 'নগদ',
    number: '01812345678',
    icon: '💳'
  },
  {
    name: 'rocket' as const,
    displayName: 'রকেট',
    number: '01912345678',
    icon: '🚀'
  }
];

export const promoCodes = [
  { code: 'WELCOME20', discount: 20, description: '২০% ছাড়' },
  { code: 'FIRST50', discount: 50, description: '৫০ টাকা ছাড়' },
  { code: 'SAVE100', discount: 100, description: '১০০ টাকা ছাড়' }
];
