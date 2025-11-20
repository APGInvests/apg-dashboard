import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance, ACTIONS } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { BiweeklyPaycheckTracker } from './components/BiweeklyPaycheckTracker';
import { DebtSnowball } from './components/DebtSnowball';
import { RealEstatePage, NetWorthPage } from './components/PlaceholderPages';
import { RetirementPage } from './components/RetirementPage';
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
    internet: 0,
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
      name: 'Venture One-6209',
      balance: 102.36,
      min_payment: 102,
      interest_rate: 0.0,
      promo_end: '2026-04-13',
      payment_due_day: 10,
    },
    {
      name: 'Barclays Aviator',
      balance: 20000,
      min_payment: 35,
      interest_rate: 0.0,
      promo_end: '2026-06-30',
      payment_due_day: 1,
    },
    {
      name: 'Visa Platinum-9069',
      balance: 17479,
      min_payment: 174,
      interest_rate: 0.0,
      promo_end: '2026-11-17',
      payment_due_day: 17,
    },
    {
      name: 'BOA Travel Rewards 5501',
      balance: 10800,
      min_payment: 35,
      interest_rate: 0.0,
      promo_end: '2026-12-01',
      payment_due_day: 21,
    },
    {
      name: 'Cash Rewards-4127',
      balance: 2682,
      min_payment: 50,
      interest_rate: 20.74,
      promo_end: null,
      payment_due_day: 1,
    },
    {
      name: 'Capital One Spark 2158',
      balance: 1062,
      min_payment: 42,
      interest_rate: 22.0,
      promo_end: null,
      payment_due_day: 10,
    },
    {
      name: 'Amex Bonvoy Business 3009',
      balance: 2914.72,
      min_payment: 35,
      interest_rate: 21.0,
      promo_end: null,
      payment_due_day: 23,
    },
    {
      name: 'BMO RV Personal Loan',
      balance: 19448.07,
      min_payment: 372,
      interest_rate: 6.0,
      promo_end: null,
      payment_due_day: 1,
    },
    {
      name: 'SBA EIDL',
      balance: 3686.59,
      min_payment: 244,
      interest_rate: 3.75,
      promo_end: null,
      payment_due_day: 1,
    },
  ],
  properties: [
    {
      name: 'Indio SFH',
      estimated_value: 530000,
      primary_mortgage: 185678.44,
      heloc_balance: 148739.94,
      mortgage_balance: 334418.38,
      equity: 195581.62,
      monthly_income: 0,
      monthly_expenses: 0,
      reserve_balance: 0,
    },
    {
      name: 'Indio Condo',
      estimated_value: 315000,
      primary_mortgage: 219355.38,
      heloc_balance: 0,
      mortgage_balance: 219355.38,
      equity: 95644.62,
      monthly_income: 0,
      monthly_expenses: 0,
      reserve_balance: 0,
    },
    {
      name: 'Casa Nayarit',
      estimated_value: 700000,
      primary_mortgage: 0,
      heloc_balance: 0,
      mortgage_balance: 0,
      equity: 700000,
      monthly_income: 0,
      monthly_expenses: 0,
      reserve_balance: 0,
    },
  ],
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState('income');
  // Dark mode is now always ON - futuristic theme requires dark-only mode
  const isDarkMode = true;
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

  // Apply dark mode on mount (always dark)
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'income':
        return <BiweeklyPaycheckTracker />;
      case 'debt':
        return <DebtSnowball />;
      case 'realestate':
        return <RealEstatePage />;
      case 'networth':
        return <NetWorthPage />;
      case 'retirement':
        return <RetirementPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <BiweeklyPaycheckTracker />;
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      <main className="bg-cyber-dark min-h-screen md:ml-64 transition-all duration-300 relative z-10">
        {renderPage()}
      </main>
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
