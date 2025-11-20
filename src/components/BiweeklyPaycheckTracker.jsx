import React, { useState } from 'react';
import { Wallet, BarChart3, CheckCircle, DollarSign, Plus, Trash2, X } from 'lucide-react';
import { useFinance, ACTIONS } from '../context/FinanceContext';
import { StatCard } from './StatCard';
import {
  calculateOverage,
  formatCurrency,
  generateId,
  getTotalMonthlyBudget,
} from '../utils/calculations';

export function BiweeklyPaycheckTracker() {
  const { state, dispatch } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('paycheck'); // 'paycheck' or 'income'
  const [formData, setFormData] = useState({
    paycheck_date: new Date().toISOString().split('T')[0],
    paycheck_amount: state.income?.average_net_per_check || 0,
    checking_balance: 0,
    savings_balance: 0,
    allocated_to_debt: 0,
    notes: '',
  });
  const [incomeFormData, setIncomeFormData] = useState({
    income_date: new Date().toISOString().split('T')[0],
    income_type: 'bonus',
    income_amount: 0,
    checking_balance: 0,
    savings_balance: 0,
    notes: '',
  });

  const checkingMinimum = state.settings?.accountMinimums?.checking_minimum || 5000;
  const savingsMinimum = state.settings?.accountMinimums?.savings_minimum || 3500;

  // Calculate known upcoming expenses (biweekly portion of monthly budget)
  const totalMonthlyBudget = getTotalMonthlyBudget(state.budget);
  const minimumDebtPayments = state.debts.reduce((sum, d) => sum + (d.min_payment || 0), 0);
  const biweeklyExpenses = (totalMonthlyBudget + minimumDebtPayments) / 2;

  // Calculate overage
  const overage = calculateOverage({
    checkingBalance: parseFloat(formData.checking_balance) || 0,
    savingsBalance: parseFloat(formData.savings_balance) || 0,
    checkingMinimum,
    savingsMinimum,
    knownUpcomingExpenses: biweeklyExpenses,
  });

  const handleSavePaycheck = () => {
    if (!formData.checking_balance) {
      alert('Please enter checking balance');
      return;
    }

    const entry = {
      id: generateId(),
      paycheck_date: formData.paycheck_date,
      date: new Date().toISOString().split('T')[0],
      paycheck_amount: parseFloat(formData.paycheck_amount) || 0,
      checking_balance: parseFloat(formData.checking_balance) || 0,
      savings_balance: parseFloat(formData.savings_balance) || 0,
      allocated_to_debt: parseFloat(formData.allocated_to_debt) || 0,
      notes: formData.notes,
    };

    dispatch({
      type: ACTIONS.ADD_PAYCHECK_ENTRY,
      payload: entry,
    });

    // Reset form
    setFormData({
      paycheck_date: new Date().toISOString().split('T')[0],
      paycheck_amount: state.income?.average_net_per_check || 0,
      checking_balance: 0,
      savings_balance: 0,
      allocated_to_debt: 0,
      notes: '',
    });
    setShowForm(false);

    alert('Paycheck recorded successfully!');
  };

  const handleDeletePaycheck = (id) => {
    if (window.confirm('Delete this paycheck entry?')) {
      dispatch({
        type: ACTIONS.DELETE_PAYCHECK_ENTRY,
        payload: id,
      });
    }
  };

  const handleSaveIncome = () => {
    if (!incomeFormData.income_amount) {
      alert('Please enter income amount');
      return;
    }

    const entry = {
      id: generateId(),
      income_date: incomeFormData.income_date,
      date: new Date().toISOString().split('T')[0],
      income_type: incomeFormData.income_type,
      income_amount: parseFloat(incomeFormData.income_amount) || 0,
      checking_balance: parseFloat(incomeFormData.checking_balance) || 0,
      savings_balance: parseFloat(incomeFormData.savings_balance) || 0,
      notes: incomeFormData.notes,
    };

    dispatch({
      type: ACTIONS.ADD_INCOME_ENTRY,
      payload: entry,
    });

    // Reset form
    setIncomeFormData({
      income_date: new Date().toISOString().split('T')[0],
      income_type: 'bonus',
      income_amount: 0,
      checking_balance: 0,
      savings_balance: 0,
      notes: '',
    });
    setShowForm(false);

    alert('Income recorded successfully!');
  };

  const handleDeleteIncome = (id) => {
    if (window.confirm('Delete this income entry?')) {
      dispatch({
        type: ACTIONS.DELETE_INCOME_ENTRY,
        payload: id,
      });
    }
  };

  // Calculate stats
  const totalAllocated = state.paycheckHistory?.reduce(
    (sum, entry) => sum + (entry.allocated_to_debt || 0),
    0
  ) || 0;

  const totalPaychecks = state.paycheckHistory?.length || 0;
  const expectedAllocation = (state.budget.debt_snowball_extra / 2) * totalPaychecks;
  const allocationStatus = totalAllocated >= expectedAllocation ? 'On Track' : 'Below Target';

  return (
    <div className="max-w-6xl mx-auto page-container">
      <div className="mb-8">
        <div className="pb-4 border-b-2 border-gray-200">
          <h1 className="text-5xl font-bold text-navy mt-0">
            Income Dashboard
          </h1>
        </div>
        <p className="text-gray-600 mt-4 text-lg">
          Track paychecks, bonuses, and other income sources
        </p>
      </div>

      {/* Summary Cards - Futuristic Glass Effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-stagger">
        <StatCard
          icon={<Wallet size={24} />}
          label="Total Allocated to Debt"
          value={formatCurrency(totalAllocated)}
          subtext={`${totalPaychecks} paycheck${totalPaychecks !== 1 ? 's' : ''} recorded`}
          accentColor="green"
        />

        <StatCard
          icon={<BarChart3 size={24} />}
          label="Expected (2x/month)"
          value={formatCurrency(expectedAllocation)}
          subtext={`$${state.budget.debt_snowball_extra}/mo target`}
          accentColor="teal"
        />

        <StatCard
          icon={<CheckCircle size={24} />}
          label="Status"
          value={allocationStatus}
          subtext={
            expectedAllocation > totalAllocated
              ? `${formatCurrency(expectedAllocation - totalAllocated)} behind`
              : 'Ahead of schedule'
          }
          accentColor={allocationStatus === 'On Track' ? 'green' : 'pink'}
        />

        <StatCard
          icon={<DollarSign size={24} />}
          label="Account Minimums"
          value={formatCurrency(checkingMinimum + savingsMinimum)}
          subtext={`Checking $${checkingMinimum.toLocaleString()} + Savings $${savingsMinimum.toLocaleString()}`}
          accentColor="cyan"
        />
      </div>

      {/* Entry Form */}
      {showForm ? (
        <div className="card mb-8 p-6 animate-fade-in">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setFormType('paycheck')}
              className={`tab ${
                formType === 'paycheck'
                  ? 'active border-primary text-primary'
                  : 'text-gray-600 border-transparent hover:text-primary'
              }`}
            >
              Paycheck
            </button>
            <button
              onClick={() => setFormType('income')}
              className={`tab ${
                formType === 'income'
                  ? 'active border-primary text-primary'
                  : 'text-gray-600 border-transparent hover:text-primary'
              }`}
            >
              Other Income
            </button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {formType === 'paycheck' ? 'Record Paycheck' : 'Record Income'}
          </h2>

          {formType === 'paycheck' ? (
            // PAYCHECK FORM
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="form-group">
                <label className="label">Paycheck Amount</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <input
                    type="number"
                    className="input flex-1"
                    value={formData.paycheck_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, paycheck_amount: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Paycheck Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.paycheck_date}
                  onChange={(e) =>
                    setFormData({ ...formData, paycheck_date: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500 mt-2">
                  When you received this paycheck
                </p>
              </div>
            </div>
          ) : (
            // INCOME FORM
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="form-group">
                <label className="label">Income Amount</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <input
                    type="number"
                    className="input flex-1"
                    value={incomeFormData.income_amount}
                    onChange={(e) =>
                      setIncomeFormData({ ...incomeFormData, income_amount: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Income Type</label>
                <select
                  className="input"
                  value={incomeFormData.income_type}
                  onChange={(e) =>
                    setIncomeFormData({ ...incomeFormData, income_type: e.target.value })
                  }
                >
                  <option value="bonus">Bonus</option>
                  <option value="tax_return">Tax Return</option>
                  <option value="side_income">Side Income</option>
                  <option value="investment">Investment Income</option>
                  <option value="gift">Gift</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group md:col-span-2">
                <label className="label">Income Date</label>
                <input
                  type="date"
                  className="input"
                  value={incomeFormData.income_date}
                  onChange={(e) =>
                    setIncomeFormData({ ...incomeFormData, income_date: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500 mt-2">
                  When you received this income
                </p>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Account Balances</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="form-group">
                <label className="label">Checking Balance</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <input
                    type="number"
                    className="input flex-1"
                    value={formType === 'paycheck' ? formData.checking_balance : incomeFormData.checking_balance}
                    onChange={(e) => {
                      if (formType === 'paycheck') {
                        setFormData({ ...formData, checking_balance: e.target.value });
                      } else {
                        setIncomeFormData({ ...incomeFormData, checking_balance: e.target.value });
                      }
                    }}
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Minimum: ${checkingMinimum.toLocaleString()}
                </p>
              </div>

              <div className="form-group">
                <label className="label">Savings Balance</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <input
                    type="number"
                    className="input flex-1"
                    value={formType === 'paycheck' ? formData.savings_balance : incomeFormData.savings_balance}
                    onChange={(e) => {
                      if (formType === 'paycheck') {
                        setFormData({ ...formData, savings_balance: e.target.value });
                      } else {
                        setIncomeFormData({ ...incomeFormData, savings_balance: e.target.value });
                      }
                    }}
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Minimum: ${savingsMinimum.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Overage Calculation - Only for Paycheck */}
            {formType === 'paycheck' && (
              <div className="card border border-gray-200 p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Checking Overage:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(
                        Math.max(0, (parseFloat(formData.checking_balance) || 0) - checkingMinimum)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Savings Overage:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(
                        Math.max(0, (parseFloat(formData.savings_balance) || 0) - savingsMinimum)
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="text-gray-700">Known Upcoming Expenses (biweekly):</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(biweeklyExpenses)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between bg-green-50 p-2 rounded">
                    <span className="font-bold text-gray-900">Available for Debt:</span>
                    <span className="font-bold text-green-700">
                      {formatCurrency(overage)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Allocation Section - Only for Paycheck */}
          {formType === 'paycheck' && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Allocation</h3>

              <div className="form-group mb-4">
                <label className="label">Allocate to Debt</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <input
                    type="number"
                    className="input flex-1"
                    value={formData.allocated_to_debt}
                    onChange={(e) =>
                      setFormData({ ...formData, allocated_to_debt: e.target.value })
                    }
                    placeholder="0"
                    max={overage}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Max available: {formatCurrency(overage)}
                </p>
              </div>

              <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded text-sm">
                <p className="text-slate-700 dark:text-slate-300">
                  Remaining Buffer: <span className="font-bold">{formatCurrency(overage - (parseFloat(formData.allocated_to_debt) || 0))}</span>
                </p>
              </div>
            </div>
          )}

          <div className="form-group mb-6">
            <label className="label">Notes (Optional)</label>
            <textarea
              className="input h-20"
              value={formType === 'paycheck' ? formData.notes : incomeFormData.notes}
              onChange={(e) => {
                if (formType === 'paycheck') {
                  setFormData({ ...formData, notes: e.target.value });
                } else {
                  setIncomeFormData({ ...incomeFormData, notes: e.target.value });
                }
              }}
              placeholder={formType === 'paycheck' ? "Holiday pay, bonus, budget notes, etc." : "Where the income came from, how it was split, etc."}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={formType === 'paycheck' ? handleSavePaycheck : handleSaveIncome}
              className="btn-primary flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Save {formType === 'paycheck' ? 'Paycheck' : 'Income'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => {
              setFormType('paycheck');
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Record Paycheck
          </button>
          <button
            onClick={() => {
              setFormType('income');
              setShowForm(true);
            }}
            className="btn-secondary flex items-center gap-2"
          >
            + Record Income
          </button>
        </div>
      )}

      {/* Paycheck History */}
      {state.paycheckHistory && state.paycheckHistory.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Paychecks</h2>
          <div className="space-y-3">
            {[...state.paycheckHistory].reverse().map((entry) => (
              <div
                key={entry.id}
                className="card border border-gray-200 p-4 rounded-lg flex items-center justify-between hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {new Date(entry.paycheck_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Logged: {new Date(entry.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Checking: {formatCurrency(entry.checking_balance)} | Savings: {formatCurrency(entry.savings_balance)}
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 italic">
                      Note: {entry.notes}
                    </p>
                  )}
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold text-success">
                    {formatCurrency(entry.allocated_to_debt)} to debt
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePaycheck(entry.id)}
                  className="text-error hover:text-error/70 p-2 rounded-lg hover:bg-red-50 transition-all"
                  title="Delete paycheck"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Income History */}
      {state.incomeHistory && state.incomeHistory.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Income</h2>
          <div className="space-y-3">
            {[...state.incomeHistory].reverse().map((entry) => (
              <div
                key={entry.id}
                className="card border border-gray-200 p-4 rounded-lg flex items-center justify-between hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {new Date(entry.income_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' '}
                    <span className="text-sm font-normal text-gray-500">
                      ({entry.income_type?.replace(/_/g, ' ')})
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Logged: {new Date(entry.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Checking: {formatCurrency(entry.checking_balance)} | Savings: {formatCurrency(entry.savings_balance)}
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 italic">
                      Note: {entry.notes}
                    </p>
                  )}
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold text-primary">
                    {formatCurrency(entry.income_amount)} income
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteIncome(entry.id)}
                  className="text-error hover:text-error/70 p-2 rounded-lg hover:bg-red-50 transition-all"
                  title="Delete income"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
