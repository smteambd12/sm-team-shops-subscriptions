
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X } from 'lucide-react';
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
    
    if (!message.trim() && !attachment) {
      toast.error('অনুগ্রহ করে একটি মেসেজ লিখুন বা ফাইল সংযুক্ত করুন');
      return;
    }
    
    if (!user) {
      toast.error('লগইন করুন প্রথমে');
      return;
    }

    try {
      setSending(true);
      let attachmentUrl = null;
      let attachmentName = null;
      let attachmentType = null;

      console.log('Sending message for order:', orderId, 'user:', user.id);

      // Upload attachment if present
      if (attachment) {
        console.log('Uploading attachment:', attachment.name);
        const fileExt = attachment.name.split('.').pop();
        const fileName = `${orderId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('order-attachments')
          .upload(fileName, attachment);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('ফাইল আপলোড করতে সমস্যা হয়েছে: ' + uploadError.message);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('order-attachments')
          .getPublicUrl(fileName);

        attachmentUrl = publicUrl;
        attachmentName = attachment.name;
        attachmentType = attachment.type;
        console.log('File uploaded successfully:', publicUrl);
      }

      const messageData = {
        order_id: orderId,
        user_id: user.id,
        message: message.trim(),
        sender_type: 'user',
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
      };

      console.log('Inserting message:', messageData);
      
      const { error } = await supabase
        .from('order_communications')
        .insert([messageData]);

      if (error) {
        console.error('Message insert error:', error);
        toast.error('মেসেজ পাঠাতে সমস্যা হয়েছে: ' + error.message);
        return;
      }

      console.log('Message sent successfully');
      setMessage('');
      setAttachment(null);
      toast.success('মেসেজ পাঠানো হয়েছে');
      onMessageSent();
    } catch (error: any) {
      console.error('Unexpected error sending message:', error);
      toast.error('মেসেজ পাঠাতে অপ্রত্যাশিত সমস্যা হয়েছে');
    } finally {
      setSending(false);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  return (
    <form onSubmit={handleSendMessage} className="space-y-3">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="আপনার মেসেজ লিখুন..."
        className="min-h-20 resize-none"
        disabled={sending}
        rows={3}
      />
      
      {attachment && (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Paperclip className="h-4 w-4" />
            <span>{attachment.name}</span>
            <span className="text-xs">({(attachment.size / 1024).toFixed(1)} KB)</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeAttachment}
            className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            type="file"
            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            className="hidden"
            id={`file-${orderId}`}
            disabled={sending}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <label
            htmlFor={`file-${orderId}`}
            className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800 px-3 py-2 border border-dashed border-gray-300 rounded hover:border-gray-400 transition-colors"
          >
            <Paperclip className="h-4 w-4" />
            {attachment ? 'ফাইল পরিবর্তন করুন' : 'ফাইল সংযুক্ت করুন'}
          </label>
        </div>
        
        <Button 
          type="submit" 
          disabled={(!message.trim() && !attachment) || sending}
          className="flex items-center gap-2 min-w-24"
        >
          <Send className="h-4 w-4" />
          {sending ? 'পাঠানো হচ্ছে...' : 'পাঠান'}
        </Button>
      </div>
    </form>
  );
};

export default MessageForm;
