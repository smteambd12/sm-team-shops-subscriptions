
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw } from 'lucide-react';

interface FooterSettingsData {
  company_name: string;
  company_description: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  phone_number: string;
  email: string;
  address: string;
  working_hours: string;
  copyright_text: string;
  privacy_policy_url: string;
  terms_url: string;
}

const FooterSettings = () => {
  const [settings, setSettings] = useState<FooterSettingsData>({
    company_name: '',
    company_description: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    phone_number: '',
    email: '',
    address: '',
    working_hours: '',
    copyright_text: '',
    privacy_policy_url: '',
    terms_url: '',
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
          'company_name',
          'company_description',
          'facebook_url',
          'instagram_url',
          'youtube_url',
          'phone_number',
          'email',
          'address',
          'working_hours',
          'copyright_text',
          'privacy_policy_url',
          'terms_url'
        ]);

      if (error) throw error;

      const settingsObj: Partial<FooterSettingsData> = {};
      data?.forEach(item => {
        settingsObj[item.setting_key as keyof FooterSettingsData] = item.setting_value || '';
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
        setting_value: value,
        setting_type: 'text',
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
        description: "ফুটার সেটিংস সেভ হয়েছে।",
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
      company_name: 'Company name displayed in footer',
      company_description: 'Company description in footer',
      facebook_url: 'Facebook page URL',
      instagram_url: 'Instagram profile URL',
      youtube_url: 'YouTube channel URL',
      phone_number: 'Contact phone number',
      email: 'Contact email address',
      address: 'Company address',
      working_hours: 'Business working hours',
      copyright_text: 'Copyright text displayed in footer',
      privacy_policy_url: 'Privacy policy page URL',
      terms_url: 'Terms and conditions page URL'
    };
    return descriptions[key] || '';
  };

  const handleInputChange = (key: keyof FooterSettingsData, value: string) => {
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
    <Card>
      <CardHeader>
        <CardTitle>ফুটার সেটিংস</CardTitle>
        <CardDescription>
          ওয়েবসাইটের ফুটার অংশের সমস্ত তথ্য কাস্টমাইজ করুন
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">কোম্পানির তথ্য</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">কোম্পানির নাম</Label>
              <Input
                id="company_name"
                value={settings.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="SM TEAM SHOPS"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="support@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">ফোন নম্বর</Label>
              <Input
                id="phone_number"
                value={settings.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="+৮৮০ ১৭১২৩৪৫৬৭৮"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="working_hours">কার্যসময়</Label>
              <Input
                id="working_hours"
                value={settings.working_hours}
                onChange={(e) => handleInputChange('working_hours', e.target.value)}
                placeholder="সকাল ৯টা - রাত ৯টা"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_description">কোম্পানির বিবরণ</Label>
            <Textarea
              id="company_description"
              value={settings.company_description}
              onChange={(e) => handleInputChange('company_description', e.target.value)}
              placeholder="সেরা দামে সব ধরনের ওয়েব ও মোবাইল অ্যাপ সাবস্ক্রিপশন পেতে আমাদের সাথে থাকুন।"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">ঠিকানা</Label>
            <Textarea
              id="address"
              value={settings.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="ঢাকা, বাংলাদেশ"
              rows={2}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-lg">সোশ্যাল মিডিয়া লিংক</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook_url">ফেসবুক URL</Label>
              <Input
                id="facebook_url"
                value={settings.facebook_url}
                onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram_url">ইনস্টাগ্রাম URL</Label>
              <Input
                id="instagram_url"
                value={settings.instagram_url}
                onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/yourpage"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_url">ইউটিউব URL</Label>
              <Input
                id="youtube_url"
                value={settings.youtube_url}
                onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-lg">ফুটার লিংক ও কপিরাইট</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="privacy_policy_url">গোপনীয়তা নীতি URL</Label>
              <Input
                id="privacy_policy_url"
                value={settings.privacy_policy_url}
                onChange={(e) => handleInputChange('privacy_policy_url', e.target.value)}
                placeholder="/privacy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms_url">শর্তাবলী URL</Label>
              <Input
                id="terms_url"
                value={settings.terms_url}
                onChange={(e) => handleInputChange('terms_url', e.target.value)}
                placeholder="/terms"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="copyright_text">কপিরাইট টেক্সট</Label>
            <Input
              id="copyright_text"
              value={settings.copyright_text}
              onChange={(e) => handleInputChange('copyright_text', e.target.value)}
              placeholder="© ২০২৪ SM TEAM SHOPS. সকল অধিকার সংরক্ষিত।"
            />
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
  );
};

export default FooterSettings;
