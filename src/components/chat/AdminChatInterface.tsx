
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User, Users, Clock, Bot, Mail, Phone } from 'lucide-react';
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
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <div>
              <div>চ্যাট রুমস ({chatRooms.length})</div>
              <p className="text-sm opacity-90">সক্রিয় কাস্টমার</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {chatRooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium">কোনো চ্যাট রুম নেই</p>
                <p className="text-sm">নতুন কাস্টমার চ্যাটের জন্য অপেক্ষা করুন</p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {chatRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => selectRoom(room)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                      selectedRoom?.id === room.id
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">কাস্টমার</span>
                          <p className="text-xs text-gray-500">ID: {room.user_id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant={room.status === 'active' ? 'default' : 'secondary'} className="mb-1">
                          {room.status === 'active' ? 'সক্রিয়' : 'বন্ধ'}
                        </Badge>
                        {room.admin_id && (
                          <Badge variant="outline" className="text-xs">
                            বরাদ্দকৃত
                          </Badge>
                        )}
                      </div>
                    </div>
                    {room.last_message_at && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(room.last_message_at), {
                            addSuffix: true,
                          })}
                        </span>
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
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <div>
              {selectedRoom ? (
                <div>
                  <div className="flex items-center gap-2">
                    <span>কাস্টমার চ্যাট</span>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      ID: {selectedRoom.user_id.slice(0, 8)}
                    </Badge>
                  </div>
                  <p className="text-sm opacity-90">রিয়েলটাইম কথোপকথন</p>
                </div>
              ) : (
                'একটি চ্যাট রুম নির্বাচন করুন'
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[600px]">
          {!selectedRoom ? (
            <div className="text-center py-12 text-gray-500 flex-1 flex items-center justify-center">
              <div>
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">কাস্টমার সাপোর্ট</h3>
                <p className="mb-4">বাম থেকে একটি চ্যাট রুম নির্বাচন করুন</p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    • তাৎক্ষণিক কাস্টমার সাপোর্ট প্রদান করুন
                  </p>
                  <p className="text-sm text-gray-600">
                    • প্রতিটি কাস্টমারের সাথে ব্যক্তিগত কথোপকথন
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <h4 className="font-medium mb-2">নতুন কথোপকথন</h4>
                    <p className="text-sm">এই কাস্টমারের সাথে এখনো কোনো মেসেজ হয়নি</p>
                    <p className="text-sm">প্রথম মেসেজ পাঠিয়ে কথোপকথন শুরু করুন</p>
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
                          className={`max-w-[75%] p-4 rounded-lg shadow-sm ${
                            message.sender_type === 'admin'
                              ? 'bg-green-500 text-white rounded-br-none'
                              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {message.sender_type === 'admin' ? (
                              <Bot className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4 text-blue-600" />
                            )}
                            <span className="text-sm font-medium">
                              {message.sender_type === 'admin' ? 'আপনি (সাপোর্ট)' : 'কাস্টমার'}
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
                    placeholder="কাস্টমারকে উত্তর দিন..."
                    disabled={sending}
                    className="flex-1 bg-white"
                  />
                  <Button 
                    type="submit" 
                    disabled={sending || !newMessage.trim()}
                    className="px-6 bg-green-600 hover:bg-green-700"
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
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    প্রোফেশনাল এবং সহায়ক টোনে উত্তর দিন
                  </p>
                  {selectedRoom && (
                    <p className="text-xs text-gray-500">
                      কাস্টমার ID: {selectedRoom.user_id.slice(0, 8)}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChatInterface;
