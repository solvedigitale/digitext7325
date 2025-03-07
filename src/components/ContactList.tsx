import React, { useMemo, useState, useEffect } from 'react';
import { Instagram, MessageCircle, Facebook, Search, RefreshCcw } from 'lucide-react';
import { useStore } from '../store';
import { formatDate } from '../lib/utils';
import { Platform } from '../types';

const platformIcons: Record<Platform, React.ReactNode> = {
  instagram: <Instagram className="h-4 w-4" />,
  whatsapp: <MessageCircle className="h-4 w-4" />,
  messenger: <Facebook className="h-4 w-4" />,
};

const platformColors: Record<Platform, string> = {
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  whatsapp: 'bg-green-500',
  messenger: 'bg-blue-500',
};

interface ContactListProps {
  showFilters?: boolean;
}

export function ContactList({ showFilters = false }: ContactListProps) {
  const { contacts, selectedAccount, selectedContact, selectContact, accounts, allAccountsSelected, labels } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Set filters visibility based on prop
  useEffect(() => {
    setFiltersVisible(showFilters);
  }, [showFilters]);

  const filteredContacts = useMemo(() => {
    let filtered = contacts;
    
    // Filter by account if not all accounts selected
    if (!allAccountsSelected && selectedAccount) {
      filtered = filtered.filter((contact) => contact.accountId === selectedAccount);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (contact) => 
          contact.name.toLowerCase().includes(query) || 
          (contact.lastMessage && contact.lastMessage.toLowerCase().includes(query))
      );
    }
    
    // Filter by unread messages
    if (filterUnread) {
      filtered = filtered.filter(contact => contact.unreadCount > 0);
    }
    
    // Filter by selected labels
    if (selectedLabels.length > 0) {
      filtered = filtered.filter(contact => 
        contact.labels.some(label => selectedLabels.includes(label.id))
      );
    }
    
    return filtered;
  }, [contacts, selectedAccount, searchQuery, allAccountsSelected, filterUnread, selectedLabels]);

  // Get account name by ID
  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : '';
  };

  // Check if contact has returned orders
  const hasReturnedOrders = (contact: any) => {
    return contact.orders && contact.orders.some((order: any) => order.status === 'returned');
  };

  // Toggle label selection for filtering
  const toggleLabelFilter = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId) 
        : [...prev, labelId]
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {filtersVisible && (
          <div className="mt-3">
            <div className="flex items-center space-x-2 mb-2">
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input 
                  type="checkbox" 
                  checked={filterUnread} 
                  onChange={() => setFilterUnread(!filterUnread)}
                  className="rounded text-blue-600 focus:ring-blue-500" 
                />
                <span>Sadece okunmamışlar</span>
              </label>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Etiketler</p>
              <div className="flex flex-wrap gap-1">
                {labels.map(label => (
                  <label key={label.id} className="flex items-center space-x-1 text-xs">
                    <input 
                      type="checkbox" 
                      checked={selectedLabels.includes(label.id)}
                      onChange={() => toggleLabelFilter(label.id)}
                      className="rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <span className={`px-2 py-0.5 rounded-full ${label.color} text-white`}>
                      {label.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {filteredContacts.map((contact) => (
          <button
            key={contact.id}
            className={`w-full flex items-start p-4 hover:bg-gray-50 transition-colors ${
              selectedContact === contact.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => selectContact(contact.id)}
          >
            <div className="relative flex-shrink-0">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div
                className={`absolute bottom-0 right-0 h-4 w-4 rounded-full p-0.5 text-white ${
                  platformColors[contact.platform]
                }`}
              >
                {platformIcons[contact.platform]}
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                  {hasReturnedOrders(contact) && (
                    <span className="ml-1.5 inline-flex items-center p-0.5 rounded-full bg-purple-100">
                      <RefreshCcw className="h-3 w-3 text-purple-600" />
                    </span>
                  )}
                </div>
                {contact.lastMessageTime && (
                  <p className="text-xs text-gray-500">
                    {formatDate(contact.lastMessageTime)}
                  </p>
                )}
              </div>
              {allAccountsSelected && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {getAccountName(contact.accountId)} ({contact.platform})
                </p>
              )}
              {contact.lastMessage && (
                <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
              )}
              <div className="mt-1 flex items-center space-x-1">
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
            {contact.unreadCount > 0 && (
              <div className="ml-2 flex-shrink-0">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-medium">
                  {contact.unreadCount}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}