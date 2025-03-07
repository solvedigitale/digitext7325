import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, ShoppingBag, AlertTriangle, Save } from 'lucide-react';

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState({
    newMessage: true,
    newOrder: true,
    returnRequest: true,
    systemAlerts: false,
  });
  
  const [pushNotifications, setPushNotifications] = useState({
    newMessage: true,
    newOrder: true,
    returnRequest: true,
    systemAlerts: true,
  });
  
  const [notificationSounds, setNotificationSounds] = useState({
    newMessage: true,
    newOrder: true,
    returnRequest: true,
    systemAlerts: false,
  });
  
  const [workingHours, setWorkingHours] = useState({
    enabled: false,
    startTime: '09:00',
    endTime: '18:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Notification settings saved successfully!');
    }, 1000);
  };
  
  const toggleDay = (day: number) => {
    setWorkingHours(prev => {
      const newDays = [...prev.daysOfWeek];
      if (newDays.includes(day)) {
        return {
          ...prev,
          daysOfWeek: newDays.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          daysOfWeek: [...newDays, day].sort()
        };
      }
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Email Notifications</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure which notifications are sent to your email
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="email-new-message"
                  type="checkbox"
                  checked={emailNotifications.newMessage}
                  onChange={() => setEmailNotifications({
                    ...emailNotifications,
                    newMessage: !emailNotifications.newMessage
                  })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="email-new-message" className="font-medium text-gray-700">New messages</label>
                <p className="text-gray-500">Receive an email when a new message arrives</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="email-new-order"
                  type="checkbox"
                  checked={emailNotifications.newOrder}
                  onChange={() => setEmailNotifications({
                    ...emailNotifications,
                    newOrder: !emailNotifications.newOrder
                  })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="email-new-order" className="font-medium text-gray-700">New orders</label>
                <p className="text-gray-500">Receive an email when a new order is created</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="email-return-request"
                  type="checkbox"
                  checked={emailNotifications.returnRequest}
                  onChange={() => setEmailNotifications({
                    ...emailNotifications,
                    returnRequest: !emailNotifications.returnRequest
                  })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="email-return-request" className="font-medium text-gray-700">Return requests</label>
                <p className="text-gray-500">Receive an email when a customer requests a return</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="email-system-alerts"
                  type="checkbox"
                  checked={emailNotifications.systemAlerts}
                  onChange={() => setEmailNotifications({
                    ...emailNotifications,
                    systemAlerts: !emailNotifications.systemAlerts
                  })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="email-system-alerts" className="font-medium text-gray-700">System alerts</label>
                <p className="text-gray-500">Receive an email for important system alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Push Notifications</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure which notifications appear in your browser
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="push-new-message"
                  type="checkbox"
                  checked={pushNotifications.newMessage}
                  onChange={() => setPushNotifications({
                    ...pushNotifications,
                    newMessage: !pushNotifications.newMessage
                  })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="push-new-message" className="font-medium text-gray-700">New messages</label>
                <p className="text-gray-500">Show a notification when a new message arrives</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="push-new-order"
                  type="checkbox"
                  checked={pushNotifications.newOrder}
                  onChange={() => setPushNotifications({
                    ...pushNotifications,
                    newOrder: !pushNotifications.newOrder
                  })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="push-new-order" className="font-medium text-gray-700">New orders</label>
                <p className="text-gray-500">Show a notification when a new order is created</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="push-return-request"
                  type="checkbox"
                  checked={pushNotifications.returnRequest}
                  onChange={() => setPushNotifications({
                    ...pushNotifications,
                    returnRequest: !pushNotifications.returnRequest
                  })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="push-return-request" className="font-medium text-gray-700">Return requests</label>
                <p className="text-gray-500">Show a notification when a customer requests a return</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="push-system-alerts"
                  type="checkbox"
                  checked={pushNotifications.systemAlerts}
                  onChange={() => setPushNotifications({
                    ...pushNotifications,
                    systemAlerts: !pushNotifications.systemAlerts
                  })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="push-system-alerts" className="font-medium text-gray-700">System alerts</label>
                <p className="text-gray-500">Show a notification for important system alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Notification Sounds</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure which notifications play a sound
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="sound-new-message"
                  type="checkbox"
                  checked={notificationSounds.newMessage}
                  onChange={() => setNotificationSounds({
                    ...notificationSounds,
                    newMessage: !notificationSounds.newMessage
                  })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="sound-new-message" className="font-medium text-gray-700">New messages</label>
                <p className="text-gray-500">Play a sound when a new message arrives</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="sound-new-order"
                  type="checkbox"
                  checked={notificationSounds.newOrder}
                  onChange={() => setNotificationSounds({
                    ...notificationSounds,
                    newOrder: !notificationSounds.newOrder
                  })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="sound-new-order" className="font-medium text-gray-700">New orders</label>
                <p className="text-gray-500">Play a sound when a new order is created</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="sound-return-request"
                  type="checkbox"
                  checked={notificationSounds.returnRequest}
                  onChange={() => setNotificationSounds({
                    ...notificationSounds,
                    returnRequest: !notificationSounds.returnRequest
                  })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="sound-return-request" className="font-medium text-gray-700">Return requests</label>
                <p className="text-gray-500">Play a sound when a customer requests a return</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="sound-system-alerts"
                  type="checkbox"
                  checked={notificationSounds.systemAlerts}
                  onChange={() => setNotificationSounds({
                    ...notificationSounds,
                    systemAlerts: !notificationSounds.systemAlerts
                  })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="sound-system-alerts" className="font-medium text-gray-700">System alerts</label>
                <p className="text-gray-500">Play a sound for important system alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Working Hours</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure when you want to receive notifications
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="working-hours-enabled"
                  type="checkbox"
                  checked={workingHours.enabled}
                  onChange={() => setWorkingHours({
                    ...workingHours,
                    enabled: !workingHours.enabled
                  })}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="working-hours-enabled" className="font-medium text-gray-700">Only send notifications during working hours</label>
                <p className="text-gray-500">Notifications will be silenced outside of your specified working hours</p>
              </div>
            </div>
            
            {workingHours.enabled && (
              <div className="mt-4 pl-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start-time" className="block text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="start-time"
                      value={workingHours.startTime}
                      onChange={(e) => setWorkingHours({
                        ...workingHours,
                        startTime: e.target.value
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="end-time" className="block text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <input
                      type="time"
                      id="end-time"
                      value={workingHours.endTime}
                      onChange={(e) => setWorkingHours({
                        ...workingHours,
                        endTime: e.target.value
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Working Days
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      { day: 0, label: 'Sun' },
                      { day: 1, label: 'Mon' },
                      { day: 2, label: 'Tue' },
                      { day: 3, label: 'Wed' },
                      { day: 4, label: 'Thu' },
                      { day: 5, label: 'Fri' },
                      { day: 6, label: 'Sat' },
                    ].map(({ day, label }) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                          workingHours.daysOfWeek.includes(day)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}