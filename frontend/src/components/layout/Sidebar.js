import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/drivers', label: 'Șoferi', icon: '👥' },
    { path: '/vehicles', label: 'Vehicule', icon: '🚛' },
    { path: '/holidays', label: 'Concedii', icon: '📅' },
    { path: '/salaries', label: 'Salarii', icon: '💰' },
  ];

  return (
    <div className="bg-gray-800 w-64 min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center px-4 py-2 text-sm rounded-md
                ${location.pathname === item.path
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;