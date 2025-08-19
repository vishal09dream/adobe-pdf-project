
import React, { useState } from 'react';
import { Upload, Library, FileText } from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView, setShowUpload }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'library', icon: Library, label: 'Library' },
    { id: 'viewer', icon: FileText, label: 'Viewer' },
  ];

  const HamburgerIcon = ({ size = 22 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Toggle sidebar"
    >
      <rect y="4" width="22" height="2.5" rx="1.2" fill="#94a3b8" />
      <rect y="9.5" width="22" height="2.5" rx="1.2" fill="#94a3b8" />
      <rect y="15" width="22" height="2.5" rx="1.2" fill="#94a3b8" />
    </svg>
  );

  return (
    <div
      className={`relative h-screen shadow-lg flex flex-col
        transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        overflow-hidden bg-gradient-to-b from-white to-gray-50
        border-r border-gray-200
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Header */}
      <div className="flex items-center border-b border-gray-200 bg-white/70 backdrop-blur-sm relative z-10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="m-3 rounded-lg bg-gray-100 border border-gray-200 p-2 hover:bg-gray-200 transition-colors duration-300"
          tabIndex={0}
          aria-label="Toggle sidebar"
        >
          <HamburgerIcon size={22} />
        </button>
        <div
          className={`flex flex-col overflow-hidden transition-all duration-500 ease-in-out
            ${collapsed
              ? 'opacity-0 max-w-0 p-0 m-0'
              : 'opacity-100 max-w-full px-2 py-3 m-0'}`}
        >
          <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap 
            transition transform hover:scale-105 hover:text-blue-600 hover:drop-shadow-md duration-300 ease-in-out">
            Connecting Dots
          </h1>
          <p className="text-sm text-gray-500 whitespace-nowrap 
            transition hover:text-blue-400 duration-300 ease-in-out">
            Made by UV BOYS
          </p>
        </div>
      </div>

      {/* Upload Button */}
      <div className={`p-4 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${collapsed ? 'px-2' : 'px-4'} relative z-10`}>
        <button
          onClick={() => setShowUpload(true)}
          className={`w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl flex items-center gap-2 py-3
            hover:from-blue-400 hover:to-indigo-400 transition-all duration-300 group
            shadow-md shadow-blue-300/40 hover:shadow-blue-400/60
            ${collapsed ? 'justify-center' : 'px-4'}`}
        >
          <Upload
            size={20}
            className="transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6"
          />
          {!collapsed && 'Upload PDFs'}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-2 relative z-10">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center rounded-lg mb-2 transition-all duration-300 group
              ${currentView === item.id
                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              ${collapsed ? 'justify-center gap-0 px-0 py-3' : 'gap-3 px-3 py-3'}`}
          >
            <item.icon
              size={20}
              className={`transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6 
                ${currentView === item.id ? 'text-blue-600' : ''}`}
            />
            {!collapsed && item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;


