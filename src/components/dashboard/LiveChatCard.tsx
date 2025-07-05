
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Headphones, Clock, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SupportOptions from './SupportOptions';

const LiveChatCard = () => {
  const navigate = useNavigate();

  const handleChatClick = () => {
    navigate('/chat');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Live Chat Card */}
      <Card className="lg:col-span-2 bg-gradient-to-r from-green-500 to-teal-600 text-white hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-full">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">লাইভ চ্যাট সাপোর্ট</h3>
                <p className="text-green-100">তাৎক্ষণিক সহায়তা পান</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">অনলাইন</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/10 p-3 rounded-lg text-center">
              <Clock className="h-5 w-5 mx-auto mb-2" />
              <p className="text-sm font-medium">গড় রেসপন্স</p>
              <p className="text-lg font-bold">৫ মিনিট</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg text-center">
              <Users className="h-5 w-5 mx-auto mb-2" />
              <p className="text-sm font-medium">সাপোর্ট টিম</p>
              <p className="text-lg font-bold">২৪/৭</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="mb-1">✓ তাৎক্ষণিক সমাধান</p>
              <p className="mb-1">✓ বিশেষজ্ঞ সাপোর্ট</p>
              <p>✓ নিরাপদ ও গোপনীয়</p>
            </div>
            <Button 
              onClick={handleChatClick}
              className="bg-white text-green-600 hover:bg-green-50 font-semibold px-6 py-2"
            >
              <Headphones className="h-4 w-4 mr-2" />
              বিস্তারিত চ্যাট
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-green-100">
              💡 টিপস: নিচের ডানদিকের চ্যাট বাটনে ক্লিক করে দ্রুত সাহায্য নিন!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Support Options */}
      <div className="lg:col-span-1">
        <SupportOptions />
      </div>
    </div>
  );
};

export default LiveChatCard;
