import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw, Settings2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FooterSettings from './FooterSettings';

interface SiteSettingsData {
  bkash_number: string;
  nagad_number: string;
  rocket_number: string;
  live_chat_number: string;
  search_placeholder: string;
  enable_advanced_search: boolean;
}

const SiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettingsData>({
    bkash_number: '',
    nagad_number: '',
    rocket_number: '',
    live_chat_number: '',
    search_placeholder: 'প্রোডাক্ট খুঁজুন...',
    enable_advanced_search: false,
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
        .in('setting_key', [
          'bkash_number',
          'nagad_number',
          'rocket_number',
          'live_chat_number',
          'search_placeholder',
          'enable_advanced_search'
        ]);

      if (error) throw error;

      const settingsObj: Partial<SiteSettingsData> = {};
      data?.forEach(item => {
        const key = item.setting_key as keyof SiteSettingsData;
        if (key in settings) {
          if (key === 'enable_advanced_search') {
            settingsObj[key] = item.setting_value === 'true';
          } else {
            // Type assertion to handle string values for non-boolean keys
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
        description: "সাইট সেটিংস সেভ হয়েছে।",
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
      bkash_number: 'bKash mobile banking number',
      nagad_number: 'Nagad mobile banking number',
      rocket_number: 'Rocket mobile banking number',
      live_chat_number: 'WhatsApp number for live chat',
      search_placeholder: 'Placeholder text for search input',
      enable_advanced_search: 'Enable advanced search features'
    };
    return descriptions[key] || '';
  };

  const handleInputChange = (key: keyof SiteSettingsData, value: string | boolean) => {
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
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="general" className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          সাধারণ সেটিংস
        </TabsTrigger>
        <TabsTrigger value="footer" className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          ফুটার সেটিংস
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>সাইট সেটিংস</CardTitle>
            <CardDescription>
              ওয়েবসাইটের বিভিন্ন সেটিংস কনফিগার করুন
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">পেমেন্ট তথ্য</h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bkash_number">বিকাশ নম্বর</Label>
                  <Input
                    id="bkash_number"
                    value={settings.bkash_number}
                    onChange={(e) => handleInputChange('bkash_number', e.target.value)}
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nagad_number">নগদ নম্বর</Label>
                  <Input
                    id="nagad_number"
                    value={settings.nagad_number}
                    onChange={(e) => handleInputChange('nagad_number', e.target.value)}
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rocket_number">রকেট নম্বর</Label>
                  <Input
                    id="rocket_number"
                    value={settings.rocket_number}
                    onChange={(e) => handleInputChange('rocket_number', e.target.value)}
                    placeholder="01XXXXXXXXX-X"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="live_chat_number">লাইভ চ্যাট নম্বর (WhatsApp)</Label>
                  <Input
                    id="live_chat_number"
                    value={settings.live_chat_number}
                    onChange={(e) => handleInputChange('live_chat_number', e.target.value)}
                    placeholder="8801XXXXXXXXX"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">সার্চ সেটিংস</h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search_placeholder">সার্চ প্লেসহোল্ডার টেক্সট</Label>
                  <Input
                    id="search_placeholder"
                    value={settings.search_placeholder}
                    onChange={(e) => handleInputChange('search_placeholder', e.target.value)}
                    placeholder="প্রোডাক্ট খুঁজুন..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_advanced_search"
                    checked={settings.enable_advanced_search}
                    onCheckedChange={(checked) => handleInputChange('enable_advanced_search', checked)}
                  />
                  <Label htmlFor="enable_advanced_search">অ্যাডভান্সড সার্চ চালু করুন</Label>
                </div>
              </div>
            </div>

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
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="footer">
        <FooterSettings />
      </TabsContent>
    </Tabs>
  );
};

export default SiteSettings;
