import React, { useState } from 'react';
import { Home, Users, Plus, MessageCircle, User } from 'lucide-react';

function BottomNavBar() {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'friends', icon: Users, label: 'Friends' },
    { id: 'create', icon: Plus, label: '', isCreate: true },
    { id: 'inbox', icon: MessageCircle, label: 'Inbox' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-2 py-1 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          
          if (item.isCreate) {
            return (
              <button key={item.id} className="relative">
                <div className="w-12 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-2 px-3 transition-colors duration-200 ${
                activeTab === item.id ? 'text-white' : 'text-gray-400'
              }`}
            >
              <IconComponent className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BottomNavBar;