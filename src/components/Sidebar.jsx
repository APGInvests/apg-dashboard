import React, { useState } from 'react';
import {
  Menu, X, Settings, ChevronLeft, ChevronRight,
  DollarSign, CreditCard, Home, Target, TrendingUp
} from 'lucide-react';

export function Sidebar({ currentPage, onPageChange }) {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pages = [
    { id: 'income', label: 'Income', icon: DollarSign },
    { id: 'debt', label: 'Debt', icon: CreditCard },
    { id: 'realestate', label: 'Real Estate', icon: Home },
    { id: 'retirement', label: 'Retirement', icon: Target },
    { id: 'networth', label: 'Net Worth', icon: TrendingUp },
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
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-cyber-card border border-cyber-cyan/30 text-cyber-cyan hover:bg-slate-800/70 hover:border-cyber-cyan/60 transition-all shadow-glow-cyan"
        title="Toggle menu"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <nav
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-cyber-dark to-cyber-card border-r border-slate-700/50 text-white flex flex-col transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-20'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Header with glow effect */}
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-gradient-to-r from-cyber-cyan/5 to-transparent">
          {isOpen && (
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-blue drop-shadow-lg">
              APG
            </h1>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-slate-800/70 text-cyber-cyan hover:text-cyan-300 rounded-lg transition-all duration-300 hidden md:block"
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
          {pages.map((page) => {
            const Icon = page.icon;
            const isActive = currentPage === page.id;
            return (
              <button
                key={page.id}
                onClick={() => handlePageClick(page.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyber-cyan/20 to-cyber-blue/10 text-cyber-cyan border-l-4 border-cyber-cyan shadow-glow-cyan'
                    : 'text-slate-400 hover:text-cyber-cyan hover:bg-slate-800/50 border-l-4 border-transparent'
                }`}
                title={page.label}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isOpen && <span className="font-semibold">{page.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Bottom Section - Settings Only */}
        <div className="border-t border-slate-700/50 p-2 bg-gradient-to-t from-cyber-card/50 to-transparent">
          <button
            onClick={() => handlePageClick('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              currentPage === 'settings'
                ? 'bg-gradient-to-r from-cyber-purple/20 to-cyber-pink/10 text-cyber-purple border-l-4 border-cyber-purple shadow-glow-purple'
                : 'text-slate-400 hover:text-cyber-purple hover:bg-slate-800/50 border-l-4 border-transparent'
            }`}
            title="Settings"
          >
            <Settings size={20} className="flex-shrink-0" />
            {isOpen && <span className="font-semibold">Settings</span>}
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
