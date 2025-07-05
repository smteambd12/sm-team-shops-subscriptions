
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Headphones, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LiveChatCard = () => {
  const navigate = useNavigate();

  const handleChatClick = () => {
    navigate('/chat');
  };

  return (
    <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <MessageSquare className="h-8 w-8" />
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

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 p-3 rounded-lg text-center">
            <Clock className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-medium">গড় রেসপন্স টাইম</p>
            <p className="text-lg font-bold">৫ মিনিট</p>
          </div>
          <div className="bg-white/10 p-3 rounded-lg text-center">
            <Users className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-medium">সাপোর্ট এজেন্ট</p>
            <p className="text-lg font-bold">২৪/৭</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
            <span className="text-sm">তাৎক্ষণিক সমাধান</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
            <span className="text-sm">বিশেষজ্ঞ সাপোর্ট টিম</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
            <span className="text-sm">২৪/৭ সেবা</span>
          </div>
        </div>

        <Button 
          onClick={handleChatClick}
          className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold py-3 text-lg"
        >
          <Headphones className="h-5 w-5 mr-2" />
          এখনই চ্যাট শুরু করুন
        </Button>

        <p className="text-xs text-green-100 text-center mt-3">
          কোনো প্রশ্ন বা সমস্যা? আমরা এখানে সাহায্য করতে প্রস্তুত!
        </p>
      </CardContent>
    </Card>
  );
};

export default LiveChatCard;
