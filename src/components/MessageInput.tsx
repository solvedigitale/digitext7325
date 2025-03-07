import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Smile } from 'lucide-react';
import { useStore } from '../store';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export function MessageInput() {
  const [message, setMessage] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [filteredTemplates, setFilteredTemplates] = useState<Array<{id: string, name: string, content: string}>>([]);
  const { selectedContact, sendMessage, templates } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Handle template shortcodes
  useEffect(() => {
    if (message.includes('/')) {
      const parts = message.split('/');
      const lastPart = parts[parts.length - 1].toLowerCase();
      
      if (lastPart.length > 0) {
        const filtered = templates.filter(t => 
          t.name.toLowerCase().includes(lastPart) || 
          t.content.toLowerCase().includes(lastPart)
        );
        setFilteredTemplates(filtered);
        setShowTemplates(filtered.length > 0);
      } else {
        setFilteredTemplates(templates);
        setShowTemplates(templates.length > 0);
      }
    } else {
      setShowTemplates(false);
    }
  }, [message, templates]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedContact) return;

    sendMessage(selectedContact, message);
    setMessage('');
  };

  const selectTemplate = (templateContent: string) => {
    sendMessage(selectedContact!, templateContent);
    setMessage('');
    setShowTemplates(false);
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  if (!selectedContact) return null;

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white relative">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mesaj yazın... (/ ile şablon kullanın)"
            className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-500"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </button>
          
          {/* Emoji picker */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-full right-0 mb-2 z-10"
            >
              <Picker 
                data={data} 
                onEmojiSelect={handleEmojiSelect}
                theme="light"
                previewPosition="none"
                i18n={{
                  search: 'Ara',
                  categories: {
                    recent: 'Son Kullanılanlar',
                    people: 'İfadeler & İnsanlar',
                    nature: 'Hayvanlar & Doğa',
                    foods: 'Yiyecek & İçecek',
                    activity: 'Aktivite',
                    places: 'Seyahat & Yerler',
                    objects: 'Nesneler',
                    symbols: 'Semboller',
                    flags: 'Bayraklar',
                  }
                }}
              />
            </div>
          )}
          
          {/* Template suggestions dropdown */}
          {showTemplates && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
              {filteredTemplates.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => selectTemplate(template.content)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <p className="font-medium text-sm">{template.name}</p>
                  <p className="text-xs text-gray-500 truncate">{template.content}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!message.trim()}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}