import React, { useState } from 'react';
import { Search } from 'lucide-react';

function TopNavBar() {
  const [activeTab, setActiveTab] = useState('For You');

  return (
    <div className="fixed top-0 left-0 right-0 bg-black bg-opacity-80 backdrop-blur-sm z-40">
      <div className="flex justify-center items-center py-4">
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => setActiveTab('Following')}
            className={`text-sm transition-colors duration-200 ${
              activeTab === 'Following' ? 'text-white border-b-2 border-white pb-1' : 'text-gray-400'
            }`}
          >
            Following
          </button>
          <button 
            onClick={() => setActiveTab('For You')}
            className={`text-lg font-semibold transition-colors duration-200 ${
              activeTab === 'For You' ? 'text-white border-b-2 border-white pb-1' : 'text-gray-400'
            }`}
          >
            For You
          </button>
        </div>
        <button className="absolute right-4 top-4">
          <Search className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}

export default TopNavBar;