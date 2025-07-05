
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User, Bot, Clock } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const ChatInterface = () => {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
    }
    setSending(false);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center py-8">
          <div className="animate-pulse flex items-center justify-center">
            <MessageSquare className="h-8 w-8 mr-2" />
            <span>চ্যাট লোড হচ্ছে...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          <div>
            <h3 className="text-xl font-bold">লাইভ চ্যাট সাপোর্ট</h3>
            <p className="text-sm opacity-90">আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন</p>
          </div>
        </CardTitle>
        {user && (
          <div className="flex items-center gap-2 mt-2">
            <User className="h-4 w-4" />
            <span className="text-sm">{user.email}</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              অনলাইন
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">স্বাগতম!</h4>
              <p>আপনার কোনো প্রশ্ন বা সমস্যা থাকলে এখানে মেসেজ করুন।</p>
              <p className="text-sm mt-1">আমাদের সাপোর্ট টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.sender_type === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.sender_type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="text-sm font-medium">
                        {message.sender_type === 'user' ? 'আপনি' : 'সাপোর্ট টিম'}
                      </span>
                      <Clock className="h-3 w-3 opacity-75" />
                      <span className="text-xs opacity-75">
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="break-words leading-relaxed">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4 bg-gray-50">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="আপনার মেসেজ লিখুন..."
              disabled={sending}
              className="flex-1 bg-white"
            />
            <Button 
              type="submit" 
              disabled={sending || !newMessage.trim()}
              className="px-6"
            >
              {sending ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  পাঠান
                </>
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            আমাদের সাপোর্ট টিম সাধারণত ৫-১০ মিনিটের মধ্যে উত্তর দেয়
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
