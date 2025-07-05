
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage, ChatRoom } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

export const useChat = (roomId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<ChatRoom | null>(null);

  // Get or create chat room for current user
  const getOrCreateRoom = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('get_or_create_chat_room', {
        p_user_id: user.id
      });

      if (error) throw error;
      
      // Fetch the room details
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', data)
        .single();

      if (roomError) throw roomError;

      setRoom(roomData as ChatRoom);
      return roomData.id;
    } catch (error) {
      console.error('Error getting/creating chat room:', error);
      toast({
        title: "ত্রুটি",
        description: "চ্যাট রুম তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  // Fetch messages for the room
  const fetchMessages = useCallback(async (chatRoomId: string) => {
    try {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select('*')
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages((data || []) as ChatMessage[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "ত্রুটি",
        description: "মেসেজ লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Send a new message
  const sendMessage = async (message: string) => {
    if (!user || !room) return false;

    try {
      const { error } = await supabase
        .from('live_chat_messages')
        .insert({
          chat_room_id: room.id,
          sender_id: user.id,
          sender_type: 'user',
          message: message.trim(),
        });

      if (error) throw error;

      // Update room's last message time
      await supabase
        .from('chat_rooms')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', room.id);

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "ত্রুটি",
        description: "মেসেজ পাঠাতে সমস্যা হয়েছে",
        variant: "destructive",
      });
      return false;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    let currentRoomId = roomId;

    const initializeChat = async () => {
      if (!currentRoomId) {
        currentRoomId = await getOrCreateRoom();
      }

      if (currentRoomId) {
        await fetchMessages(currentRoomId);
      }
    };

    initializeChat();

    // Set up real-time subscription for messages
    if (currentRoomId) {
      const channel = supabase
        .channel('chat-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'live_chat_messages',
            filter: `chat_room_id=eq.${currentRoomId}`,
          },
          (payload) => {
            const newMessage = payload.new as ChatMessage;
            setMessages(prev => [...prev, newMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, roomId, getOrCreateRoom, fetchMessages]);

  return {
    messages,
    loading,
    room,
    sendMessage,
  };
};
