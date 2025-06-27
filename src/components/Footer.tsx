
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface FooterSettings {
  company_name?: string;
  company_description?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  working_hours?: string;
}

const Footer = () => {
  const [settings, setSettings] = useState<FooterSettings>({});

  useEffect(() => {
    fetchFooterSettings();
  }, []);

  const fetchFooterSettings = async () => {
    try {
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
          'working_hours'
        ]);

      if (error) throw error;

      const settingsObj: FooterSettings = {};
      data?.forEach(item => {
        settingsObj[item.setting_key as keyof FooterSettings] = item.setting_value;
      });
      
      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching footer settings:', error);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              {settings.company_name || 'SM TEAM SHOPS'}
            </h3>
            <p className="text-gray-400 mb-4">
              {settings.company_description || 'সেরা দামে সব ধরনের ওয়েব ও মোবাইল অ্যাপ সাবস্ক্রিপশন পেতে আমাদের সাথে থাকুন।'}
            </p>
            <div className="flex space-x-4">
              {settings.facebook_url && (
                <a href={settings.facebook_url} className="text-gray-400 hover:text-white transition-colors">ফেসবুক</a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} className="text-gray-400 hover:text-white transition-colors">ইনস্টাগ্রাম</a>
              )}
              {settings.youtube_url && (
                <a href={settings.youtube_url} className="text-gray-400 hover:text-white transition-colors">ইউটিউব</a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">দ্রুত লিংক</h4>
            <ul className="space-y-2">
              <li><Link to="/categories/web" className="text-gray-400 hover:text-white transition-colors">ওয়েব সাবস্ক্রিপশন</Link></li>
              <li><Link to="/categories/mobile" className="text-gray-400 hover:text-white transition-colors">মোবাইল অ্যাপস</Link></li>
              <li><Link to="/categories/tutorial" className="text-gray-400 hover:text-white transition-colors">টিউটোরিয়াল</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">যোগাযোগ</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">কাস্টমার সার্ভিস</h4>
            <ul className="space-y-2">
              <li><Link to="/orders" className="text-gray-400 hover:text-white transition-colors">অর্ডার ট্র্যাক করুন</Link></li>
              <li><Link to="/profile" className="text-gray-400 hover:text-white transition-colors">আমার অ্যাকাউন্ট</Link></li>
              <li><Link to="/favorites" className="text-gray-400 hover:text-white transition-colors">প্রিয় তালিকা</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">সাহায্য ও সহায়তা</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">যোগাযোগের তথ্য</h4>
            <div className="space-y-2 text-gray-400">
              <p>📞 {settings.phone_number || '+৮৮০ ১৭১২৩৪৫৬৭৮'}</p>
              <p>📧 {settings.email || 'support@smteamshops.com'}</p>
              <p>📍 {settings.address || 'ঢাকা, বাংলাদেশ'}</p>
              <p>🕐 {settings.working_hours || 'সকাল ৯টা - রাত ৯টা'}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © ২০২৪ {settings.company_name || 'SM TEAM SHOPS'}. সকল অধিকার সংরক্ষিত। | 
            <Link to="/privacy" className="hover:text-white ml-2">গোপনীয়তা নীতি</Link> |
            <Link to="/terms" className="hover:text-white ml-2">শর্তাবলী</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
