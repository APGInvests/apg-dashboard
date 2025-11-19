import React, { useState } from 'react';
import { Menu, X, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

export function Sidebar({ currentPage, onPageChange, isDarkMode, onToggleDarkMode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pages = [
    { id: 'income', label: 'Income', icon: '💼' },
    { id: 'debt', label: 'Debt', icon: '💳' },
    { id: 'realestate', label: 'Real Estate', icon: '🏠' },
    { id: 'networth', label: 'Net Worth', icon: '📊' },
    { id: 'retirement', label: 'Retirement', icon: '🎯' },
  ];

  const handlePageClick = (pageId) => {
    onPageChange(pageId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        title="Toggle menu"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <nav
        className={`fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-20'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {isOpen && <h1 className="text-xl font-bold">APG</h1>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors hidden md:block"
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => handlePageClick(page.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === page.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title={page.label}
            >
              <span className="text-xl flex-shrink-0">{page.icon}</span>
              {isOpen && <span className="font-medium">{page.label}</span>}
            </button>
          ))}
        </div>

        {/* Bottom Section - Settings & Theme Toggle */}
        <div className="border-t border-slate-800 p-2 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            <span className="text-xl flex-shrink-0">{isDarkMode ? '☀️' : '🌙'}</span>
            {isOpen && <span className="font-medium text-sm">{isDarkMode ? 'Light' : 'Dark'}</span>}
          </button>

          {/* Settings */}
          <button
            onClick={() => handlePageClick('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === 'settings'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Settings"
          >
            <Settings size={20} className="flex-shrink-0" />
            {isOpen && <span className="font-medium">Settings</span>}
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content Wrapper - adds margin on desktop when sidebar is open */}
      <div
        className={`transition-all duration-300 ${
          isOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
        style={{ minHeight: '100vh' }}
      />
    </>
  );
}
