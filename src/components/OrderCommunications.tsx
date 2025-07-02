
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrderCommunications } from '@/hooks/useOrderCommunications';
import MessageList from '@/components/communications/MessageList';
import MessageForm from '@/components/communications/MessageForm';
import type { OrderCommunicationsProps } from '@/types/communications';

const OrderCommunications: React.FC<OrderCommunicationsProps> = ({ orderId, orderNumber }) => {
  const { user } = useAuth();
  const { communications, loading, refetch } = useOrderCommunications(orderId);

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
        <MessageList communications={communications} loading={loading} />
        <MessageForm orderId={orderId} onMessageSent={refetch} />
      </CardContent>
    </Card>
  );
};

export default OrderCommunications;
