
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Calendar, User, Package, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface UserSubscription {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  package_duration: string;
  price: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

const SubscriptionsManagement = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingSubscription, setEditingSubscription] = useState<UserSubscription | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  const [editFormData, setEditFormData] = useState({
    expires_at: '',
    is_active: true,
    auto_renew: false,
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          profiles:user_id(full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process the data to ensure proper type compatibility
      const processedData = (data || []).map(item => ({
        ...item,
        profiles: item.profiles && typeof item.profiles === 'object' && !Array.isArray(item.profiles) 
          ? item.profiles 
          : null
      })) as UserSubscription[];
      
      setSubscriptions(processedData);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "ত্রুটি",
        description: "সাবস্ক্রিপশন লোড করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subscription: UserSubscription) => {
    setEditingSubscription(subscription);
    setEditFormData({
      expires_at: subscription.expires_at ? subscription.expires_at.split('T')[0] : '',
      is_active: subscription.is_active,
      auto_renew: subscription.auto_renew,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubscription) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          expires_at: editFormData.expires_at,
          is_active: editFormData.is_active,
          auto_renew: editFormData.auto_renew,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingSubscription.id);

      if (error) throw error;

      toast({
        title: "সফল",
        description: "সাবস্ক্রিপশন আপডেট হয়েছে।",
      });

      setShowEditDialog(false);
      setEditingSubscription(null);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "ত্রুটি",
        description: "সাবস্ক্রিপশন আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (subscriptionId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই সাবস্ক্রিপশনটি মুছে ফেলতে চান?')) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: "সফল",
        description: "সাবস্ক্রিপশন মুছে ফেলা হয়েছে।",
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast({
        title: "ত্রুটি",
        description: "সাবস্ক্রিপশন মুছতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.profiles?.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && sub.is_active) ||
      (statusFilter === 'inactive' && !sub.is_active) ||
      (statusFilter === 'expired' && new Date(sub.expires_at) < new Date());

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (subscription: UserSubscription) => {
    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    
    if (!subscription.is_active) {
      return <Badge variant="secondary">নিষ্ক্রিয়</Badge>;
    }
    
    if (expiresAt < now) {
      return <Badge variant="destructive">মেয়াদ শেষ</Badge>;
    }
    
    return <Badge variant="default">সক্রিয়</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">সাবস্ক্রিপশন পরিচালনা</h2>
          <p className="text-gray-600">ইউজারদের সাবস্ক্রিপশন দেখুন ও পরিচালনা করুন।</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="প্রোডাক্ট বা ইউজার নাম খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব সাবস্ক্রিপশন</SelectItem>
            <SelectItem value="active">সক্রিয়</SelectItem>
            <SelectItem value="inactive">নিষ্ক্রিয়</SelectItem>
            <SelectItem value="expired">মেয়াদ শেষ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredSubscriptions.map((subscription) => (
          <Card key={subscription.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {subscription.product_name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {subscription.profiles?.full_name || 'নাম নেই'}
                    </span>
                    <span>{subscription.profiles?.phone || 'ফোন নেই'}</span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(subscription)}
                  <Button size="sm" variant="outline" onClick={() => handleEdit(subscription)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(subscription.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>প্যাকেজ:</strong> {subscription.package_duration}</p>
                  <p><strong>মূল্য:</strong> ৳{subscription.price}</p>
                  <p><strong>অটো রিনিউ:</strong> {subscription.auto_renew ? 'হ্যাঁ' : 'না'}</p>
                </div>
                <div>
                  <p><strong>শুরু:</strong> {new Date(subscription.starts_at).toLocaleDateString('bn-BD')}</p>
                  <p><strong>শেষ:</strong> {new Date(subscription.expires_at).toLocaleDateString('bn-BD')}</p>
                  <p><strong>তৈরি:</strong> {new Date(subscription.created_at).toLocaleDateString('bn-BD')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>সাবস্ক্রিপশন সম্পাদনা</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="expires_at">মেয়াদ শেষের তারিখ</Label>
              <Input
                id="expires_at"
                type="date"
                value={editFormData.expires_at}
                onChange={(e) => setEditFormData({ ...editFormData, expires_at: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editFormData.is_active}
                onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
              />
              <Label htmlFor="is_active">সক্রিয় সাবস্ক্রিপশন</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto_renew"
                checked={editFormData.auto_renew}
                onChange={(e) => setEditFormData({ ...editFormData, auto_renew: e.target.checked })}
              />
              <Label htmlFor="auto_renew">অটো রিনিউ</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                বাতিল
              </Button>
              <Button type="submit">
                আপডেট করুন
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsManagement;
