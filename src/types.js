/**
 * Data model types for the Finance Dashboard
 * All data is stored in localStorage and synced via Context
 */

/**
 * @typedef {Object} IncomeData
 * @property {string} pay_frequency - "biweekly" or "monthly"
 * @property {number} average_net_per_check - Net amount per paycheck
 * @property {number} monthly_take_home_estimate - Estimated monthly take-home
 * @property {string} last_paycheck_date - ISO date of last known paycheck (anchor for biweekly cycle)
 */

/**
 * @typedef {Object} BudgetData
 * @property {number} groceries
 * @property {number} restaurants
 * @property {number} phone
 * @property {number} internet
 * @property {number} utilities
 * @property {number} subscriptions_software
 * @property {number} aaa_insurance
 * @property {number} vehicle_maintenance
 * @property {number} pool_service
 * @property {number} baby_household
 * @property {number} personal_fun
 * @property {number} gifts_flexible
 * @property {number} heloc_payment - Monthly HELOC interest-only payment ($900)
 * @property {number} truck_payment - Monthly truck loan payment ($1,000)
 * @property {number} debt_snowball_extra - Extra monthly payment allocated to unsecured debt
 */

/**
 * @typedef {Object} DebtItem
 * @property {string} id - Unique identifier
 * @property {string} name - Debt name (e.g., "Barclays Aviator")
 * @property {number} balance - Current balance owed
 * @property {number} min_payment - Minimum monthly payment
 * @property {number} interest_rate - APR as decimal (0.0 = 0%, 18.74 = 18.74%)
 * @property {string|null} promo_end - ISO date when 0% promo ends
 */

/**
 * @typedef {Object} PropertyItem
 * @property {string} id - Unique identifier
 * @property {string} name - Property name (e.g., "Indio SFH")
 * @property {number} estimated_value - Estimated property value
 * @property {number} primary_mortgage - Primary mortgage/loan balance
 * @property {number} heloc_balance - HELOC/2nd mortgage balance (0 if none)
 * @property {number} mortgage_balance - Total debt: primary_mortgage + heloc_balance (calculated)
 * @property {number} equity - Calculated: estimated_value - mortgage_balance
 * @property {number} monthly_income - Monthly rental income (from renters)
 * @property {number} monthly_expenses - Monthly expenses (taxes, maintenance, insurance, etc)
 * @property {number} reserve_balance - Reserve fund in Basline account for this property
 */

/**
 * @typedef {Object} CashFlowEntry
 * @property {string} id - Unique identifier
 * @property {number} timestamp - Date of entry (Date.now())
 * @property {number} checking_balance - Current checking account balance
 * @property {number} savings_balance - Current savings account balance
 * @property {number} last_paycheck_amount - Amount of last paycheck
 * @property {string} next_paycheck_date - ISO date of next expected paycheck
 * @property {Array<{name: string, amount: number, dueDate: string}>} auto_pays - Upcoming auto-payments in next 2 weeks
 * @property {Array<{description: string, amount: number, dueDate: string}>} irregular_expenses - One-off expenses expected
 * @property {string} notes - Optional notes
 */

/**
 * @typedef {Object} PaycheckEntry
 * @property {string} id - Unique identifier
 * @property {string} date - ISO date of paycheck
 * @property {number} paycheck_number - 1 or 2 (which paycheck in the period)
 * @property {number} paycheck_amount - Amount deposited
 * @property {number} checking_balance - Checking account balance after deposit
 * @property {number} savings_balance - Savings account balance
 * @property {number} allocated_to_debt - Amount allocated to extra debt payment
 * @property {string} notes - Optional notes
 */

/**
 * Root state shape
 * @typedef {Object} FinanceState
 * @property {IncomeData} income
 * @property {BudgetData} budget
 * @property {Array<DebtItem>} debts
 * @property {Array<PropertyItem>} properties
 * @property {Array<CashFlowEntry>} cashFlowHistory - History of bi-weekly snapshots
 * @property {Array<PaycheckEntry>} paycheckHistory - History of biweekly paycheck entries
 * @property {Object} retirementAccounts - {roth_ira: number, four_oh_one_k: number}
 * @property {Object} settings - Dashboard settings
 * @property {Object} settings.accountMinimums - {checking_minimum: number, savings_minimum: number}
 */

// Default empty state
export const defaultFinanceState = {
  income: {
    pay_frequency: "biweekly",
    average_net_per_check: 0,
    monthly_take_home_estimate: 0,
    last_paycheck_date: "2025-11-14",
  },
  budget: {
    groceries: 0,
    restaurants: 0,
    phone: 0,
    internet: 0,
    utilities: 0,
    subscriptions_software: 0,
    aaa_insurance: 0,
    vehicle_maintenance: 0,
    pool_service: 0,
    baby_household: 0,
    personal_fun: 0,
    gifts_flexible: 0,
    heloc_payment: 0,
    truck_payment: 0,
    debt_snowball_extra: 0,
  },
  debts: [],
  properties: [],
  cashFlowHistory: [],
  paycheckHistory: [],
  retirementAccounts: {
    roth_ira: 0,
    four_oh_one_k: 0,
  },
  settings: {
    accountMinimums: {
      checking_minimum: 5000,
      savings_minimum: 3500,
    },
    debtStrategy: {
      strategy: 'snowball', // 'snowball' | 'avalanche' | 'custom'
      customDebtOrder: [], // Array of debt IDs in custom order
    },
  },
};

// Helper: Generate unique IDs
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Helper: Add IDs to items if they don't have them & migrate old property structure
export const ensureIds = (state) => {
  return {
    ...state,
    debts: state.debts.map((d) => ({
      ...d,
      id: d.id || generateId(),
    })),
    properties: state.properties.map((p) => {
      // Migrate old mortgage_balance to new primary_mortgage/heloc structure
      let primary = p.primary_mortgage;
      let heloc = p.heloc_balance;
      let mortgageBalance = p.mortgage_balance;

      // If primary_mortgage is missing, create it from mortgage_balance
      // (only on Indio SFH for backward compatibility)
      if (primary === undefined && p.name === 'Indio SFH') {
        // Indio SFH: split into primary (345k) + HELOC (148.7k)
        primary = 345000;
        heloc = mortgageBalance - 345000;
      } else if (primary === undefined) {
        // Other properties: all debt is primary mortgage
        primary = mortgageBalance || 0;
        heloc = 0;
      }

      return {
        ...p,
        id: p.id || generateId(),
        primary_mortgage: primary,
        heloc_balance: heloc || 0,
        mortgage_balance: primary + (heloc || 0),
        reserve_balance: p.reserve_balance || 0,
      };
    }),
    cashFlowHistory: state.cashFlowHistory.map((c) => ({
      ...c,
      id: c.id || generateId(),
    })),
  };
};
