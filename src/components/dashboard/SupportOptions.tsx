
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone, Mail, Clock, Users, Globe } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const SupportOptions = () => {
  const { settings, loading } = useSiteSettings();

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
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          সাপোর্ট যোগাযোগ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={handleWhatsAppClick}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 h-12"
            disabled={!settings.team_support_whatsapp_number && !settings.team_support_whatsapp_link}
          >
            <MessageSquare className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm font-medium">WhatsApp</div>
              <div className="text-xs opacity-90">তাৎক্ষণিক চ্যাট</div>
            </div>
          </Button>

          <Button
            onClick={handlePhoneClick}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-12"
            disabled={!settings.team_support_phone_number}
          >
            <Phone className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm font-medium">ফোন কল</div>
              <div className="text-xs opacity-90">সরাসরি কথা</div>
            </div>
          </Button>

          <Button
            onClick={handleEmailClick}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center gap-2 h-12"
            disabled={!settings.team_support_email}
          >
            <Mail className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm font-medium">ইমেইল</div>
              <div className="text-xs opacity-70">বিস্তারিত সাহায্য</div>
            </div>
          </Button>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium">সেবার সময়:</span>
            </div>
            <span className="text-blue-700">২৪/৭ উপলব্ধ</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" />
              <span className="font-medium">গড় রেসপন্স:</span>
            </div>
            <span className="text-green-700">৫ মিনিট</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportOptions;
