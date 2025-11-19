/**
 * Financial calculation utilities
 */

/**
 * Generate unique IDs
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Calculate total monthly budget spending
 */
export function getTotalMonthlyBudget(budget) {
  return Object.values(budget).reduce((sum, val) => sum + (val || 0), 0);
}

/**
 * Calculate total minimum debt payments
 */
export function getTotalMinimumPayments(debts) {
  return debts.reduce((sum, debt) => sum + (debt.min_payment || 0), 0);
}

/**
 * Calculate total debt balance
 */
export function getTotalDebtBalance(debts) {
  return debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
}

/**
 * Calculate total property equity
 */
export function getTotalPropertyEquity(properties) {
  return properties.reduce((sum, prop) => sum + (prop.equity || 0), 0);
}

/**
 * Calculate total property value
 */
export function getTotalPropertyValue(properties) {
  return properties.reduce((sum, prop) => sum + (prop.estimated_value || 0), 0);
}

/**
 * Calculate total property mortgage balance
 */
export function getTotalMortgageBalance(properties) {
  return properties.reduce(
    (sum, prop) => sum + (prop.mortgage_balance || 0),
    0
  );
}

/**
 * Calculate net worth
 * Net Worth = Cash + Savings + Retirement + Property Equity - Total Debt
 */
export function calculateNetWorth(
  checkingBalance,
  savingsBalance,
  retirementAccounts,
  propertyEquity,
  totalDebt
) {
  const retirement = Object.values(retirementAccounts).reduce(
    (sum, val) => sum + (val || 0),
    0
  );
  return checkingBalance + savingsBalance + retirement + propertyEquity - totalDebt;
}

/**
 * Sort debts by Snowball strategy (smallest balance first)
 * Great for quick psychological wins
 */
export function sortDebtsBySnowball(debts) {
  return [...debts].sort((a, b) => a.balance - b.balance);
}

/**
 * Sort debts by Avalanche strategy (highest interest rate first)
 * Mathematically optimal - saves the most money on interest
 */
export function sortDebtsByAvalanche(debts) {
  return [...debts].sort((a, b) => b.interest_rate - a.interest_rate);
}

/**
 * Debt Snowball Algorithm
 * Returns debts sorted by priority:
 * 1. Debts with 0% interest ending soon (by promo_end date)
 * 2. Debts with high interest rates
 * 3. Debts sorted by balance (smallest first)
 *
 * For each debt, calculates:
 * - months_to_payoff: Estimated months to pay off with current payment + extra
 * - interest_cost: Total interest that will be paid
 * - total_payment: Total amount needed to pay off
 */
export function calculateDebtSnowball(
  debts,
  extraMonthlyPayment = 0,
  monthlyIncome = 7600
) {
  // Filter out paid-off debts and add calculated fields
  let activeDts = debts
    .filter((d) => d.balance > 0)
    .map((debt) => {
      const monthlyRate = debt.interest_rate / 100 / 12;
      const totalMinPayment = debt.min_payment || 0;

      let monthsToPayoff = 0;
      let interestCost = 0;

      if (monthlyRate === 0) {
        // 0% interest: simple division
        monthsToPayoff = Math.ceil(debt.balance / (totalMinPayment || 1));
      } else {
        // Standard amortization formula
        if (totalMinPayment <= debt.balance * monthlyRate) {
          // Payment doesn't cover interest, debt grows - set to 360 months max
          monthsToPayoff = 360;
          interestCost = debt.balance * monthlyRate * 360;
        } else {
          // Normal payoff calculation
          monthsToPayoff = Math.log(
            totalMinPayment / (totalMinPayment - debt.balance * monthlyRate)
          ) / Math.log(1 + monthlyRate);
          monthsToPayoff = Math.ceil(monthsToPayoff);

          // Calculate interest cost
          let balance = debt.balance;
          for (let i = 0; i < monthsToPayoff; i++) {
            const interest = balance * monthlyRate;
            interestCost += interest;
            balance = balance + interest - totalMinPayment;
          }
        }
      }

      return {
        ...debt,
        monthsToPayoff: Math.max(0, monthsToPayoff),
        interestCost: Math.max(0, interestCost),
        totalPaymentNeeded: debt.balance + Math.max(0, interestCost),
      };
    });

  // Sort by snowball priority:
  // 1. 0% interest, sorted by promo end date (earliest first)
  // 2. High interest rates (highest first)
  // 3. Smallest balance first (debt snowball)
  activeDts.sort((a, b) => {
    const aIsZeroPercent = a.interest_rate === 0;
    const bIsZeroPercent = b.interest_rate === 0;

    // 0% interest first
    if (aIsZeroPercent && !bIsZeroPercent) return -1;
    if (!aIsZeroPercent && bIsZeroPercent) return 1;

    // Both 0%: sort by promo end date
    if (aIsZeroPercent && bIsZeroPercent) {
      const aDate = a.promo_end ? new Date(a.promo_end).getTime() : Infinity;
      const bDate = b.promo_end ? new Date(b.promo_end).getTime() : Infinity;
      return aDate - bDate;
    }

    // Both non-0%: higher interest rate first
    if (a.interest_rate !== b.interest_rate) {
      return b.interest_rate - a.interest_rate;
    }

    // Same rate: smallest balance first
    return a.balance - b.balance;
  });

  return activeDts;
}

/**
 * Project debt payoff timeline
 * Shows which debt will be paid off when, given current payments + extra
 */
