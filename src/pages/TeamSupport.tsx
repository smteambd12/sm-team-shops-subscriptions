
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone, Mail, Clock, Users, Globe, ArrowLeft } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '@/components/chat/ChatInterface';

const TeamSupport = () => {
  const { settings, loading } = useSiteSettings();
  const navigate = useNavigate();

  const handleWhatsAppClick = () => {
    const whatsappNumber = settings.team_support_whatsapp_number;
    const whatsappLink = settings.team_support_whatsapp_link;
    const message = encodeURIComponent('আসসালামু আলাইকুম, আমার সাহায্য প্রয়োজন।');
    
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
    } else if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    }
  };

  const handlePhoneClick = () => {
    const phoneNumber = settings.team_support_phone_number;
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const handleEmailClick = () => {
    const email = settings.team_support_email;
    if (email) {
      window.open(`mailto:${email}?subject=সাহায্য প্রয়োজন`, '_self');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          ড্যাশবোর্ডে ফিরুন
        </Button>
        <div>
          <h1 className="text-3xl font-bold">টিম সাপোর্ট</h1>
          <p className="text-gray-600">আমাদের সাথে যোগাযোগ করুন</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Support Contact Options */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Users className="h-7 w-7 text-blue-600" />
                সাপোর্ট যোগাযোগ
              </CardTitle>
              <p className="text-gray-700 mt-2">
                আমাদের সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ করুন। আমরা ২৪/৭ আপনার সেবায় নিয়োজিত।
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={handleWhatsAppClick}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-3 h-16 text-left justify-start px-6"
                  disabled={!settings.team_support_whatsapp_number && !settings.team_support_whatsapp_link}
                >
                  <MessageSquare className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <div className="text-base font-semibold">WhatsApp</div>
                    <div className="text-sm opacity-90">তাৎক্ষণিক চ্যাট</div>
                  </div>
                </Button>

                <Button
                  onClick={handlePhoneClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-3 h-16 text-left justify-start px-6"
                  disabled={!settings.team_support_phone_number}
                >
                  <Phone className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <div className="text-base font-semibold">ফোন কল</div>
                    <div className="text-sm opacity-90">সরাসরি কথা</div>
                  </div>
                </Button>

                <Button
                  onClick={handleEmailClick}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center gap-3 h-16 text-left justify-start px-6"
                  disabled={!settings.team_support_email}
                >
                  <Mail className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <div className="text-base font-semibold">ইমেইল</div>
                    <div className="text-sm opacity-70">বিস্তারিত সাহায্য</div>
                  </div>
                </Button>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">সেবার তথ্য</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <span className="font-medium">সেবার সময়:</span>
                      <span className="text-blue-700 ml-2">২৪/৭ উপলব্ধ</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="font-medium">গড় রেসপন্স:</span>
                      <span className="text-green-700 ml-2">৫ মিনিট</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-600 text-lg">💡</div>
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">দ্রুত সাহায্যের জন্য টিপস:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• অর্ডার সংক্রান্ত সমস্যার জন্য অর্ডার নাম্বার উল্লেখ করুন</li>
                        <li>• স্ক্রিনশট সংযুক্ত করলে দ্রুত সমাধান পাবেন</li>
                        <li>• WhatsApp এ সবচেয়ে দ্রুত উত্তর পাবেন</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Chat Interface */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                লাইভ চ্যাট
              </CardTitle>
              <p className="text-gray-600 text-sm">
                আমাদের সাপোর্ট টিমের সাথে সরাসরি চ্যাট করুন
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <ChatInterface />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamSupport;
