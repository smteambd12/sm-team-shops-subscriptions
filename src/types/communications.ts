
import type { Tables } from '@/integrations/supabase/types';

export type OrderCommunication = Tables<'order_communications'>;

export interface OrderCommunicationsProps {
  orderId: string;
  orderNumber?: string;
}

export interface MessageListProps {
  communications: OrderCommunication[];
  loading: boolean;
}

export interface MessageFormProps {
  orderId: string;
  onMessageSent: () => void;
}
