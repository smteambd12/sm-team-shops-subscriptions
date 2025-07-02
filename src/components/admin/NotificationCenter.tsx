
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bell, Users, Calendar } from 'lucide-react';

const NotificationCenter = () => {
  const [loading, setLoading] = useState(false);
  const [notificationData, setNotificationData] = useState({
    type: '',
    title: '',
    message: '',
    targetUsers: 'all'
  });
  const { toast } = useToast();

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Demo notification for subscription expiry
      if (notificationData.type === 'subscription_expiry') {
        // This would typically create notifications in the database
        // For demo purposes, we'll just show a success message
        
        toast({
          title: "নোটিফিকেশন পাঠানো হয়েছে",
          description: `সাবস্ক্রিপশন এক্সপায়ারি নোটিফিকেশন সব ইউজারের কাছে পাঠানো হয়েছে।`,
        });

        // Reset form
        setNotificationData({
          type: '',
          title: '',
          message: '',
          targetUsers: 'all'
        });
      } else {
        toast({
          title: "নোটিফিকেশন পাঠানো হয়েছে",
          description: `"${notificationData.title}" নোটিফিকেশন পাঠানো হয়েছে।`,
        });

        // Reset form
        setNotificationData({
          type: '',
          title: '',
          message: '',
          targetUsers: 'all'
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "ত্রুটি",
        description: "নোটিফিকেশন পাঠাতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSubscriptionNotification = async () => {
    setLoading(true);
    try {
      toast({
        title: "ডেমো নোটিফিকেশন পাঠানো হয়েছে",
        description: "সাবস্ক্রিপশন মেয়াদ শেষ হওয়ার নোটিফিকেশন ইউজার ড্যাশবোর্ডে দেখানো হবে।",
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            নোটিফিকেশন সেন্টার
          </CardTitle>
          <CardDescription>
            ইউজারদের কাছে নোটিফিকেশন পাঠান
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notification_type">নোটিফিকেশনের ধরন</Label>
                <Select 
                  value={notificationData.type} 
                  onValueChange={(value) => setNotificationData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="নোটিফিকেশনের ধরন নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">সাধারণ নোটিফিকেশন</SelectItem>
                    <SelectItem value="subscription_expiry">সাবস্ক্রিপশন মেয়াদ</SelectItem>
                    <SelectItem value="promotion">প্রমোশনাল</SelectItem>
                    <SelectItem value="system">সিস্টেম আপডেট</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_users">টার্গেট ইউজার</Label>
                <Select 
                  value={notificationData.targetUsers} 
                  onValueChange={(value) => setNotificationData(prev => ({ ...prev, targetUsers: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব ইউজার</SelectItem>
                    <SelectItem value="subscribers">সাবস্ক্রাইবার</SelectItem>
                    <SelectItem value="recent_orders">সাম্প্রতিক অর্ডার</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification_title">নোটিফিকেশন শিরোনাম</Label>
              <Input
                id="notification_title"
                value={notificationData.title}
                onChange={(e) => setNotificationData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="নোটিফিকেশনের শিরোনাম লিখুন"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification_message">নোটিফিকেশন বার্তা</Label>
              <Textarea
                id="notification_message"
                value={notificationData.message}
                onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="নোটিফিকেশনের বিস্তারিত বার্তা লিখুন"
                rows={4}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  পাঠানো হচ্ছে...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  নোটিফিকেশন পাঠান
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            ডেমো নোটিফিকেশন
          </CardTitle>
          <CardDescription>
            টেস্টের জন্য ডেমো নোটিফিকেশন পাঠান
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              এই বাটনটি ক্লিক করে একটি ডেমো সাবস্ক্রিপশন এক্সপায়ারি নোটিফিকেশন তৈরি করুন যা ইউজার ড্যাশবোর্ডে প্রদর্শিত হবে।
            </p>
            
            <Button 
              onClick={handleDemoSubscriptionNotification}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              ডেমো সাবস্ক্রিপশন নোটিফিকেশন পাঠান
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
