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
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/10 rounded-xl blur-3xl z-0" />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-10 backdrop-blur-md bg-white/5 p-8 rounded-2xl shadow-xl border border-white/10">

          {/* Company Info */}
          <div>
            <h3 className="text-3xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-400 bg-clip-text text-transparent mb-4 drop-shadow-lg">
              {settings.company_name || 'SM TEAM SHOPS'}
            </h3>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">{settings.company_description || 'সেরা দামে সব ধরনের ওয়েব ও মোবাইল অ্যাপ সাবস্ক্রিপশন পেতে আমাদের সাথে থাকুন।'}</p>
            <div className="flex space-x-4 mt-4">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="hover:text-pink-400 transition">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noreferrer" className="hover:text-red-500 transition">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">দ্রুত লিংক</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/categories/web" className="hover:text-white transition">ওয়েব সাবস্ক্রিপশন</Link></li>
              <li><Link to="/categories/mobile" className="hover:text-white transition">মোবাইল অ্যাপস</Link></li>
              <li><Link to="/categories/tutorial" className="hover:text-white transition">টিউটোরিয়াল</Link></li>
              <li><Link to="/team-support" className="hover:text-white transition">যোগাযোগ</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">কাস্টমার সার্ভিস</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/orders" className="hover:text-white transition">অর্ডার ট্র্যাক করুন</Link></li>
              <li><Link to="/profile" className="hover:text-white transition">আমার অ্যাকাউন্ট</Link></li>
              <li><Link to="/favorites" className="hover:text-white transition">প্রিয় তালিকা</Link></li>
              <li><a href="/#/team-support" className="hover:text-white transition">সাহায্য ও সহায়তা</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">যোগাযোগ</h4>
            <div className="space-y-3 text-gray-300 text-sm">
              <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {settings.phone_number || '+৮৮০১৬২৪-৭১২৮৫১'}</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {settings.email || 'smteambdofficial@gmail.com'}</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {settings.address || 'ঢাকা, বাংলাদেশ'}</p>
              <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> {settings.working_hours || 'সকাল ৯টা - রাত ৯টা'}</p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 text-center text-sm text-gray-400">
          <p>
            {settings.copyright_text || `© ২০২৪ ${settings.company_name || 'SM TEAM'}.`} সকল অধিকার সংরক্ষিত। |
            <Link to={settings.privacy_policy_url || "/privacy"} className="hover:text-white mx-2">গোপনীয়তা নীতি</Link>|
            <Link to={settings.terms_url || "/terms"} className="hover:text-white mx-2">শর্তাবলী</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
