
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User, Users, Clock } from 'lucide-react';
import { useAdminChat } from '@/hooks/useAdminChat';
import { formatDistanceToNow } from 'date-fns';

const AdminChatInterface = () => {
  const { 
    chatRooms, 
    messages, 
    selectedRoom, 
    loading, 
    selectRoom, 
    sendAdminMessage 
  } = useAdminChat();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selectedRoom) return;

    setSending(true);
    const success = await sendAdminMessage(newMessage, selectedRoom.id);
    if (success) {
      setNewMessage('');
    }
    setSending(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-pulse">লোড হচ্ছে...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
      {/* Chat Rooms List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            চ্যাট রুমস ({chatRooms.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {chatRooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>কোনো চ্যাট রুম নেই</p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {chatRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => selectRoom(room)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedRoom?.id === room.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">ইউজার</span>
                      </div>
                      <Badge variant={room.status === 'active' ? 'default' : 'secondary'}>
                        {room.status === 'active' ? 'সক্রিয়' : 'বন্ধ'}
                      </Badge>
                    </div>
                    {room.last_message_at && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(room.last_message_at), {
                          addSuffix: true,
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {selectedRoom ? 'চ্যাট মেসেজ' : 'একটি চ্যাট রুম নির্বাচন করুন'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[600px]">
          {!selectedRoom ? (
            <div className="text-center py-8 text-gray-500 flex-1 flex items-center justify-center">
              <div>
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>বাম থেকে একটি চ্যাট রুম নির্বাচন করুন</p>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>এই রুমে এখনো কোনো মেসেজ নেই</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.sender_type === 'admin'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4" />
                            <span className="text-xs opacity-75">
                              {message.sender_type === 'admin' ? 'আপনি (সাপোর্ট)' : 'ইউজার'}
                            </span>
                          </div>
                          <p className="break-words">{message.message}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="উত্তর লিখুন..."
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChatInterface;
