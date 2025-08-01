
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  bkash_number: string;
  nagad_number: string;
  rocket_number: string;
  live_chat_number: string;
  search_placeholder: string;
  enable_advanced_search: boolean;
  team_support_whatsapp_number: string;
  team_support_whatsapp_link: string;
  team_support_phone_number: string;
  team_support_email: string;
  popular_products_enabled: boolean;
  offer_products_enabled: boolean;
  enable_product_sharing: boolean;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    bkash_number: '',
    nagad_number: '',
    rocket_number: '',
    live_chat_number: '',
    search_placeholder: 'প্রোডাক্ট খুঁজুন...',
    enable_advanced_search: false,
    team_support_whatsapp_number: '',
    team_support_whatsapp_link: '',
    team_support_phone_number: '',
    team_support_email: '',
    popular_products_enabled: true,
    offer_products_enabled: true,
    enable_product_sharing: true,
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
        .in('setting_key', [
          'bkash_number', 
          'nagad_number', 
          'rocket_number', 
          'live_chat_number',
          'search_placeholder',
          'enable_advanced_search',
          'team_support_whatsapp_number',
          'team_support_whatsapp_link',
          'team_support_phone_number',
          'team_support_email',
          'popular_products_enabled',
          'offer_products_enabled',
          'enable_product_sharing'
        ]);

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
        search_placeholder: settingsMap.search_placeholder || 'প্রোডাক্ট খুঁজুন...',
        enable_advanced_search: settingsMap.enable_advanced_search === 'true',
        team_support_whatsapp_number: settingsMap.team_support_whatsapp_number || '',
        team_support_whatsapp_link: settingsMap.team_support_whatsapp_link || '',
        team_support_phone_number: settingsMap.team_support_phone_number || '',
        team_support_email: settingsMap.team_support_email || '',
        popular_products_enabled: settingsMap.popular_products_enabled === 'true',
        offer_products_enabled: settingsMap.offer_products_enabled === 'true',
        enable_product_sharing: settingsMap.enable_product_sharing === 'true',
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
