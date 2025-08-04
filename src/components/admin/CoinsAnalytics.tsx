
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Coins, TrendingUp, Users, Trophy, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CoinStats {
  totalCoinsAwarded: number;
  totalCoinsSpent: number;
  activeUsers: number;
  totalAchievements: number;
}

interface TransactionData {
  date: string;
  earned: number;
  spent: number;
}

interface SourceData {
  source: string;
  amount: number;
  color: string;
}

const CoinsAnalytics = () => {
  const [stats, setStats] = useState<CoinStats>({
    totalCoinsAwarded: 0,
    totalCoinsSpent: 0,
    activeUsers: 0,
    totalAchievements: 0
  });
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);
  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch basic stats
      const [coinsResult, usersResult, achievementsResult, transactionsResult] = await Promise.all([
        supabase.from('user_coins').select('total_coins, earned_coins, spent_coins'),
        supabase.from('user_coins').select('user_id'),
        supabase.from('user_achievements').select('id'),
        supabase.from('coin_transactions').select('amount, transaction_type, source, created_at').order('created_at', { ascending: false }).limit(100)
      ]);

      // Calculate stats
      const totalCoinsAwarded = coinsResult.data?.reduce((sum, user) => sum + user.earned_coins, 0) || 0;
      const totalCoinsSpent = coinsResult.data?.reduce((sum, user) => sum + user.spent_coins, 0) || 0;
      const activeUsers = usersResult.data?.length || 0;
      const totalAchievements = achievementsResult.data?.length || 0;

      setStats({
        totalCoinsAwarded,
        totalCoinsSpent,
        activeUsers,
        totalAchievements
      });

      // Process transaction data for charts
      if (transactionsResult.data) {
        const dailyData: { [key: string]: { earned: number; spent: number } } = {};
        const sourceAmounts: { [key: string]: number } = {};

        transactionsResult.data.forEach(transaction => {
          const date = new Date(transaction.created_at).toLocaleDateString('en-CA');
          
          if (!dailyData[date]) {
            dailyData[date] = { earned: 0, spent: 0 };
          }

          if (transaction.transaction_type === 'earned') {
            dailyData[date].earned += transaction.amount;
            sourceAmounts[transaction.source] = (sourceAmounts[transaction.source] || 0) + transaction.amount;
          } else if (transaction.transaction_type === 'spent') {
            dailyData[date].spent += Math.abs(transaction.amount);
          }
        });

        // Convert to chart format
        const chartData = Object.entries(dailyData)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-7) // Last 7 days
          .map(([date, values]) => ({
            date: new Date(date).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' }),
            ...values
          }));

        setTransactionData(chartData);

        // Source data for pie chart
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];
        const sourceChartData = Object.entries(sourceAmounts)
          .map(([source, amount], index) => ({
            source: source === 'order_confirmed' ? 'অর্ডার কনফার্ম' : 
                   source === 'promo_purchase' ? 'প্রোমো কিনেছেন' : source,
            amount,
            color: colors[index % colors.length]
          }));

        setSourceData(sourceChartData);
      }

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Coins className="h-6 w-6 text-yellow-600" />
        <h2 className="text-2xl font-bold">কয়েন সিস্টেম অ্যানালিটিক্স</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 mb-1">মোট কয়েন বিতরণ</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.totalCoinsAwarded.toLocaleString()}</p>
              </div>
              <Coins className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 mb-1">মোট কয়েন খরচ</p>
                <p className="text-2xl font-bold text-red-800">{stats.totalCoinsSpent.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 mb-1">সক্রিয় ব্যবহারকারী</p>
                <p className="text-2xl font-bold text-blue-800">{stats.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 mb-1">মোট অর্জন</p>
                <p className="text-2xl font-bold text-purple-800">{stats.totalAchievements}</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              দৈনিক কয়েন কার্যক্রম (শেষ ৭ দিন)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="earned" fill="#82ca9d" name="অর্জিত" />
                <Bar dataKey="spent" fill="#ff7c7c" name="খরচ" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>কয়েনের উৎস</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ source, amount }) => `${source}: ${amount}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoinsAnalytics;
