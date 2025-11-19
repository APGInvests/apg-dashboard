import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance, ACTIONS } from './context/FinanceContext';
import { Navigation } from './components/Navigation';
import { BiweeklyPaycheckTracker } from './components/BiweeklyPaycheckTracker';
import { DebtSnowball } from './components/DebtSnowball';
import { RealEstatePage, NetWorthPage } from './components/PlaceholderPages';
import { SettingsPage } from './components/Settings';
import { importSeedData } from './utils/dataImporter';
import './index.css';

// Seed data - will be loaded on first run
const SEED_DATA = {
  income: {
    pay_frequency: 'biweekly',
    average_net_per_check: 3800,
    monthly_take_home_estimate: 7600,
    last_paycheck_date: '2025-11-14',
  },
  budget: {
    groceries: 1000,
    restaurants: 300,
    phone: 240,
    internet: 70,
    utilities: 50,
    subscriptions_software: 400,
    aaa_insurance: 200,
    vehicle_maintenance: 50,
    pool_service: 165,
    baby_household: 200,
    personal_fun: 200,
    gifts_flexible: 200,
    truck_payment: 1000,
    debt_snowball_extra: 2000,
  },
  debts: [
    {
      name: 'Barclays Aviator',
      balance: 20000,
      min_payment: 35,
      interest_rate: 0.0,
      promo_end: '2026-07-01',
    },
    {
      name: 'BOA Travel Rewards 5501',
      balance: 10800,
      min_payment: 35,
      interest_rate: 0.0,
      promo_end: '2026-11-30',
    },
    {
      name: 'Capital One Spark 2158',
      balance: 3500,
      min_payment: 50,
      interest_rate: 0.0,
      promo_end: null,
    },
    {
      name: 'Amex Bonvoy Business 3009',
      balance: 2914.72,
      min_payment: 50,
      interest_rate: 18.74,
      promo_end: null,
    },
    {
      name: 'Chase Ink',
      balance: 0,
      min_payment: 0,
      interest_rate: 29.99,
      promo_end: null,
    },
    {
      name: 'BMO RV Personal Loan',
      balance: 19448.07,
      min_payment: 372,
      interest_rate: 6.0,
      promo_end: null,
    },
    {
      name: 'SBA EIDL',
      balance: 3686.59,
      min_payment: 244,
      interest_rate: 3.75,
      promo_end: null,
    },
  ],
  properties: [
    {
      name: 'Indio SFH',
      estimated_value: 560000,
      primary_mortgage: 345000,
      heloc_balance: 148739.94,
      mortgage_balance: 493739.94,
      equity: 66260.06,
      monthly_income: 0,
      monthly_expenses: 0,
      reserve_balance: 0,
    },
    {
      name: 'Indio Condo',
      estimated_value: 315000,
      primary_mortgage: 245000,
      heloc_balance: 0,
      mortgage_balance: 245000,
      equity: 70000,
      monthly_income: 0,
      monthly_expenses: 0,
      reserve_balance: 0,
    },
    {
      name: 'Casa Nayarit',
      estimated_value: 350000,
      primary_mortgage: 0,
      heloc_balance: 0,
      mortgage_balance: 0,
      equity: 350000,
      monthly_income: 0,
      monthly_expenses: 0,
      reserve_balance: 0,
    },
  ],
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState('paycheck');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load dark mode preference from localStorage
    try {
      const saved = localStorage.getItem('finance_dashboard_dark_mode');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const { state, dispatch } = useFinance();

  // Initialize with seed data on first load
  useEffect(() => {
    if (isFirstLoad && state.debts.length === 0) {
      const seedState = importSeedData(SEED_DATA);
      dispatch({
        type: ACTIONS.LOAD_STATE,
        payload: seedState,
      });
      setIsFirstLoad(false);
    }
  }, [isFirstLoad, state.debts.length, dispatch]);

  // Apply and persist dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    // Persist to localStorage
    try {
      localStorage.setItem('finance_dashboard_dark_mode', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Failed to save dark mode preference:', error);
    }
  }, [isDarkMode]);

  const renderPage = () => {
    switch (currentPage) {
      case 'paycheck':
        return <BiweeklyPaycheckTracker />;
      case 'debt':
        return <DebtSnowball />;
      case 'realestate':
        return <RealEstatePage />;
      case 'networth':
        return <NetWorthPage />;
      case 'settings':
        return <SettingsPage isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />;
      default:
        return <BiweeklyPaycheckTracker />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
        <Navigation
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <main className="bg-slate-50 dark:bg-slate-900 min-h-screen">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}

export default App;
