
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';

const LiveChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">লাইভ চ্যাট সাপোর্ট</h1>
          <p className="text-gray-600">
            আমাদের সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ করুন
          </p>
        </div>
        
        <ChatInterface />
      </div>
    </div>
  );
};

export default LiveChat;