export function projectDebtPayoff(sortedDebts, monthlyExtra = 0) {
  const timeline = [];
  let remainingExtra = monthlyExtra;

  for (const debt of sortedDebts) {
    if (debt.balance === 0) continue;

    const monthlyPayment = debt.min_payment + remainingExtra;
    const monthlyRate = debt.interest_rate / 100 / 12;

    let balance = debt.balance;
    let months = 0;
    let totalInterest = 0;

    // Simulate month-by-month payoff
    while (balance > 0 && months < 360) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      balance = balance + interest - monthlyPayment;
      months++;
    }

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);

    timeline.push({
      debtName: debt.name,
      monthsToPayoff: months,
      payoffDate: payoffDate.toISOString().split('T')[0],
      totalInterestPaid: totalInterest,
    });

    // Add freed-up minimum payment to extra for next debt
    remainingExtra += debt.min_payment;
  }

  return timeline;
}

/**
 * Calculate "Safe to Spend" for biweekly period
 *
 * Safe to Spend = (Paycheck + Current Checking) - (Emergency Buffer + Auto-Pays + Irregular Expenses)
 */
export function calculateSafeToSpend({
  currentChecking,
  upcomingPaycheck,
  autoPays,
  irregularExpenses,
  emergencyBufferTarget = 5000,
}) {
  const incoming = currentChecking + upcomingPaycheck;
  const autoPayTotal = autoPays.reduce((sum, ap) => sum + (ap.amount || 0), 0);
  const irregularTotal = irregularExpenses.reduce(
    (sum, ie) => sum + (ie.amount || 0),
    0
  );
  const outgoing = autoPayTotal + irregularTotal + emergencyBufferTarget;

  return Math.max(0, incoming - outgoing);
}

/**
 * Determine cashflow status
 * Returns: 'SAFE' | 'TIGHT' | 'ALERT'
 */
export function getCashFlowStatus(safeToSpend, checkingBalance) {
  if (safeToSpend > checkingBalance * 0.5) return 'SAFE';
  if (safeToSpend > 0) return 'TIGHT';
  return 'ALERT';
}

/**
 * Format currency with commas and 2 decimals
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse currency string back to number
 */
export function parseCurrency(str) {
  return parseFloat(str.replace(/[^0-9.-]/g, ''));
}

/**
 * Format date as readable string
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculate days until date
 */
export function daysUntil(dateString) {
  const target = new Date(dateString);
  const today = new Date();
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calculate next paycheck date based on biweekly cycle
 * Given an anchor paycheck date (last known paycheck), calculate the next upcoming payday
 * Assumes paychecks are biweekly (every 14 days)
 *
 * @param {string} anchorDate - ISO date string of a known paycheck date (e.g., "2025-11-14")
 * @param {string} [currentDate] - ISO date string to calculate from (defaults to today)
 * @returns {string} ISO date string of the next payday
 */
export function getNextPaycheckDate(anchorDate, currentDate = null) {
  // Parse dates using the local timezone to avoid UTC offset issues
  const [anchorYear, anchorMonth, anchorDay] = anchorDate.split('-').map(Number);
  const anchor = new Date(anchorYear, anchorMonth - 1, anchorDay);

  let today;
  if (currentDate) {
    const [year, month, day] = currentDate.split('-').map(Number);
    today = new Date(year, month - 1, day);
  } else {
    today = new Date();
    today.setHours(0, 0, 0, 0);
  }

  // Calculate days since anchor
  const daysSinceAnchor = Math.floor(
    (today.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If today is on or after anchor, figure out next paycheck
  let nextPaycheck;
  if (daysSinceAnchor < 0) {
    // Anchor is in the future
    nextPaycheck = anchor;
  } else {
    // Calculate which 14-day cycle we're in
    const daysIntoCurrentCycle = daysSinceAnchor % 14;
    // Days remaining in current cycle
    const daysUntilNextPayday = 14 - daysIntoCurrentCycle;

    nextPaycheck = new Date(today);
    nextPaycheck.setDate(nextPaycheck.getDate() + daysUntilNextPayday);
  }

  // Format as YYYY-MM-DD
  const year = nextPaycheck.getFullYear();
  const month = String(nextPaycheck.getMonth() + 1).padStart(2, '0');
  const day = String(nextPaycheck.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Calculate available overage for debt allocation
 *
 * Overage = (Checking Balance - Checking Minimum) + (Savings Balance - Savings Minimum) - Known Upcoming Expenses
 *
 * @param {number} checkingBalance - Current checking account balance
 * @param {number} savingsBalance - Current savings account balance
 * @param {number} checkingMinimum - Minimum checking account balance to maintain
 * @param {number} savingsMinimum - Minimum savings account balance to maintain
 * @param {number} knownUpcomingExpenses - Fixed expenses coming up (HELOC, truck, minimums, etc.)
 * @returns {number} Available overage (can be negative if not enough buffer)
 */
export function calculateOverage({
  checkingBalance,
  savingsBalance,
  checkingMinimum,
  savingsMinimum,
  knownUpcomingExpenses,
}) {
  const checkingOverage = checkingBalance - (checkingMinimum || 0);
  const savingsOverage = savingsBalance - (savingsMinimum || 0);
  const totalAvailableBuffer = checkingOverage + savingsOverage;

  return Math.max(0, totalAvailableBuffer - (knownUpcomingExpenses || 0));
}

/**
 * Format payment due day to readable text
 * @param {number} day - Day of month (1-31)
 * @returns {string} Formatted text like "Monthly (Every 10th)"
 */
export function formatPaymentDueDay(day) {
  if (!day || day < 1 || day > 31) return '';

  let suffix = 'th';
  if (day === 1 || day === 21 || day === 31) suffix = 'st';
  else if (day === 2 || day === 22) suffix = 'nd';
  else if (day === 3 || day === 23) suffix = 'rd';

  return `Monthly (Every ${day}${suffix})`;
}
