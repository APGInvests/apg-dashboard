import React, { useState } from 'react';
import { Menu, X, Settings } from 'lucide-react';

export function Navigation({ currentPage, onPageChange, isDarkMode, onToggleDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);

  const pages = [
    { id: 'paycheck', label: 'Paycheck Tracker' },
    { id: 'debt', label: 'Debt Snowball' },
    { id: 'realestate', label: 'Real Estate' },
    { id: 'networth', label: 'Net Worth' },
  ];

  const handlePageClick = (pageId) => {
    onPageChange(pageId);
    setIsOpen(false);
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold">💰 Finance Dashboard</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => handlePageClick(page.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>

          {/* Settings Icon & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handlePageClick('settings')}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => handlePageClick(page.id)}
                className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
