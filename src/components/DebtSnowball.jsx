import React, { useState, useMemo } from 'react';
import { useFinance, ACTIONS } from '../context/FinanceContext';
import { StatCard } from './StatCard';
import {
  calculateDebtSnowball,
  projectDebtPayoff,
  getTotalDebtBalance,
  getTotalMinimumPayments,
  formatCurrency,
  formatDate,
  daysUntil,
  generateId,
  sortDebtsBySnowball,
  sortDebtsByAvalanche,
} from '../utils/calculations';
import { Trash2, Plus, GripVertical } from 'lucide-react';

export function DebtSnowball() {
  const { state, dispatch } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draggedDebtId, setDraggedDebtId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    balance: 0,
    min_payment: 0,
    interest_rate: 0,
    promo_end: null,
  });

  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState(
    state.budget?.debt_snowball_extra || 0
  );

  // Get debt strategy preference
  const debtStrategy = state.settings?.debtStrategy?.strategy || 'snowball';
  const customDebtOrder = state.settings?.debtStrategy?.customDebtOrder || [];

  // Calculate sorted debts based on selected strategy
  const sortedDebts = useMemo(() => {
    const calculatedDebts = calculateDebtSnowball(state.debts, extraMonthlyPayment, state.income.monthly_take_home_estimate);

    // Apply strategy sorting
    if (debtStrategy === 'snowball') {
      return sortDebtsBySnowball(calculatedDebts);
    } else if (debtStrategy === 'avalanche') {
      return sortDebtsByAvalanche(calculatedDebts);
    } else if (debtStrategy === 'custom' && customDebtOrder.length > 0) {
      // Custom order: sort by customDebtOrder array
      return [...calculatedDebts].sort((a, b) => {
        const aIndex = customDebtOrder.indexOf(a.id);
        const bIndex = customDebtOrder.indexOf(b.id);
        // Debts in custom order come first, then unprioritized debts
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }
    return calculatedDebts;
  }, [state.debts, extraMonthlyPayment, state.income.monthly_take_home_estimate, debtStrategy, customDebtOrder]);

  // Project payoff timeline
  const payoffTimeline = useMemo(() => {
    return projectDebtPayoff(sortedDebts, extraMonthlyPayment);
  }, [sortedDebts, extraMonthlyPayment]);

  // Calculate metrics
  const totalDebt = getTotalDebtBalance(state.debts);
  const totalMinPayments = getTotalMinimumPayments(state.debts);
  const totalPayment = totalMinPayments + extraMonthlyPayment;

  // Calculate total interest saved vs. min payments only
  const totalInterestWithExtra = sortedDebts.reduce(
    (sum, debt) => sum + (debt.interestCost || 0),
    0
  );

  const handleAddDebt = () => {
    if (!formData.name || formData.balance <= 0) return;

    if (editingId) {
      dispatch({
        type: ACTIONS.UPDATE_DEBT,
        payload: {
          id: editingId,
          updates: {
            name: formData.name,
            balance: parseFloat(formData.balance) || 0,
            min_payment: parseFloat(formData.min_payment) || 0,
            interest_rate: parseFloat(formData.interest_rate) || 0,
            promo_end: formData.promo_end,
          },
        },
      });
      setEditingId(null);
    } else {
      dispatch({
        type: ACTIONS.ADD_DEBT,
        payload: {
          id: generateId(),
          name: formData.name,
          balance: parseFloat(formData.balance) || 0,
          min_payment: parseFloat(formData.min_payment) || 0,
          interest_rate: parseFloat(formData.interest_rate) || 0,
          promo_end: formData.promo_end,
        },
      });
    }

    setFormData({
      name: '',
      balance: 0,
      min_payment: 0,
      interest_rate: 0,
      promo_end: null,
    });
    setShowForm(false);
  };

  const handleEdit = (debt) => {
    setFormData({
      name: debt.name,
      balance: debt.balance,
      min_payment: debt.min_payment,
      interest_rate: debt.interest_rate,
      promo_end: debt.promo_end,
    });
    setEditingId(debt.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    dispatch({
      type: ACTIONS.DELETE_DEBT,
      payload: id,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      balance: 0,
      min_payment: 0,
      interest_rate: 0,
      promo_end: null,
    });
  };

  const handleDragStart = (e, debtId) => {
    setDraggedDebtId(debtId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetDebtId) => {
    e.preventDefault();
    if (!draggedDebtId || draggedDebtId === targetDebtId) {
      setDraggedDebtId(null);
      return;
    }

    // Create new order with dragged item moved to target position
    const draggedIndex = sortedDebts.findIndex((d) => d.id === draggedDebtId);
    const targetIndex = sortedDebts.findIndex((d) => d.id === targetDebtId);

    const newOrder = [...sortedDebts];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    // Update custom order in state
    const newCustomOrder = newOrder.map((d) => d.id);
    dispatch({
      type: ACTIONS.UPDATE_DEBT_ORDER,
      payload: newCustomOrder,
    });

    setDraggedDebtId(null);
  };

  const getDebtStatus = (debt) => {
    if (debt.balance === 0) return 'paid-off';
    if (debt.interest_rate === 0) return 'zero-percent';
    if (debt.promo_end) {
      const daysLeft = daysUntil(debt.promo_end);
      if (daysLeft < 0) return 'promo-expired';
      if (daysLeft < 30) return 'promo-ending';
    }
    return 'active';
  };

  const statusBadges = {
    'paid-off': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    'zero-percent': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    'promo-ending': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    'promo-expired': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    'active': 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
  };

  const statusLabels = {
    'paid-off': 'Paid Off ✓',
    'zero-percent': '0% APR',
    'promo-ending': 'Promo Ending Soon',
    'promo-expired': 'Promo Expired',
    'active': 'Active',
  };

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-5">
      <div className="mb-4">
        <h1>Debt Payoff Planner</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Customize your debt payoff strategy: Snowball, Avalanche, or manual control
        </p>
      </div>

      {/* Summary Cards - Modern SaaS Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon="💳"
          label="Total Debt"
          value={formatCurrency(totalDebt)}
          subtext={`${state.debts.length} debts`}
          accentColor="red"
        />

        <StatCard
          icon="📋"
          label="Min Payments"
          value={formatCurrency(totalMinPayments)}
          subtext="/month"
          accentColor="slate"
        />

        <StatCard
          icon="💰"
          label="Total Payment"
          value={formatCurrency(totalPayment)}
          subtext={`(+${formatCurrency(extraMonthlyPayment)} extra)`}
          accentColor="blue"
        />

        <StatCard
          icon="💸"
          label="Interest Cost"
          value={formatCurrency(totalInterestWithExtra)}
          subtext="with current plan"
          accentColor="purple"
        />
      </div>

      {/* Extra Payment Slider */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Extra Payment</h3>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={extraMonthlyPayment}
            onChange={(e) => setExtraMonthlyPayment(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 w-32 text-right">
            {formatCurrency(extraMonthlyPayment)}
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Budget allocation: {formatCurrency(state.budget?.debt_snowball_extra || 0)}
        </p>
      </div>

      {/* Debt Payoff Strategy */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4">Payoff Strategy</h3>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                  Strategy
                </label>
                <select
                  value={debtStrategy}
                  onChange={(e) => {
                    dispatch({
                      type: ACTIONS.UPDATE_DEBT_STRATEGY,
                      payload: e.target.value,
                    });
                  }}
                  className="input w-40"
                >
                  <option value="snowball">Snowball (Smallest First)</option>
                  <option value="avalanche">Avalanche (Highest Interest)</option>
                  <option value="custom">Custom (Manual Order)</option>
                </select>
              </div>
              {debtStrategy === 'custom' && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-6 flex items-center gap-2">
                  <GripVertical size={16} />
                  <span>Drag to reorder</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Debt</span>
          </button>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4">Payoff Priority</h4>

        {sortedDebts.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">No debts recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {sortedDebts.map((debt, idx) => {
              const status = getDebtStatus(debt);
              const isActive = debt.balance > 0;

              return (
                <div
                  key={debt.id}
                  draggable={debtStrategy === 'custom'}
                  onDragStart={(e) => debtStrategy === 'custom' && handleDragStart(e, debt.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => debtStrategy === 'custom' && handleDrop(e, debt.id)}
                  className={`border-l-4 p-4 rounded-lg transition-opacity ${
                    isActive
                      ? 'border-blue-500 bg-slate-50 dark:bg-slate-700'
                      : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800'
                  } ${draggedDebtId === debt.id ? 'opacity-50' : ''} ${
                    debtStrategy === 'custom' ? 'cursor-grab' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                      {debtStrategy === 'custom' && (
                        <GripVertical
                          size={20}
                          className="text-slate-400 dark:text-slate-500 mt-1 flex-shrink-0 cursor-grab"
                        />
                      )}
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="text-lg font-bold text-slate-500 dark:text-slate-400">
                            #{idx + 1}
                          </span>
                          <h4 className="text-lg font-semibold">{debt.name}</h4>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              statusBadges[status]
                            }`}
                          >
                            {statusLabels[status]}
                          </span>
                        </div>
                        {debt.promo_end && debt.interest_rate === 0 && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            0% promo ends {formatDate(debt.promo_end)} ({daysUntil(debt.promo_end)} days)
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(debt)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(debt.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Balance</p>
                      <p className="text-lg font-bold">{formatCurrency(debt.balance)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Min Payment</p>
                      <p className="text-lg font-bold">{formatCurrency(debt.min_payment)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Interest Rate</p>
                      <p className="text-lg font-bold">{debt.interest_rate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Months to Payoff</p>
                      <p className="text-lg font-bold">{Math.max(0, debt.monthsToPayoff)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Interest Cost</p>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(debt.interestCost)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {isActive && (
                    <div className="mt-4">
                      <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (idx / sortedDebts.length) * 100 + 20)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Attack this debt #{idx + 1} in priority
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Payoff Timeline */}
      {payoffTimeline.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Projected Payoff Timeline</h3>
          <div className="space-y-3">
            {payoffTimeline.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center border-b dark:border-slate-700 pb-3 last:border-b-0">
                <div>
                  <p className="font-semibold">#{idx + 1}: {entry.debtName}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {entry.monthsToPayoff} months ({entry.payoffDate})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">Interest: {formatCurrency(entry.totalInterestPaid)}</p>
                </div>
              </div>
            ))}
          </div>
          {payoffTimeline.length > 0 && (
            <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-semibold">
                🎯 Estimated debt-free date: {payoffTimeline[payoffTimeline.length - 1]?.payoffDate}
              </p>
              <p className="text-green-700 dark:text-green-300 text-sm">
                With {formatCurrency(extraMonthlyPayment)}/mo extra payment
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Debt Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit Debt' : 'Add New Debt'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="label">Debt Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Credit Card, Personal Loan"
                />
              </div>

              <div>
                <label className="label">Current Balance</label>
                <input
                  type="number"
                  className="input"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({ ...formData, balance: e.target.value })
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <label className="label">Minimum Monthly Payment</label>
                <input
                  type="number"
                  className="input"
                  value={formData.min_payment}
                  onChange={(e) =>
                    setFormData({ ...formData, min_payment: e.target.value })
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <label className="label">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.interest_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, interest_rate: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="label">0% Promo Ends (Optional)</label>
                <input
                  type="date"
                  className="input"
                  value={formData.promo_end || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, promo_end: e.target.value || null })
                  }
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button onClick={handleAddDebt} className="btn-primary flex-1">
                {editingId ? 'Update' : 'Add'}
              </button>
              <button onClick={handleCancel} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
