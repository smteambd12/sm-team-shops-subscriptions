import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  User, 
  Bot, 
  Phone,
  MessageSquare 
} from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { formatDistanceToNow } from 'date-fns';

const ChatWidget = () => {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useChat();
  const { settings } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Main Chat Button */}
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
          >
            <div className="flex flex-col items-center">
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs mt-1">চ্যাট</span>
            </div>
          </Button>

          {/* Quick Action Buttons */}
          <div className="absolute bottom-0 right-20 flex gap-2">
            <Button
              onClick={handleWhatsAppClick}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 shadow-md"
              title="হোয়াটসঅ্যাপে যোগাযোগ"
              disabled={!settings.team_support_whatsapp_number && !settings.team_support_whatsapp_link}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              onClick={handlePhoneClick}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 shadow-md"
              title="ফোনে যোগাযোগ"
              disabled={!settings.team_support_phone_number}
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>

          {/* Online Status Indicator */}
          <div className="absolute -top-2 -right-2 bg-green-500 w-4 h-4 rounded-full border-2 border-white animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`shadow-2xl border-0 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}>
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-3 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-full">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">লাইভ সাপোর্ট</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-xs">অনলাইন</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 w-8 h-8 p-0"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 w-8 h-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[436px]">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-pulse">চ্যাট লোড হচ্ছে...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium mb-1">স্বাগতম!</p>
                  <p className="text-xs">আপনার প্রশ্ন লিখুন, আমরা সাহায্য করব</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          message.sender_type === 'user'
                            ? 'bg-green-500 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender_type === 'user' ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Bot className="h-3 w-3 text-green-600" />
                          )}
                          <span className="text-xs font-medium">
                            {message.sender_type === 'user' ? 'আপনি' : 'সাপোর্ট'}
                          </span>
                          <span className="text-xs opacity-75">
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="break-words">{message.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-3 bg-gray-50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="মেসেজ লিখুন..."
                  disabled={sending}
                  className="flex-1 text-sm"
                />
                <Button 
                  type="submit" 
                  disabled={sending || !newMessage.trim()}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {sending ? (
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
              </form>

              {/* Quick Actions */}
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">সাধারণত ৫ মিনিটে উত্তর দেই</p>
                <div className="flex gap-1">
                  <Button
                    onClick={handleWhatsAppClick}
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1 h-6"
                    disabled={!settings.team_support_whatsapp_number && !settings.team_support_whatsapp_link}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>
                  <Button
                    onClick={handlePhoneClick}
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1 h-6"
                    disabled={!settings.team_support_phone_number}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    কল
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ChatWidget;
