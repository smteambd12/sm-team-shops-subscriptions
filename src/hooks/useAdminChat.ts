
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage, ChatRoom } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

export const useAdminChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all chat rooms for admin
  const fetchChatRooms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      setChatRooms(data || []);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast({
        title: "ত্রুটি",
        description: "চ্যাট রুমগুলো লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch messages for selected room
  const fetchMessagesForRoom = useCallback(async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "ত্রুটি",
        description: "মেসেজ লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Send admin message
  const sendAdminMessage = async (message: string, roomId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('live_chat_messages')
        .insert({
          chat_room_id: roomId,
          sender_id: user.id,
          sender_type: 'admin',
          message: message.trim(),
        });

      if (error) throw error;

      // Update room's last message time and assign admin
      await supabase
        .from('chat_rooms')
        .update({ 
          last_message_at: new Date().toISOString(),
          admin_id: user.id 
        })
        .eq('id', roomId);

      return true;
    } catch (error) {
      console.error('Error sending admin message:', error);
      toast({
        title: "ত্রুটি",
        description: "মেসেজ পাঠাতে সমস্যা হয়েছে",
        variant: "destructive",
      });
      return false;
    }
  };

  // Select a room and fetch its messages
  const selectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    fetchMessagesForRoom(room.id);
  };

  useEffect(() => {
    if (!user) return;

    fetchChatRooms();

    // Set up real-time subscription for new chat rooms
    const roomsChannel = supabase
      .channel('chat-rooms')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_rooms',
        },
        () => {
          fetchChatRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomsChannel);
    };
  }, [user, fetchChatRooms]);

  // Set up real-time subscription for messages in selected room
  useEffect(() => {
    if (!selectedRoom) return;

    const messagesChannel = supabase
      .channel(`chat-messages-${selectedRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
          filter: `chat_room_id=eq.${selectedRoom.id}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedRoom]);

  return {
    chatRooms,
    messages,
    selectedRoom,
    loading,
    selectRoom,
    sendAdminMessage,
    fetchChatRooms,
  };
};
