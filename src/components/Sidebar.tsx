import React, { useState } from 'react';
import { X, Tag, FileText, ShoppingBag, Send, Plus, Edit, Trash2, RefreshCcw } from 'lucide-react';
import { useStore } from '../store';
import { Order } from '../types';

export function Sidebar() {
  const { contacts, selectedContact, labels, templates, sidebarOpen, toggleSidebar, addLabel, removeLabel, updateNotes, addOrder, updateOrder, markOrderAsReturned, sendMessage, addTemplate, updateTemplate, removeTemplate } = useStore();
  const [activeTab, setActiveTab] = useState<'labels' | 'notes' | 'orders' | 'templates'>('labels');
  const [orderForm, setOrderForm] = useState({
    orderNumber: '',
    amount: '',
    shippingCompany: '',
  });
  const [returnForm, setReturnForm] = useState({
    orderId: '',
    reason: '',
  });
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({
    id: '',
    name: '',
    content: '',
  });
  const [editingTemplate, setEditingTemplate] = useState(false);

  const contact = contacts.find((c) => c.id === selectedContact);

  // Find the order confirmation template
  const orderConfirmationTemplate = templates.find(t => 
    t.name.toLowerCase().includes('sipariş bilgisi')
  );

  if (!contact || !sidebarOpen) return null;

  const handleAddLabel = (labelId: string) => {
    const label = labels.find((l) => l.id === labelId);
    if (label && selectedContact) {
      addLabel(selectedContact, label);
    }
  };

  const handleRemoveLabel = (labelId: string) => {
    if (selectedContact) {
      removeLabel(selectedContact, labelId);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedContact) {
      updateNotes(selectedContact, e.target.value);
    }
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedContact && orderForm.orderNumber && orderForm.amount) {
      const newOrder = {
        id: `order-${Date.now()}`,
        orderNumber: orderForm.orderNumber,
        amount: parseFloat(orderForm.amount),
        shippingCompany: orderForm.shippingCompany || undefined,
        status: 'pending' as const,
        createdAt: new Date(),
      };
      
      // Add the order
      addOrder(selectedContact, newOrder);
      
      // Send automatic notification message using the order confirmation template
      if (orderConfirmationTemplate) {
        let content = orderConfirmationTemplate.content;
        content = content.replace(/\{\{orderNumber\}\}/g, orderForm.orderNumber);
        content = content.replace(/\{\{amount\}\}/g, orderForm.amount);
        content = content.replace(/\{\{shippingCompany\}\}/g, orderForm.shippingCompany || '');
        
        sendMessage(selectedContact, content);
      }
      
      // Reset form
      setOrderForm({
        orderNumber: '',
        amount: '',
        shippingCompany: '',
      });
      setSelectedTemplate(null);
    }
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedContact && returnForm.orderId && returnForm.reason) {
      markOrderAsReturned(selectedContact, returnForm.orderId, returnForm.reason);
      
      // Reset form and hide it
      setReturnForm({
        orderId: '',
        reason: '',
      });
      setShowReturnForm(false);
    }
  };

  const startReturnProcess = (order: Order) => {
    setReturnForm({
      orderId: order.id,
      reason: '',
    });
    setShowReturnForm(true);
  };

  const cancelReturnProcess = () => {
    setReturnForm({
      orderId: '',
      reason: '',
    });
    setShowReturnForm(false);
  };

  const handleTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (templateForm.name && templateForm.content) {
      if (editingTemplate) {
        updateTemplate(templateForm.id, templateForm.name, templateForm.content);
      } else {
        addTemplate({
          id: `template-${Date.now()}`,
          name: templateForm.name,
          content: templateForm.content,
        });
      }
      
      // Reset form
      setTemplateForm({
        id: '',
        name: '',
        content: '',
      });
      setEditingTemplate(false);
    }
  };

  const startEditTemplate = (template: { id: string, name: string, content: string }) => {
    setTemplateForm({
      id: template.id,
      name: template.name,
      content: template.content,
    });
    setEditingTemplate(true);
  };

  const cancelEditTemplate = () => {
    setTemplateForm({
      id: '',
      name: '',
      content: '',
    });
    setEditingTemplate(false);
  };

  const getOrderStatusDisplay = (status: string) => {
    switch (status) {
      case 'shipped':
        return { text: 'Kargoda', classes: 'bg-blue-100 text-blue-800' };
      case 'delivered':
        return { text: 'Teslim Edildi', classes: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { text: 'İptal Edildi', classes: 'bg-red-100 text-red-800' };
      case 'returned':
        return { text: 'İade Edildi', classes: 'bg-purple-100 text-purple-800' };
      default:
        return { text: 'Beklemede', classes: 'bg-yellow-100 text-yellow-800' };
    }
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Müşteri Bilgileri</h2>
        <button
          onClick={() => toggleSidebar()}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === 'labels' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('labels')}
          >
            <div className="flex items-center justify-center">
              <Tag className="h-4 w-4 mr-1" />
              Etiketler
            </div>
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === 'notes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('notes')}
          >
            <div className="flex items-center justify-center">
              <FileText className="h-4 w-4 mr-1" />
              Notlar
            </div>
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            <div className="flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 mr-1" />
              Siparişler
            </div>
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === 'templates' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('templates')}
          >
            <div className="flex items-center justify-center">
              <Send className="h-4 w-4 mr-1" />
              Şablonlar
            </div>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'labels' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Mevcut Etiketler</h3>
            <div className="flex flex-wrap gap-2">
              {contact.labels.map((label) => (
                <div
                  key={label.id}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${label.color} text-white`}
                >
                  {label.name}
                  <button
                    onClick={() => handleRemoveLabel(label.id)}
                    className="ml-1 text-white hover:text-gray-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            
            <h3 className="text-sm font-medium text-gray-700 mt-4">Etiket Ekle</h3>
            <div className="flex flex-wrap gap-2">
              {labels
                .filter((label) => !contact.labels.some((l) => l.id === label.id))
                .map((label) => (
                  <button
                    key={label.id}
                    onClick={() => handleAddLabel(label.id)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${label.color} text-white`}
                  >
                    {label.name}
                  </button>
                ))}
            </div>
          </div>
        )}
        
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Müşteri Notları</h3>
            <textarea
              value={contact.notes || ''}
              onChange={handleNotesChange}
              placeholder="Müşteri hakkında notlar ekleyin..."
              className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Siparişler</h3>
            {contact.orders && contact.orders.length > 0 ? (
              <div className="space-y-3">
                {contact.orders.map((order) => {
                  const statusDisplay = getOrderStatusDisplay(order.status);
                  return (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">
                            {order.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusDisplay.classes}`}
                        >
                          {statusDisplay.text}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>Tutar: {order.amount} TL</p>
                        {order.shippingCompany && (
                          <p>Kargo Firması: {order.shippingCompany}</p>
                        )}
                        {order.status === 'returned' && order.returnReason && (
                          <div className="mt-1 p-2 bg-gray-50 rounded-md">
                            <p className="text-xs font-medium text-gray-700">İade Nedeni:</p>
                            <p className="text-xs text-gray-600">{order.returnReason}</p>
                            {order.returnDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                İade Tarihi: {order.returnDate.toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {(order.status === 'delivered' || order.status === 'shipped') && (
                        <div className="mt-2">
                          <button
                            onClick={() => startReturnProcess(order)}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <RefreshCcw className="h-3 w-3 mr-1" />
                            İade İşlemi
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Henüz sipariş bulunmuyor.</p>
            )}
            
            {showReturnForm && (
              <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-3">İade İşlemi</h3>
                <form onSubmit={handleReturnSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="returnReason" className="block text-sm font-medium text-gray-700">
                      İade Nedeni
                    </label>
                    <textarea
                      id="returnReason"
                      value={returnForm.reason}
                      onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                      placeholder="İade nedenini belirtin..."
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-20"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      İade Onayla
                    </button>
                    <button
                      type="button"
                      onClick={cancelReturnProcess}
                      className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Yeni Sipariş Ekle</h3>
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div>
                  <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700">
                    Sipariş Numarası
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    value={orderForm.orderNumber}
                    onChange={(e) => setOrderForm({ ...orderForm, orderNumber: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Tutar
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={orderForm.amount}
                    onChange={(e) => setOrderForm({ ...orderForm, amount: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="shippingCompany" className="block text-sm font-medium text-gray-700">
                    Kargo Firması
                  </label>
                  <input
                    type="text"
                    id="shippingCompany"
                    value={orderForm.shippingCompany}
                    onChange={(e) => setOrderForm({ ...orderForm, shippingCompany: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                {orderConfirmationTemplate && (
                  <div className="mt-1 text-xs text-gray-500">
                    <p>Sipariş eklendiğinde otomatik olarak bildirim mesajı gönderilecektir.</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Sipariş Ekle
                </button>
              </form>
            </div>
          </div>
        )}
        
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Hazır Mesaj Şablonları</h3>
            
            {/* Template form */}
            <form onSubmit={handleTemplateSubmit} className="border border-gray-200 rounded-lg p-3 space-y-3">
              <div>
                <label htmlFor="templateName" className="block text-sm font-medium text-gray-700">
                  Şablon Adı
                </label>
                <input
                  type="text"
                  id="templateName"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="Örn: Sipariş Bilgisi"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="templateContent" className="block text-sm font-medium text-gray-700">
                  Şablon İçeriği
                </label>
                <textarea
                  id="templateContent"
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  placeholder="Örn: Merhaba, siparişiniz oluşturuldu. Sipariş numaranız: {{orderNumber}}."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-24"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Değişkenler: {'{{orderNumber}}'}, {'{{amount}}'}, {'{{shippingCompany}}'}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingTemplate ? 'Güncelle' : 'Ekle'}
                </button>
                {editingTemplate && (
                  <button
                    type="button"
                    onClick={cancelEditTemplate}
                    className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>
            
            {/* Template list */}
            <div className="space-y-3 mt-4">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900">{template.name}</p>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEditTemplate(template)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeTemplate(template.id)}
                        className="p-1 text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{template.content}</p>
                  <button
                    onClick={() => {
                      if (selectedContact) {
                        let content = template.content;
                        
                        // If there's an order, use its data
                        if (contact.orders && contact.orders.length > 0) {
                          const latestOrder = contact.orders[contact.orders.length - 1];
                          content = content.replace(/\{\{orderNumber\}\}/g, latestOrder.orderNumber);
                          content = content.replace(/\{\{amount\}\}/g, latestOrder.amount.toString());
                          content = content.replace(/\{\{shippingCompany\}\}/g, latestOrder.shippingCompany || '');
                        }
                        
                        sendMessage(selectedContact, content);
                      }
                    }}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Gönder
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}