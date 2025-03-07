import React from 'react';
import { Instagram, MessageCircle, Facebook, Phone, Video, MoreVertical } from 'lucide-react';
import { useStore } from '../store';
import { Platform } from '../types';

const platformIcons: Record<Platform, React.ReactNode> = {
  instagram: <Instagram className="h-5 w-5" />,
  whatsapp: <MessageCircle className="h-5 w-5" />,
  messenger: <Facebook className="h-5 w-5" />,
};

const platformColors: Record<Platform, string> = {
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  whatsapp: 'bg-green-500',
  messenger: 'bg-blue-500',
};

export function ChatHeader() {
  const { contacts, selectedContact, toggleSidebar, accounts } = useStore();

  const contact = contacts.find((c) => c.id === selectedContact);

  if (!contact) {
    return (
      <div className="h-16 border-b border-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Lütfen bir konuşma seçin</p>
      </div>
    );
  }

  // Get account name
  const account = accounts.find(a => a.id === contact.accountId);
  const accountName = account ? account.name : '';

  return (
    <div className="h-16 border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="relative">
          <img
            src={contact.avatar}
            alt={contact.name}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full p-0.5 text-white ${
              platformColors[contact.platform]
            }`}
          >
            {platformIcons[contact.platform]}
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">{contact.name}</p>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {accountName} ({contact.platform})
            </span>
            <div className="flex items-center space-x-1">
              {contact.labels.map((label) => (
                <span
                  key={label.id}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${label.color} text-white`}
                >
                  {label.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Phone className="h-5 w-5 text-gray-500" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Video className="h-5 w-5 text-gray-500" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => toggleSidebar()}
        >
          <MoreVertical className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}