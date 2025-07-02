
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { MessageFormProps } from '@/types/communications';

const MessageForm: React.FC<MessageFormProps> = ({ orderId, onMessageSent }) => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !attachment) return;
    if (!user) {
      toast.error('লগইন করুন প্রথমে');
      return;
    }

    try {
      setSending(true);
      let attachmentUrl = null;
      let attachmentName = null;
      let attachmentType = null;

      // Upload attachment if present
      if (attachment) {
        const fileExt = attachment.name.split('.').pop();
        const fileName = `${orderId}/${Date.now()}.${fileExt}`;
        
        console.log('Uploading attachment:', fileName);
        const { error: uploadError } = await supabase.storage
          .from('order-attachments')
          .upload(fileName, attachment);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('ফাইল আপলোড করতে সমস্যা হয়েছে');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('order-attachments')
          .getPublicUrl(fileName);

        attachmentUrl = publicUrl;
        attachmentName = attachment.name;
        attachmentType = attachment.type;
      }

      console.log('Sending message:', { orderId, userId: user.id, message: message.trim() });
      
      const { error } = await supabase
        .from('order_communications')
        .insert([{
          order_id: orderId,
          user_id: user.id,
          message: message.trim(),
          sender_type: 'user',
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
          attachment_type: attachmentType,
        }]);

      if (error) {
        console.error('Message send error:', error);
        throw error;
      }

      setMessage('');
      setAttachment(null);
      toast.success('মেসেজ পাঠানো হয়েছে');
      onMessageSent();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'মেসেজ পাঠাতে সমস্যা হয়েছে');
    } finally {
      setSending(false);
    }
  };

  return (
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
  );
};

export default MessageForm;
