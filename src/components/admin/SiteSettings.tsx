
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, CreditCard, MessageSquare, Save } from 'lucide-react';

interface Setting {
  setting_key: string;
  setting_value: string;
  description: string;
}

const SiteSettings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    bkash_number: '',
    nagad_number: '',
    rocket_number: '',
    live_chat_number: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('setting_key', ['bkash_number', 'nagad_number', 'rocket_number', 'live_chat_number']);

      if (error) throw error;

      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value || '';
        return acc;
      }, {} as any);

      setFormData({
        bkash_number: settingsMap.bkash_number || '',
        nagad_number: settingsMap.nagad_number || '',
        rocket_number: settingsMap.rocket_number || '',
        live_chat_number: settingsMap.live_chat_number || '',
      });

      setSettings(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const updates = Object.entries(formData).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'setting_key' });

        if (error) throw error;
      }

      toast({
        title: "সফল",
        description: "সেটিংস আপডেট হয়েছে।",
      });

      fetchSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "ত্রুটি",
        description: "সেটিংস আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
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
      <div>
        <h2 className="text-2xl font-bold">সাইট সেটিংস</h2>
        <p className="text-gray-600">পেমেন্ট নম্বর ও লাইভ চ্যাট নম্বর কনফিগার করুন।</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              পেমেন্ট নম্বর
            </CardTitle>
            <CardDescription>
              গ্রাহকরা যে নম্বরে পেমেন্ট পাঠাবেন সেগুলো এখানে সেট করুন।
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bkash_number">bKash নম্বর</Label>
                <Input
                  id="bkash_number"
                  value={formData.bkash_number}
                  onChange={(e) => setFormData({ ...formData, bkash_number: e.target.value })}
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="nagad_number">Nagad নম্বর</Label>
                <Input
                  id="nagad_number"
                  value={formData.nagad_number}
                  onChange={(e) => setFormData({ ...formData, nagad_number: e.target.value })}
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="rocket_number">Rocket নম্বর</Label>
                <Input
                  id="rocket_number"
                  value={formData.rocket_number}
                  onChange={(e) => setFormData({ ...formData, rocket_number: e.target.value })}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              লাইভ চ্যাট
            </CardTitle>
            <CardDescription>
              গ্রাহক সাপোর্টের জন্য WhatsApp নম্বর সেট করুন।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="live_chat_number">WhatsApp নম্বর</Label>
              <Input
                id="live_chat_number"
                value={formData.live_chat_number}
                onChange={(e) => setFormData({ ...formData, live_chat_number: e.target.value })}
                placeholder="01XXXXXXXXX"
              />
              <p className="text-sm text-gray-500 mt-1">
                এই নম্বরে গ্রাহকরা সরাসরি WhatsApp-এ যোগাযোগ করতে পারবেন।
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
          </Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>বর্তমান সেটিংস</CardTitle>
          <CardDescription>
            সিস্টেমে সংরক্ষিত সেটিংস দেখুন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {settings.map((setting) => (
              <div key={setting.setting_key} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <span className="font-medium">{setting.description}</span>
                  <p className="text-sm text-gray-600">{setting.setting_key}</p>
                </div>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {setting.setting_value || 'Not Set'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettings;
