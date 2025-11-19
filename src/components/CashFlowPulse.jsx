import React, { useState, useEffect } from 'react';
import { useFinance, ACTIONS } from '../context/FinanceContext';
import {
  calculateSafeToSpend,
  getCashFlowStatus,
  getTotalMonthlyBudget,
  formatCurrency,
  generateId,
  getNextPaycheckDate,
} from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function CashFlowPulse() {
  const { state, dispatch } = useFinance();
  const [showForm, setShowForm] = useState(false);

  // Form state for new entry
  const [formData, setFormData] = useState({
    checking_balance: 0,
    savings_balance: 0,
    last_paycheck_amount: state.income?.average_net_per_check || 0,
    next_paycheck_date: getNextPaycheckDate(state.income?.last_paycheck_date || '2025-11-14'),
    auto_pays: [],
    irregular_expenses: [],
    notes: '',
  });

  const [newAutoPay, setNewAutoPay] = useState({ name: '', amount: 0, dueDate: '' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: 0, dueDate: '' });

  // Get latest cash flow entry
  const latestEntry = state.cashFlowHistory?.[state.cashFlowHistory.length - 1];

  // Calculate metrics
  const safeToSpend = calculateSafeToSpend({
    currentChecking: formData.checking_balance,
    upcomingPaycheck: formData.last_paycheck_amount,
    autoPays: formData.auto_pays,
    irregularExpenses: formData.irregular_expenses,
  });

  const status = getCashFlowStatus(safeToSpend, formData.checking_balance);
  const totalMonthlyBudget = getTotalMonthlyBudget(state.budget);
  const biweeklyBudget = totalMonthlyBudget / 2;

  // Calculate estimated month-end balance
  const daysUntilNextPaycheck = getDaysUntil(formData.next_paycheck_date);
  const biweeklyDays = 14;
  const monthEndEstimate =
    formData.checking_balance +
    formData.last_paycheck_amount * 2 -
    formData.auto_pays.reduce((sum, ap) => sum + (ap.amount || 0), 0) * 2 -
    formData.irregular_expenses.reduce((sum, ie) => sum + (ie.amount || 0), 0) -
    biweeklyBudget * 2;

  function getDaysUntil(dateString) {
    const target = new Date(dateString);
    const today = new Date();
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const handleAddAutoPay = () => {
    if (newAutoPay.name && newAutoPay.amount > 0) {
      setFormData({
        ...formData,
        auto_pays: [...formData.auto_pays, { ...newAutoPay }],
      });
      setNewAutoPay({ name: '', amount: 0, dueDate: '' });
    }
  };

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount > 0) {
      setFormData({
        ...formData,
        irregular_expenses: [...formData.irregular_expenses, { ...newExpense }],
      });
      setNewExpense({ description: '', amount: 0, dueDate: '' });
    }
  };

  const handleRemoveAutoPay = (index) => {
    setFormData({
      ...formData,
      auto_pays: formData.auto_pays.filter((_, i) => i !== index),
    });
  };

  const handleRemoveExpense = (index) => {
    setFormData({
      ...formData,
      irregular_expenses: formData.irregular_expenses.filter((_, i) => i !== index),
    });
  };

  const handleSaveEntry = () => {
    const entry = {
      id: generateId(),
      timestamp: Date.now(),
      checking_balance: parseFloat(formData.checking_balance) || 0,
      savings_balance: parseFloat(formData.savings_balance) || 0,
      last_paycheck_amount: parseFloat(formData.last_paycheck_amount) || 0,
      next_paycheck_date: formData.next_paycheck_date,
      auto_pays: formData.auto_pays,
      irregular_expenses: formData.irregular_expenses,
      notes: formData.notes,
    };

    dispatch({
      type: ACTIONS.ADD_CASH_FLOW_ENTRY,
      payload: entry,
    });

    // Reset form
    setFormData({
      checking_balance: 0,
      savings_balance: 0,
      last_paycheck_amount: state.income?.average_net_per_check || 0,
      next_paycheck_date: getNextPaycheckDate(state.income?.last_paycheck_date || '2025-11-14'),
      auto_pays: [],
      irregular_expenses: [],
      notes: '',
    });
    setShowForm(false);
  };

  // Chart data
  const chartData = state.cashFlowHistory
    ?.slice(-8)
    .map((entry) => ({
      date: new Date(entry.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      checking: entry.checking_balance,
      savings: entry.savings_balance,
    }));

  const statusColors = {
    SAFE: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    TIGHT: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    ALERT: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1>Cash Flow Pulse (Biweekly)</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Your financial snapshot for the next 14 days
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Safe to Spend */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Safe to Spend
          </h3>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {formatCurrency(safeToSpend)}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            After buffer & auto-pays
          </p>
        </div>

        {/* Status */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Status
          </h3>
          <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${statusColors[status]}`}>
            {status}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
            {status === 'SAFE' && 'You have good breathing room'}
            {status === 'TIGHT' && 'Watch spending carefully'}
            {status === 'ALERT' && 'Critical: prioritize essentials'}
          </p>
        </div>

        {/* Month-End Estimate */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Est. Month-End Balance
          </h3>
          <div className={`text-4xl font-bold ${monthEndEstimate > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(monthEndEstimate)}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Checking + 2 paychecks - expenses
          </p>
        </div>
      </div>

      {/* Current Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Current Balances</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Checking Balance</label>
              <input
                type="number"
                className="input"
                value={formData.checking_balance}
                onChange={(e) =>
                  setFormData({ ...formData, checking_balance: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Savings Balance</label>
              <input
                type="number"
                className="input"
                value={formData.savings_balance}
                onChange={(e) =>
                  setFormData({ ...formData, savings_balance: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Next Paycheck</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Amount</label>
              <input
                type="number"
                className="input"
                value={formData.last_paycheck_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    last_paycheck_amount: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="label">Expected Date</label>
              <input
                type="date"
                className="input"
                value={formData.next_paycheck_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    next_paycheck_date: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Pays */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold mb-4">Auto-Pays (Next 2 Weeks)</h3>
        {formData.auto_pays.length > 0 && (
          <div className="mb-4 space-y-2">
            {formData.auto_pays.map((ap, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{ap.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{ap.dueDate}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold">{formatCurrency(ap.amount)}</span>
                  <button
                    onClick={() => handleRemoveAutoPay(idx)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-3">
              Total: {formatCurrency(
                formData.auto_pays.reduce((sum, ap) => sum + (ap.amount || 0), 0)
              )}
            </p>
          </div>
        )}

        <div className="border-t dark:border-slate-700 pt-4">
          <h4 className="font-semibold mb-3">Add Auto-Pay</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Payment name"
              className="input"
              value={newAutoPay.name}
              onChange={(e) =>
                setNewAutoPay({ ...newAutoPay, name: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Amount"
              className="input"
              value={newAutoPay.amount}
              onChange={(e) =>
                setNewAutoPay({ ...newAutoPay, amount: parseFloat(e.target.value) || 0 })
              }
            />
            <input
              type="date"
              className="input"
              value={newAutoPay.dueDate}
              onChange={(e) =>
                setNewAutoPay({ ...newAutoPay, dueDate: e.target.value })
              }
            />
          </div>
          <button
            onClick={handleAddAutoPay}
            className="btn-secondary mt-3"
          >
            Add Auto-Pay
          </button>
        </div>
      </div>

      {/* Irregular Expenses */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold mb-4">Irregular Expenses (Next 2 Weeks)</h3>
        {formData.irregular_expenses.length > 0 && (
          <div className="mb-4 space-y-2">
            {formData.irregular_expenses.map((ie, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{ie.description}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{ie.dueDate}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold">{formatCurrency(ie.amount)}</span>
                  <button
                    onClick={() => handleRemoveExpense(idx)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-3">
              Total: {formatCurrency(
                formData.irregular_expenses.reduce((sum, ie) => sum + (ie.amount || 0), 0)
              )}
            </p>
          </div>
        )}

        <div className="border-t dark:border-slate-700 pt-4">
          <h4 className="font-semibold mb-3">Add Irregular Expense</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Description"
              className="input"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Amount"
              className="input"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })
              }
            />
            <input
              type="date"
              className="input"
              value={newExpense.dueDate}
              onChange={(e) =>
                setNewExpense({ ...newExpense, dueDate: e.target.value })
              }
            />
          </div>
          <button
            onClick={handleAddExpense}
            className="btn-secondary mt-3"
          >
            Add Expense
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold mb-4">Notes</h3>
        <textarea
          className="input h-20"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any observations about this period?"
        />
      </div>

      {/* Save Entry Button */}
      <div className="mb-8">
        <button onClick={handleSaveEntry} className="btn-primary">
          Save Snapshot
        </button>
      </div>

      {/* Chart */}
      {chartData && chartData.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold mb-4">Balance History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="checking" fill="#3b82f6" name="Checking" />
              <Bar dataKey="savings" fill="#10b981" name="Savings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      {state.cashFlowHistory && state.cashFlowHistory.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Snapshots</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {[...state.cashFlowHistory].reverse().map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg text-sm"
              >
                <p className="font-semibold">
                  {new Date(entry.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Checking: {formatCurrency(entry.checking_balance)} | Savings:{' '}
                  {formatCurrency(entry.savings_balance)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
