import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { formatDate } from '../lib/utils';
import { cn } from '../lib/utils';
import { ShoppingBag } from 'lucide-react';

export function MessageList() {
  const { messages, selectedContact, contacts } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contact = selectedContact ? contacts.find(c => c.id === selectedContact) : null;
  const contactMessages = selectedContact ? messages[selectedContact] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [contactMessages]);

  if (!selectedContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Mesajlaşma Platformu</h3>
          <p className="mt-1 text-sm text-gray-500">
            Konuşmalarınızı yönetmek için bir kişi seçin
          </p>
        </div>
      </div>
    );
  }

  // Get returned orders for this contact
  const returnedOrders = contact?.orders?.filter(order => order.status === 'returned') || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {/* Display returned order information at the top of the chat */}
      {returnedOrders.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <ShoppingBag className="h-5 w-5 text-purple-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-800">
                Bu müşterinin {returnedOrders.length > 1 ? `${returnedOrders.length} adet` : 'bir adet'} iade edilmiş siparişi bulunmaktadır
              </p>
              <div className="mt-1 space-y-1">
                {returnedOrders.map(order => (
                  <div key={order.id} className="text-xs text-purple-700">
                    <span className="font-medium">#{order.orderNumber}</span>
                    {order.returnReason && (
                      <span className="ml-1">- {order.returnReason}</span>
                    )}
                    {order.returnDate && (
                      <span className="text-purple-500 ml-1">
                        ({order.returnDate.toLocaleDateString()})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {contactMessages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex',
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          <div
            className={cn(
              'max-w-xs sm:max-w-md px-4 py-2 rounded-lg',
              message.sender === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-900'
            )}
          >
            <p className="text-sm">{message.content}</p>
            <div
              className={cn(
                'text-xs mt-1',
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              )}
            >
              {formatDate(message.timestamp)}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}