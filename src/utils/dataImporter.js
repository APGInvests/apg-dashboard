import { generateId, defaultFinanceState } from '../types';

/**
 * Import seed JSON data and merge with existing state
 * Called on first app load or when user imports data
 */
export function importSeedData(seedData) {
  try {
    const state = defaultFinanceState;

    // Import income
    if (seedData.income) {
      state.income = {
        pay_frequency: seedData.income.pay_frequency || 'biweekly',
        average_net_per_check: seedData.income.average_net_per_check || 0,
        monthly_take_home_estimate: seedData.income.monthly_take_home_estimate || 0,
      };
    }

    // Import budget
    if (seedData.budget) {
      state.budget = { ...state.budget, ...seedData.budget };
    }

    // Import debts with IDs
    if (Array.isArray(seedData.debts)) {
      state.debts = seedData.debts.map((debt) => ({
        id: debt.id || generateId(),
        name: debt.name || '',
        balance: debt.balance || 0,
        min_payment: debt.min_payment || 0,
        interest_rate: debt.interest_rate || 0,
        promo_end: debt.promo_end || null,
      }));
    }

    // Import properties with IDs
    if (Array.isArray(seedData.properties)) {
      state.properties = seedData.properties.map((prop) => ({
        id: prop.id || generateId(),
        name: prop.name || '',
        estimated_value: prop.estimated_value || 0,
        mortgage_balance: prop.mortgage_balance || 0,
        equity: prop.equity || 0,
        monthly_income: prop.monthly_income || 0,
        monthly_expenses: prop.monthly_expenses || 0,
      }));
    }

    // Import retirement accounts if provided
    if (seedData.retirementAccounts) {
      state.retirementAccounts = seedData.retirementAccounts;
    }

    return state;
  } catch (error) {
    console.error('Error importing seed data:', error);
    return defaultFinanceState;
  }
}

/**
 * Export current state as JSON for backup
 */
export function exportStateAsJSON(state) {
  return JSON.stringify(state, null, 2);
}

/**
 * Parse JSON string into state object
 */
export function parseImportJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Invalid JSON:', error);
    throw new Error('Invalid JSON format');
  }
}
