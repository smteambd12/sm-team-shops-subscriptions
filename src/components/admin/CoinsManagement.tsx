import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Coins, Gift, Plus, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PurchasablePromoCode {
  id: string;
  code: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  coin_cost: number;
  min_order_amount: number;
  max_uses?: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CoinsManagement = () => {
  const [promoCodes, setPromoCodes] = useState<PurchasablePromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<PurchasablePromoCode | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    coin_cost: '',
    min_order_amount: '',
    max_uses: '',
    is_active: true
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('purchasable_promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure discount_type is properly typed
      const typedData = (data || []).map(item => ({
        ...item,
        discount_type: item.discount_type as 'percentage' | 'fixed'
      })) as PurchasablePromoCode[];
      
      setPromoCodes(typedData);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('প্রোমো কোড লোড করতে সমস্যা হয়েছে।');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      coin_cost: '',
      min_order_amount: '',
      max_uses: '',
      is_active: true
    });
    setEditingCode(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.title || !formData.discount_value || !formData.coin_cost) {
      toast.error('সব প্রয়োজনীয় তথ্য দিন।');
      return;
    }

    try {
      setLoading(true);

      const promoData = {
        code: formData.code.toUpperCase(),
        title: formData.title,
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        coin_cost: parseInt(formData.coin_cost),
        min_order_amount: parseFloat(formData.min_order_amount) || 0,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        is_active: formData.is_active
      };

      if (editingCode) {
        const { error } = await supabase
          .from('purchasable_promo_codes')
          .update(promoData)
          .eq('id', editingCode.id);

        if (error) throw error;
        toast.success('প্রোমো কোড আপডেট হয়েছে।');
      } else {
        const { error } = await supabase
          .from('purchasable_promo_codes')
          .insert([promoData]);

        if (error) throw error;
        toast.success('নতুন প্রোমো কোড যোগ হয়েছে।');
      }

      await fetchPromoCodes();
      resetForm();
    } catch (error: any) {
      console.error('Error saving promo code:', error);
      toast.error(error.message || 'প্রোমো কোড সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (promoCode: PurchasablePromoCode) => {
    setFormData({
      code: promoCode.code,
      title: promoCode.title,
      description: promoCode.description || '',
      discount_type: promoCode.discount_type,
      discount_value: promoCode.discount_value.toString(),
      coin_cost: promoCode.coin_cost.toString(),
      min_order_amount: promoCode.min_order_amount.toString(),
      max_uses: promoCode.max_uses ? promoCode.max_uses.toString() : '',
      is_active: promoCode.is_active
    });
    setEditingCode(promoCode);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই প্রোমো কোডটি মুছে ফেলতে চান?')) return;

    try {
      const { error } = await supabase
        .from('purchasable_promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('প্রোমো কোড মুছে ফেলা হয়েছে।');
      await fetchPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast.error('প্রোমো কোড মুছতে সমস্যা হয়েছে।');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('purchasable_promo_codes')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      toast.success(isActive ? 'প্রোমো কোড নিষ্ক্রিয় করা হয়েছে।' : 'প্রোমো কোড সক্রিয় করা হয়েছে।');
      await fetchPromoCodes();
    } catch (error) {
      console.error('Error toggling promo code status:', error);
      toast.error('স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-yellow-600" />
          <h2 className="text-2xl font-bold">কয়েন সিস্টেম ম্যানেজমেন্ট</h2>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          নতুন প্রোমো কোড
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              {editingCode ? 'প্রোমো কোড এডিট করুন' : 'নতুন প্রোমো কোড যোগ করুন'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">প্রোমো কোড *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE20"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="title">শিরোনাম *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="২০% ছাড়"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="discount_type">ছাড়ের ধরন *</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">শতাংশ (%)</SelectItem>
                      <SelectItem value="fixed">নির্দিষ্ট পরিমাণ (৳)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="discount_value">ছাড়ের পরিমাণ *</Label>
                  <Input
                    id="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder={formData.discount_type === 'percentage' ? '20' : '100'}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="coin_cost">কয়েনের দাম *</Label>
                  <Input
                    id="coin_cost"
                    type="number"
                    value={formData.coin_cost}
                    onChange={(e) => setFormData({ ...formData, coin_cost: e.target.value })}
                    placeholder="50"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="min_order_amount">সর্বনিম্ন অর্ডার পরিমাণ</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    placeholder="500"
                  />
                </div>

                <div>
                  <Label htmlFor="max_uses">সর্বোচ্চ ব্যবহার</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">বর্ণনা</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="প্রোমো কোডের বর্ণনা লিখুন..."
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_active">সক্রিয়</Label>
                </div>

                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    বাতিল
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'সেভ হচ্ছে...' : editingCode ? 'আপডেট করুন' : 'যোগ করুন'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Promo Codes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promoCodes.map((promoCode) => (
          <Card key={promoCode.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  {promoCode.title}
                </CardTitle>
                <Badge variant={promoCode.is_active ? 'default' : 'secondary'}>
                  {promoCode.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">কোড:</span>
                  <code className="font-mono">{promoCode.code}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ছাড়:</span>
                  <span>{promoCode.discount_type === 'percentage' ? `${promoCode.discount_value}%` : `৳${promoCode.discount_value}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">কয়েনের দাম:</span>
                  <span className="flex items-center gap-1">
                    <Coins className="h-3 w-3 text-yellow-500" />
                    {promoCode.coin_cost}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ব্যবহার:</span>
                  <span>{promoCode.used_count}{promoCode.max_uses ? ` / ${promoCode.max_uses}` : ''}</span>
                </div>
              </div>

              {promoCode.description && (
                <p className="text-sm text-gray-600">{promoCode.description}</p>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(promoCode.id, promoCode.is_active)}
                >
                  {promoCode.is_active ? 'নিষ্ক্রিয়' : 'সক্রিয়'} করুন
                </Button>
                
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(promoCode)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(promoCode.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {promoCodes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">কোনো প্রোমো কোড নেই</h3>
            <p className="text-gray-500 mb-4">প্রথম প্রোমো কোড যোগ করুন।</p>
            <Button onClick={() => setShowForm(true)}>
              প্রোমো কোড যোগ করুন
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoinsManagement;
