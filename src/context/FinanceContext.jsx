import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { defaultFinanceState, ensureIds } from '../types';

const FinanceContext = createContext(null);

// Action types
export const ACTIONS = {
  // Income
  UPDATE_INCOME: 'UPDATE_INCOME',

  // Budget
  UPDATE_BUDGET: 'UPDATE_BUDGET',
  ADD_BUDGET_CATEGORY: 'ADD_BUDGET_CATEGORY',
  DELETE_BUDGET_CATEGORY: 'DELETE_BUDGET_CATEGORY',
  RENAME_BUDGET_CATEGORY: 'RENAME_BUDGET_CATEGORY',

  // Debts
  ADD_DEBT: 'ADD_DEBT',
  UPDATE_DEBT: 'UPDATE_DEBT',
  DELETE_DEBT: 'DELETE_DEBT',

  // Properties
  ADD_PROPERTY: 'ADD_PROPERTY',
  UPDATE_PROPERTY: 'UPDATE_PROPERTY',
  DELETE_PROPERTY: 'DELETE_PROPERTY',

  // Cash Flow
  ADD_CASH_FLOW_ENTRY: 'ADD_CASH_FLOW_ENTRY',
  UPDATE_CASH_FLOW_ENTRY: 'UPDATE_CASH_FLOW_ENTRY',
  DELETE_CASH_FLOW_ENTRY: 'DELETE_CASH_FLOW_ENTRY',

  // Paycheck History
  ADD_PAYCHECK_ENTRY: 'ADD_PAYCHECK_ENTRY',
  UPDATE_PAYCHECK_ENTRY: 'UPDATE_PAYCHECK_ENTRY',
  DELETE_PAYCHECK_ENTRY: 'DELETE_PAYCHECK_ENTRY',

  // Income History
  ADD_INCOME_ENTRY: 'ADD_INCOME_ENTRY',
  UPDATE_INCOME_ENTRY: 'UPDATE_INCOME_ENTRY',
  DELETE_INCOME_ENTRY: 'DELETE_INCOME_ENTRY',

  // Settings
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UPDATE_DEBT_STRATEGY: 'UPDATE_DEBT_STRATEGY',
  UPDATE_DEBT_ORDER: 'UPDATE_DEBT_ORDER',

  // Retirement
  UPDATE_RETIREMENT_ACCOUNTS: 'UPDATE_RETIREMENT_ACCOUNTS',

  // Bulk
  LOAD_STATE: 'LOAD_STATE',
  RESET_STATE: 'RESET_STATE',
};

