import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, Clock } from 'lucide-react';

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
  copyright_text?: string;
  privacy_policy_url?: string;
  terms_url?: string;
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
          'working_hours',
          'copyright_text',
          'privacy_policy_url',
          'terms_url'
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
    <footer className="bg-gradient-to-br from-[#0f0f1f] via-[#1c1c2e] to-[#0f0f1f] text-white py-10 md:py-14 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-xl p-3 md:p-5 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 text-center md:text-left">


          {/* Company */}
          <div>
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text mb-3">
              {settings.company_name || 'SM TEAM SHOPS'}
            </h3>
            <p className="text-gray-300 text-sm">
              {settings.company_description || 'সেরা দামে সব ধরনের ওয়েব ও মোবাইল অ্যাপ সাবস্ক্রিপশন পেতে আমাদের সাথে থাকুন।'}
            </p>
            <div className="flex justify-center md:justify-start space-x-4 mt-4">
              {settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer"><Facebook className="w-5 h-5 hover:text-blue-500" /></a>}
              {settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer"><Instagram className="w-5 h-5 hover:text-pink-400" /></a>}
              {settings.youtube_url && <a href={settings.youtube_url} target="_blank" rel="noreferrer"><Youtube className="w-5 h-5 hover:text-red-500" /></a>}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">দ্রুত লিংক</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/categories/web" className="hover:text-white">ওয়েব সাবস্ক্রিপশন</Link></li>
              <li><Link to="/categories/mobile" className="hover:text-white">মোবাইল অ্যাপস</Link></li>
              <li><Link to="/categories/tutorial" className="hover:text-white">টিউটোরিয়াল</Link></li>
              <li><Link to="/team-support" className="hover:text-white">যোগাযোগ</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">কাস্টমার সার্ভিস</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/orders" className="hover:text-white">অর্ডার ট্র্যাক করুন</Link></li>
              <li><Link to="/profile" className="hover:text-white">আমার অ্যাকাউন্ট</Link></li>
              <li><Link to="/favorites" className="hover:text-white">প্রিয় তালিকা</Link></li>
              <li><a href="/#/team-support" className="hover:text-white">সাহায্য ও সহায়তা</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">যোগাযোগ</h4>
            <div className="space-y-2 text-gray-300 text-sm">
              <p className="flex items-center justify-center md:justify-start gap-2"><Phone className="w-4 h-4" /> {settings.phone_number || '+৮৮০১৬২৪-৭১২৮৫১'}</p>
              <p className="flex items-center justify-center md:justify-start gap-2"><Mail className="w-4 h-4" /> {settings.email || 'smteambdofficial@gmail.com'}</p>
              <p className="flex items-center justify-center md:justify-start gap-2"><MapPin className="w-4 h-4" /> {settings.address || 'ঢাকা, বাংলাদেশ'}</p>
              <p className="flex items-center justify-center md:justify-start gap-2"><Clock className="w-4 h-4" /> {settings.working_hours || 'সকাল ৯টা - রাত ৯টা'}</p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 mt-8">
          <p>
            {settings.copyright_text || `© ২০২৪ ${settings.company_name || 'SM TEAM'}.`} সকল অধিকার সংরক্ষিত। |
            <Link to={settings.privacy_policy_url || "/privacy"} className="hover:text-white mx-1">গোপনীয়তা নীতি</Link>|
            <Link to={settings.terms_url || "/terms"} className="hover:text-white mx-1">শর্তাবলী</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
