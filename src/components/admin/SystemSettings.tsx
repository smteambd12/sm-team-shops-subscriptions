
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw, Settings, Database, Globe, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SystemSettingsData {
  site_name: string;
  site_description: string;
  site_url: string;
  admin_email: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  registration_enabled: boolean;
  max_orders_per_day: string;
  session_timeout: string;
  backup_enabled: boolean;
  backup_frequency: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  api_rate_limit: string;
  max_file_size: string;
  allowed_file_types: string;
  default_currency: string;
  tax_rate: string;
  min_order_amount: string;
}

const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettingsData>({
    site_name: 'SM TEAM SHOPS',
    site_description: 'অনলাইন সাবস্ক্রিপশন সার্ভিস',
    site_url: '',
    admin_email: '',
    maintenance_mode: false,
    maintenance_message: 'আমরা সাইট আপডেট করছি। শীঘ্রই ফিরে আসুন।',
    registration_enabled: true,
    max_orders_per_day: '100',
    session_timeout: '24',
    backup_enabled: true,
    backup_frequency: 'daily',
    email_notifications: true,
    sms_notifications: false,
    api_rate_limit: '1000',
    max_file_size: '10',
    allowed_file_types: 'jpg,jpeg,png,gif,pdf,doc,docx',
    default_currency: 'BDT',
    tax_rate: '0',
    min_order_amount: '50',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', Object.keys(settings));

      if (error) throw error;

      const settingsObj: Partial<SystemSettingsData> = {};
      data?.forEach(item => {
        const key = item.setting_key as keyof SystemSettingsData;
        if (key in settings) {
          if (typeof settings[key] === 'boolean') {
            (settingsObj as any)[key] = item.setting_value === 'true';
          } else {
            (settingsObj as any)[key] = item.setting_value || '';
          }
        }
      });

      setSettings(prev => ({ ...prev, ...settingsObj }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "ত্রুটি",
        description: "সেটিংস লোড করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: String(value),
        setting_type: typeof value === 'boolean' ? 'boolean' : 'text',
        description: getSettingDescription(key)
      }));

      for (const setting of settingsArray) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(setting, {
            onConflict: 'setting_key'
          });

        if (error) throw error;
      }

      toast({
        title: "সফল",
        description: "সিস্টেম সেটিংস সেভ হয়েছে।",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "ত্রুটি",
        description: "সেটিংস সেভ করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSettingDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      site_name: 'Website name',
      site_description: 'Website description',
      site_url: 'Main website URL',
      admin_email: 'Administrator email address',
      maintenance_mode: 'Enable maintenance mode',
      maintenance_message: 'Message shown during maintenance',
      registration_enabled: 'Allow new user registration',
      max_orders_per_day: 'Maximum orders per day',
      session_timeout: 'User session timeout in hours',
      backup_enabled: 'Enable automatic backups',
      backup_frequency: 'Backup frequency',
      email_notifications: 'Enable email notifications',
      sms_notifications: 'Enable SMS notifications',
      api_rate_limit: 'API rate limit per hour',
      max_file_size: 'Maximum file upload size in MB',
      allowed_file_types: 'Allowed file types for upload',
      default_currency: 'Default currency',
      tax_rate: 'Tax rate percentage',
      min_order_amount: 'Minimum order amount'
    };
    return descriptions[key] || '';
  };

  const handleInputChange = (key: keyof SystemSettingsData, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          সাধারণ
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          নিরাপত্তা
        </TabsTrigger>
        <TabsTrigger value="system" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          সিস্টেম
        </TabsTrigger>
        <TabsTrigger value="business" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          ব্যবসায়িক
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>সাধারণ সেটিংস</CardTitle>
            <CardDescription>
              সাইটের মূল তথ্য এবং কনফিগারেশন
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">সাইটের নাম</Label>
                <Input
                  id="site_name"
                  value={settings.site_name}
                  onChange={(e) => handleInputChange('site_name', e.target.value)}
                  placeholder="SM TEAM SHOPS"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_url">সাইট URL</Label>
                <Input
                  id="site_url"
                  value={settings.site_url}
                  onChange={(e) => handleInputChange('site_url', e.target.value)}
                  placeholder="https://yoursite.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_email">অ্যাডমিন ইমেইল</Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={settings.admin_email}
                  onChange={(e) => handleInputChange('admin_email', e.target.value)}
                  placeholder="admin@yoursite.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_description">সাইটের বিবরণ</Label>
              <Textarea
                id="site_description"
                value={settings.site_description}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
                placeholder="অনলাইন সাবস্ক্রিপশন সার্ভিস"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">রক্ষণাবেক্ষণ মোড</h4>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenance_mode"
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
                />
                <Label htmlFor="maintenance_mode">রক্ষণাবেক্ষণ মোড চালু করুন</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance_message">রক্ষণাবেক্ষণ বার্তা</Label>
                <Textarea
                  id="maintenance_message"
                  value={settings.maintenance_message}
                  onChange={(e) => handleInputChange('maintenance_message', e.target.value)}
                  placeholder="আমরা সাইট আপডেট করছি। শীঘ্রই ফিরে আসুন।"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>নিরাপত্তা সেটিংস</CardTitle>
            <CardDescription>
              ব্যবহারকারী নিরাপত্তা এবং অ্যাক্সেস নিয়ন্ত্রণ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="registration_enabled"
                  checked={settings.registration_enabled}
                  onCheckedChange={(checked) => handleInputChange('registration_enabled', checked)}
                />
                <Label htmlFor="registration_enabled">নতুন ব্যবহারকারী নিবন্ধন চালু</Label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">সেশন টাইমআউট (ঘন্টা)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={settings.session_timeout}
                    onChange={(e) => handleInputChange('session_timeout', e.target.value)}
                    placeholder="24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_rate_limit">API রেট লিমিট (প্রতি ঘন্টায়)</Label>
                  <Input
                    id="api_rate_limit"
                    type="number"
                    value={settings.api_rate_limit}
                    onChange={(e) => handleInputChange('api_rate_limit', e.target.value)}
                    placeholder="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_file_size">সর্বোচ্চ ফাইল সাইজ (MB)</Label>
                  <Input
                    id="max_file_size"
                    type="number"
                    value={settings.max_file_size}
                    onChange={(e) => handleInputChange('max_file_size', e.target.value)}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed_file_types">অনুমোদিত ফাইল টাইপ</Label>
                <Input
                  id="allowed_file_types"
                  value={settings.allowed_file_types}
                  onChange={(e) => handleInputChange('allowed_file_types', e.target.value)}
                  placeholder="jpg,jpeg,png,gif,pdf,doc,docx"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="system">
        <Card>
          <CardHeader>
            <CardTitle>সিস্টেম সেটিংস</CardTitle>
            <CardDescription>
              ডাটাবেস এবং সিস্টেম কনফিগারেশন
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="backup_enabled"
                  checked={settings.backup_enabled}
                  onCheckedChange={(checked) => handleInputChange('backup_enabled', checked)}
                />
                <Label htmlFor="backup_enabled">স্বয়ংক্রিয় ব্যাকআপ চালু</Label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backup_frequency">ব্যাকআপ ফ্রিকোয়েন্সি</Label>
                  <Input
                    id="backup_frequency"
                    value={settings.backup_frequency}
                    onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
                    placeholder="daily"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_orders_per_day">দৈনিক সর্বোচ্চ অর্ডার</Label>
                  <Input
                    id="max_orders_per_day"
                    type="number"
                    value={settings.max_orders_per_day}
                    onChange={(e) => handleInputChange('max_orders_per_day', e.target.value)}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">নোটিফিকেশন সেটিংস</h4>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email_notifications"
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
                  />
                  <Label htmlFor="email_notifications">ইমেইল নোটিফিকেশন</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="sms_notifications"
                    checked={settings.sms_notifications}
                    onCheckedChange={(checked) => handleInputChange('sms_notifications', checked)}
                  />
                  <Label htmlFor="sms_notifications">SMS নোটিফিকেশন</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="business">
        <Card>
          <CardHeader>
            <CardTitle>ব্যবসায়িক সেটিংস</CardTitle>
            <CardDescription>
              মূল্য, কর এবং অর্ডার সংক্রান্ত সেটিংস
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default_currency">ডিফল্ট কারেন্সি</Label>
                <Input
                  id="default_currency"
                  value={settings.default_currency}
                  onChange={(e) => handleInputChange('default_currency', e.target.value)}
                  placeholder="BDT"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_rate">কর হার (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  value={settings.tax_rate}
                  onChange={(e) => handleInputChange('tax_rate', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_order_amount">ন্যূনতম অর্ডার পরিমাণ</Label>
                <Input
                  id="min_order_amount"
                  type="number"
                  value={settings.min_order_amount}
                  onChange={(e) => handleInputChange('min_order_amount', e.target.value)}
                  placeholder="50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="flex gap-4 pt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              সেভ হচ্ছে...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              সেভ করুন
            </>
          )}
        </Button>

        <Button variant="outline" onClick={fetchSettings}>
          <RefreshCw className="h-4 w-4 mr-2" />
          রিলোড করুন
        </Button>
      </div>
    </Tabs>
  );
};

export default SystemSettings;