function financeReducer(state, action) {
  switch (action.type) {
    case ACTIONS.UPDATE_INCOME:
      return {
        ...state,
        income: { ...state.income, ...action.payload },
      };

    case ACTIONS.UPDATE_BUDGET:
      return {
        ...state,
        budget: { ...state.budget, ...action.payload },
      };

    case ACTIONS.ADD_BUDGET_CATEGORY:
      return {
        ...state,
        budget: {
          ...state.budget,
          [action.payload.key]: action.payload.value || 0,
        },
        budgetCategories: [
          ...(state.budgetCategories || []),
          { key: action.payload.key, label: action.payload.label },
        ],
      };

    case ACTIONS.DELETE_BUDGET_CATEGORY:
      const { [action.payload]: deleted, ...remainingBudget } = state.budget;
      return {
        ...state,
        budget: remainingBudget,
        budgetCategories: (state.budgetCategories || []).filter(
          (cat) => cat.key !== action.payload
        ),
      };

    case ACTIONS.RENAME_BUDGET_CATEGORY:
      return {
        ...state,
        budgetCategories: (state.budgetCategories || []).map((cat) =>
          cat.key === action.payload.key
            ? { ...cat, label: action.payload.newLabel }
            : cat
        ),
      };

    case ACTIONS.ADD_DEBT:
      return {
        ...state,
        debts: [...state.debts, action.payload],
      };

    case ACTIONS.UPDATE_DEBT:
      return {
        ...state,
        debts: state.debts.map((d) =>
          d.id === action.payload.id ? { ...d, ...action.payload.updates } : d
        ),
      };

    case ACTIONS.DELETE_DEBT:
      return {
        ...state,
        debts: state.debts.filter((d) => d.id !== action.payload),
      };

    case ACTIONS.ADD_PROPERTY:
      return {
        ...state,
        properties: [...state.properties, action.payload],
      };

    case ACTIONS.UPDATE_PROPERTY:
      return {
        ...state,
        properties: state.properties.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };

    case ACTIONS.DELETE_PROPERTY:
      return {
        ...state,
        properties: state.properties.filter((p) => p.id !== action.payload),
      };

    case ACTIONS.ADD_CASH_FLOW_ENTRY:
      return {
        ...state,
        cashFlowHistory: [...state.cashFlowHistory, action.payload],
      };

    case ACTIONS.UPDATE_CASH_FLOW_ENTRY:
      return {
        ...state,
        cashFlowHistory: state.cashFlowHistory.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      };

    case ACTIONS.DELETE_CASH_FLOW_ENTRY:
      return {
        ...state,
        cashFlowHistory: state.cashFlowHistory.filter(
          (c) => c.id !== action.payload
        ),
      };

    case ACTIONS.ADD_PAYCHECK_ENTRY:
      return {
        ...state,
        paycheckHistory: [...state.paycheckHistory, action.payload],
      };

    case ACTIONS.UPDATE_PAYCHECK_ENTRY:
      return {
        ...state,
        paycheckHistory: state.paycheckHistory.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };

    case ACTIONS.DELETE_PAYCHECK_ENTRY:
      return {
        ...state,
        paycheckHistory: state.paycheckHistory.filter(
          (p) => p.id !== action.payload
        ),
      };

    case ACTIONS.ADD_INCOME_ENTRY:
      return {
        ...state,
        incomeHistory: [...state.incomeHistory, action.payload],
      };

    case ACTIONS.UPDATE_INCOME_ENTRY:
      return {
        ...state,
        incomeHistory: state.incomeHistory.map((i) =>
          i.id === action.payload.id ? { ...i, ...action.payload.updates } : i
        ),
      };

    case ACTIONS.DELETE_INCOME_ENTRY:
      return {
        ...state,
        incomeHistory: state.incomeHistory.filter(
          (i) => i.id !== action.payload
        ),
      };

    case ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case ACTIONS.UPDATE_DEBT_STRATEGY:
      return {
        ...state,
        settings: {
          ...state.settings,
          debtStrategy: {
            ...state.settings.debtStrategy,
            strategy: action.payload,
            customDebtOrder: [],
          },
        },
      };

    case ACTIONS.UPDATE_DEBT_ORDER:
      return {
        ...state,
        settings: {
          ...state.settings,
          debtStrategy: {
            ...state.settings.debtStrategy,
            customDebtOrder: action.payload,
          },
        },
      };

    case ACTIONS.UPDATE_RETIREMENT_ACCOUNTS:
      return {
        ...state,
        retirementAccounts: {
          ...state.retirementAccounts,
          ...action.payload,
        },
      };

    case ACTIONS.LOAD_STATE:
      return ensureIds(action.payload);

    case ACTIONS.RESET_STATE:
      return defaultFinanceState;

    default:
      return state;
  }
}

// Load initial state from localStorage
function loadInitialState() {
  try {
    const stored = localStorage.getItem('finance_dashboard_state');
    if (stored) {
      return ensureIds(JSON.parse(stored));
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
  }
  return defaultFinanceState;
}

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(financeReducer, defaultFinanceState, loadInitialState);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('finance_dashboard_state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }, [state]);

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      {children}
    </FinanceContext.Provider>
  );
}

// Custom hook to use finance context
export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
