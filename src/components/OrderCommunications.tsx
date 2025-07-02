
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Paperclip, Download, User, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type OrderCommunication = Tables<'order_communications'>;

interface OrderCommunicationsProps {
  orderId: string;
  orderNumber?: string;
}

const OrderCommunications: React.FC<OrderCommunicationsProps> = ({ orderId, orderNumber }) => {
  const { user } = useAuth();
  const [communications, setCommunications] = useState<OrderCommunication[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    if (user && orderId) {
      fetchCommunications();
    }
  }, [user, orderId]);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('order_communications')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCommunications(data || []);
    } catch (error) {
      console.error('Error fetching communications:', error);
      toast.error('মেসেজ লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !attachment) return;

    try {
      setSending(true);
      let attachmentUrl = null;
      let attachmentName = null;
      let attachmentType = null;

      // Upload attachment if present
      if (attachment) {
        const fileExt = attachment.name.split('.').pop();
        const fileName = `${orderId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('order-attachments')
          .upload(fileName, attachment);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('order-attachments')
          .getPublicUrl(fileName);

        attachmentUrl = publicUrl;
        attachmentName = attachment.name;
        attachmentType = attachment.type;
      }

      const { error } = await supabase
        .from('order_communications')
        .insert([{
          order_id: orderId,
          user_id: user?.id,
          message: message.trim(),
          sender_type: 'user',
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
          attachment_type: attachmentType,
        }]);

      if (error) throw error;

      setMessage('');
      setAttachment(null);
      toast.success('মেসেজ পাঠানো হয়েছে');
      fetchCommunications();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('মেসেজ পাঠাতে সমস্যা হয়েছে');
    } finally {
      setSending(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          অর্ডার কমিউনিকেশন {orderNumber && `(#${orderNumber})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : communications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>এখনো কোন মেসেজ নেই</p>
            </div>
          ) : (
            communications.map((comm) => (
              <div
                key={comm.id}
                className={`flex gap-3 ${comm.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${comm.sender_type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {comm.sender_type === 'admin' ? (
                      <Shield className="h-4 w-4 text-blue-600" />
                    ) : (
                      <User className="h-4 w-4 text-gray-600" />
                    )}
                    <Badge variant={comm.sender_type === 'admin' ? 'default' : 'secondary'}>
                      {comm.sender_type === 'admin' ? 'অ্যাডমিন' : 'আপনি'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(comm.created_at || '')}
                    </span>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${
                    comm.sender_type === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{comm.message}</p>
                    
                    {comm.attachment_url && (
                      <div className="mt-2 pt-2 border-t border-opacity-20">
                        <a
                          href={comm.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 text-sm hover:underline ${
                            comm.sender_type === 'user' ? 'text-purple-100' : 'text-blue-600'
                          }`}
                        >
                          <Download className="h-4 w-4" />
                          {comm.attachment_name || 'ফাইল ডাউনলোড'}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="space-y-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="আপনার মেসেজ লিখুন..."
            className="min-h-20"
            disabled={sending}
          />
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                type="file"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                className="hidden"
                id={`file-${orderId}`}
                disabled={sending}
              />
              <label
                htmlFor={`file-${orderId}`}
                className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800"
              >
                <Paperclip className="h-4 w-4" />
                {attachment ? attachment.name : 'ফাইল সংযুক্ত করুন'}
              </label>
            </div>
            
            <Button 
              type="submit" 
              disabled={(!message.trim() && !attachment) || sending}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {sending ? 'পাঠানো হচ্ছে...' : 'পাঠান'}
            </Button>
          </div>
          
          {attachment && (
            <div className="text-sm text-gray-600">
              সংযুক্ত: {attachment.name} ({(attachment.size / 1024).toFixed(1)} KB)
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAttachment(null)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                ✕
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderCommunications;
