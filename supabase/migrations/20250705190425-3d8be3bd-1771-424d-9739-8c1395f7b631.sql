
-- Create a table for live chat messages
CREATE TABLE public.live_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  message TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for chat rooms
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  admin_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_rooms
CREATE POLICY "Users can view their own chat room" 
  ON public.chat_rooms 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chat room" 
  ON public.chat_rooms 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own chat room" 
  ON public.chat_rooms 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all chat rooms" 
  ON public.chat_rooms 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can update all chat rooms" 
  ON public.chat_rooms 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ));

-- RLS policies for live_chat_messages
CREATE POLICY "Users can view messages in their chat room" 
  ON public.live_chat_messages 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM chat_rooms 
    WHERE id = live_chat_messages.chat_room_id 
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can send messages in their chat room" 
  ON public.live_chat_messages 
  FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() 
    AND sender_type = 'user'
    AND EXISTS (
      SELECT 1 FROM chat_rooms 
      WHERE id = live_chat_messages.chat_room_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all chat messages" 
  ON public.live_chat_messages 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can send messages to any chat room" 
  ON public.live_chat_messages 
  FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() 
    AND sender_type = 'admin'
    AND EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_live_chat_messages_chat_room_id ON public.live_chat_messages(chat_room_id);
CREATE INDEX idx_live_chat_messages_created_at ON public.live_chat_messages(created_at);
CREATE INDEX idx_chat_rooms_user_id ON public.chat_rooms(user_id);
CREATE INDEX idx_chat_rooms_last_message_at ON public.chat_rooms(last_message_at);

-- Enable realtime for live chat
ALTER TABLE public.live_chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;

-- Function to create or get chat room for user
CREATE OR REPLACE FUNCTION public.get_or_create_chat_room(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  room_id UUID;
BEGIN
  -- Try to get existing chat room
  SELECT id INTO room_id
  FROM chat_rooms
  WHERE user_id = p_user_id;
  
  -- If no room exists, create one
  IF room_id IS NULL THEN
    INSERT INTO chat_rooms (user_id, status)
    VALUES (p_user_id, 'active')
    RETURNING id INTO room_id;
  END IF;
  
  RETURN room_id;
END;
$$;
