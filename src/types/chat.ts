
export interface ChatRoom {
  id: string;
  user_id: string;
  admin_id: string | null;
  status: 'active' | 'closed';
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin';
  message: string;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatProps {
  roomId?: string;
  isAdmin?: boolean;
}
