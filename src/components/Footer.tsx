
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              SM TEAM SHOPS
            </h3>
            <p className="text-gray-400 mb-4">
              সেরা দামে সব ধরনের ওয়েব ও মোবাইল অ্যাপ সাবস্ক্রিপশন পেতে আমাদের সাথে থাকুন।
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">ফেসবুক</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">ইনস্টাগ্রাম</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">ইউটিউব</a>
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
              <p>📞 +৮৮০ ১৭১২৩৪৫৬৭৮</p>
              <p>📧 support@smteamshops.com</p>
              <p>📍 ঢাকা, বাংলাদেশ</p>
              <p>🕐 সকাল ৯টা - রাত ৯টা</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © ২০২৪ SM TEAM SHOPS. সকল অধিকার সংরক্ষিত। | 
            <Link to="/privacy" className="hover:text-white ml-2">গোপনীয়তা নীতি</Link> |
            <Link to="/terms" className="hover:text-white ml-2">শর্তাবলী</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
