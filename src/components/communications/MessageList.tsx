
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Download, User, Shield } from 'lucide-react';
import type { MessageListProps } from '@/types/communications';

const MessageList: React.FC<MessageListProps> = ({ communications, loading }) => {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    );
  }

  if (communications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>এখনো কোন মেসেজ নেই</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {communications.map((comm) => (
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
      ))}
    </div>
  );
};

export default MessageList;
