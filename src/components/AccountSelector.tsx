import React from 'react';
import { Instagram, MessageCircle, Facebook, CheckSquare } from 'lucide-react';
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

export function AccountSelector() {
  const { accounts, selectedAccount, selectAccount, selectAllAccounts, allAccountsSelected } = useStore();

  if (accounts.length === 0) {
    return (
      <div className="border-b border-gray-200 p-4 text-center">
        <p className="text-sm text-gray-500">Bağlı hesap yok</p>
        <p className="text-xs text-gray-400 mt-1">Hesaplarınızı Ayarlar'dan bağlayın</p>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 overflow-x-auto">
      <div className="flex p-2">
        <button
          onClick={() => selectAllAccounts()}
          className={`flex items-center justify-center px-4 py-2 rounded-lg mr-2 ${
            allAccountsSelected
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CheckSquare className="h-4 w-4 mr-1.5" />
          <span>Tümü</span>
        </button>
        
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => selectAccount(account.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg mr-2 whitespace-nowrap transition-colors ${
              selectedAccount === account.id || (allAccountsSelected && selectedAccount === null)
                ? 'bg-gray-200 text-gray-900'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={`p-1 rounded-full text-white ${platformColors[account.platform]}`}>
              {platformIcons[account.platform]}
            </div>
            <span className="text-sm font-medium">{account.name}</span>
            {account.unreadCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-red-500 text-white">
                {account.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}