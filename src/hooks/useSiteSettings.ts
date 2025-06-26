
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  bkash_number: string;
  nagad_number: string;
  rocket_number: string;
  live_chat_number: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    bkash_number: '',
    nagad_number: '',
    rocket_number: '',
    live_chat_number: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['bkash_number', 'nagad_number', 'rocket_number', 'live_chat_number']);

      if (error) throw error;

      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value || '';
        return acc;
      }, {} as any);

      setSettings({
        bkash_number: settingsMap.bkash_number || '',
        nagad_number: settingsMap.nagad_number || '',
        rocket_number: settingsMap.rocket_number || '',
        live_chat_number: settingsMap.live_chat_number || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error, refetch: fetchSettings };
};
