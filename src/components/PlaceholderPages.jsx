import React, { useState } from 'react';
import { useFinance, ACTIONS } from '../context/FinanceContext';
import {
  formatCurrency,
  getTotalPropertyValue,
  getTotalMortgageBalance,
  getTotalPropertyEquity,
  getTotalDebtBalance,
  calculateNetWorth,
  calculateDebtSnowball,
  projectDebtPayoff,
} from '../utils/calculations';

export function RealEstatePage() {
  const { state, dispatch } = useFinance();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    estimated_value: '',
    primary_mortgage: '',
    heloc_balance: '',
    monthly_income: '',
    monthly_expenses: '',
    reserve_balance: '',
  });

  const totalValue = getTotalPropertyValue(state.properties);
  const totalMortgage = getTotalMortgageBalance(state.properties);
  const totalEquity = getTotalPropertyEquity(state.properties);

  const resetForm = () => {
    setFormData({
      name: '',
      estimated_value: '',
      primary_mortgage: '',
      heloc_balance: '',
      monthly_income: '',
      monthly_expenses: '',
      reserve_balance: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleAddProperty = () => {
    if (!formData.name || !formData.estimated_value) {
      alert('Please enter property name and estimated value');
      return;
    }

    const primary = parseFloat(formData.primary_mortgage) || 0;
    const heloc = parseFloat(formData.heloc_balance) || 0;
    const totalMortgage = primary + heloc;
    const equity = parseFloat(formData.estimated_value) - totalMortgage;

    const newProperty = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      estimated_value: parseFloat(formData.estimated_value),
      primary_mortgage: primary,
      heloc_balance: heloc,
      mortgage_balance: totalMortgage,
      monthly_income: parseFloat(formData.monthly_income) || 0,
      monthly_expenses: parseFloat(formData.monthly_expenses) || 0,
      reserve_balance: parseFloat(formData.reserve_balance) || 0,
      equity: equity,
    };

    dispatch({
      type: ACTIONS.ADD_PROPERTY,
      payload: newProperty,
    });

    resetForm();
  };

  const handleUpdateProperty = () => {
    if (!formData.name || !formData.estimated_value) {
      alert('Please enter property name and estimated value');
      return;
    }

    const primary = parseFloat(formData.primary_mortgage) || 0;
    const heloc = parseFloat(formData.heloc_balance) || 0;
    const totalMortgage = primary + heloc;
    const equity = parseFloat(formData.estimated_value) - totalMortgage;

    dispatch({
      type: ACTIONS.UPDATE_PROPERTY,
      payload: {
        id: editingId,
        updates: {
          name: formData.name,
          estimated_value: parseFloat(formData.estimated_value),
          primary_mortgage: primary,
          heloc_balance: heloc,
          mortgage_balance: totalMortgage,
          monthly_income: parseFloat(formData.monthly_income) || 0,
          monthly_expenses: parseFloat(formData.monthly_expenses) || 0,
          reserve_balance: parseFloat(formData.reserve_balance) || 0,
          equity: equity,
        },
      },
    });

    resetForm();
  };

  const handleEditClick = (property) => {
    setFormData({
      name: property.name,
      estimated_value: property.estimated_value.toString(),
      primary_mortgage: (property.primary_mortgage || 0).toString(),
      heloc_balance: (property.heloc_balance || 0).toString(),
      monthly_income: (property.monthly_income || 0).toString(),
      monthly_expenses: (property.monthly_expenses || 0).toString(),
      reserve_balance: (property.reserve_balance || 0).toString(),
    });
    setEditingId(property.id);
    setShowAddForm(true);
  };

  const handleDeleteProperty = (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      dispatch({
        type: ACTIONS.DELETE_PROPERTY,
        payload: id,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto page-container">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          <div className="pb-3 border-b-2 border-amber-500 dark:border-amber-400 inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent mt-0">Real Estate Dashboard</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-3">
            Property performance tracking, monthly cashflow, and equity growth monitoring.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="btn-primary"
        >
          + Add Property
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Property Value</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{formatCurrency(totalValue)}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Equity</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{formatCurrency(totalEquity)}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Mortgage Balance</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{formatCurrency(totalMortgage)}</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card mb-6 bg-blue-50 dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {editingId ? 'Edit Property' : 'Add New Property'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Property Name</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Indio SFH"
              />
            </div>
            <div className="form-group">
              <label className="label">Estimated Value</label>
              <input
                type="number"
                className="input"
                value={formData.estimated_value}
                onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="label">Primary Mortgage</label>
              <input
                type="number"
                className="input"
                value={formData.primary_mortgage}
                onChange={(e) => setFormData({ ...formData, primary_mortgage: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="label">HELOC / 2nd Mortgage</label>
              <input
                type="number"
                className="input"
                value={formData.heloc_balance}
                onChange={(e) => setFormData({ ...formData, heloc_balance: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="label">Monthly Rental Income</label>
              <input
                type="number"
                className="input"
                value={formData.monthly_income}
                onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="label">Monthly Expenses</label>
              <input
                type="number"
                className="input"
                value={formData.monthly_expenses}
                onChange={(e) => setFormData({ ...formData, monthly_expenses: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="label">Reserve Balance (Basline Account)</label>
              <input
                type="number"
                className="input"
                value={formData.reserve_balance}
                onChange={(e) => setFormData({ ...formData, reserve_balance: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={editingId ? handleUpdateProperty : handleAddProperty}
              className="btn-primary"
            >
              {editingId ? 'Update Property' : 'Add Property'}
            </button>
            <button
              onClick={resetForm}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Properties List */}
      <div className="space-y-4">
        {state.properties.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-slate-600 dark:text-slate-400">No properties yet. Click "Add Property" to get started.</p>
          </div>
        ) : (
          state.properties.map((property) => {
            const monthlyNetCashflow = (property.monthly_income || 0) - (property.monthly_expenses || 0);
            const equityPercentage = property.estimated_value > 0 ? (property.equity / property.estimated_value) * 100 : 0;

            return (
              <div key={property.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{property.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Equity: {equityPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(property)}
                      className="btn-secondary text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(property.id)}
                      className="btn-secondary text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Estimated Value</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(property.estimated_value)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Total Debt</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(property.mortgage_balance)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Equity</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(property.equity)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Monthly Net Cashflow</p>
                    <p className={`text-lg font-bold ${monthlyNetCashflow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(monthlyNetCashflow)}
                    </p>
                  </div>
                </div>

                {/* Debt Breakdown */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mb-4">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">Debt Against This Property</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Primary Mortgage</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(property.primary_mortgage || 0)}</p>
                    </div>
                    {property.heloc_balance > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">HELOC (Interest-Only)</p>
                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{formatCurrency(property.heloc_balance)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Debt-to-Value</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{((property.mortgage_balance / property.estimated_value) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                {/* Cashflow & Reserve details */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Monthly Income</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(property.monthly_income || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Monthly Expenses</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(property.monthly_expenses || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Cashflow Status</p>
                      <p className={`text-lg font-bold ${monthlyNetCashflow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {monthlyNetCashflow >= 0 ? 'Positive' : 'Negative'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Reserve Balance</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(property.reserve_balance || 0)}</p>
                    </div>
                  </div>
                  {property.monthly_expenses > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Reserve Runway: {property.reserve_balance > 0 ? ((property.reserve_balance / property.monthly_expenses) * 12).toFixed(1) : 0} months
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function NetWorthPage() {
  const { state } = useFinance();

  const checkingBalance = state.cashFlowHistory.length > 0
    ? state.cashFlowHistory[state.cashFlowHistory.length - 1].checking_balance
    : 0;

  const savingsBalance = state.cashFlowHistory.length > 0
    ? state.cashFlowHistory[state.cashFlowHistory.length - 1].savings_balance
    : 0;

  const retirementAccounts = state.retirementAccounts || {
    roth_ira: 0,
    four_oh_one_k: 0,
  };

  const propertyEquity = getTotalPropertyEquity(state.properties);
  const totalDebt = getTotalDebtBalance(state.debts);
  const netWorth = calculateNetWorth(
    checkingBalance,
    savingsBalance,
    retirementAccounts,
    propertyEquity,
    totalDebt
  );

  const totalRetirement = Object.values(retirementAccounts).reduce(
    (sum, val) => sum + (val || 0),
    0
  );

  const totalAssets = checkingBalance + savingsBalance + totalRetirement + propertyEquity;
  const debtToAssetsRatio = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto page-container">
      <div className="mb-6">
        <div className="pb-3 border-b-2 border-cyan-500 dark:border-cyan-400 inline-block">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-800 dark:from-cyan-400 dark:to-cyan-500 bg-clip-text text-transparent mt-0">Net Worth Overview</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mt-3">
          High-level financial picture with assets, liabilities, and net worth trends.
        </p>
      </div>

      {/* Main Net Worth Display */}
      <div className="card mt-4 bg-gradient-to-r from-green-900 to-green-800 dark:from-green-950 dark:to-green-900 border-2 border-green-600 dark:border-green-700">
        <p className="text-sm font-medium text-green-200 uppercase">Total Net Worth</p>
        <p className={`text-4xl md:text-5xl font-bold mt-2 ${netWorth >= 0 ? 'text-green-100' : 'text-red-200'}`}>
          {formatCurrency(netWorth)}
        </p>
        <p className="text-green-200 mt-2 text-sm">
          Assets {netWorth >= 0 ? 'exceed' : 'fall short of'} liabilities
        </p>
      </div>

      {/* Assets vs Liabilities Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="card bg-blue-50 dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase">Total Assets</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{formatCurrency(totalAssets)}</p>
        </div>
        <div className="card bg-red-50 dark:bg-slate-800 border-2 border-red-200 dark:border-red-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase">Total Liabilities</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{formatCurrency(totalDebt)}</p>
        </div>
      </div>

      {/* Asset Breakdown */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Asset Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase">Liquid Assets</p>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Checking Account</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(checkingBalance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Savings Account</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(savingsBalance)}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-900 dark:text-white">Total Liquid</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(checkingBalance + savingsBalance)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase">Retirement Accounts</p>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Roth IRA</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(retirementAccounts.roth_ira || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">401(k)</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(retirementAccounts.four_oh_one_k || 0)}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-900 dark:text-white">Total Retirement</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalRetirement)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card md:col-span-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase">Real Estate Equity</p>
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 dark:text-slate-300">Property Equity</span>
                <span className="font-bold text-green-600 dark:text-green-400 text-xl">{formatCurrency(propertyEquity)}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Includes equity in all {state.properties.length} properties
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liability Breakdown */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Liability Breakdown</h2>
        <div className="card">
          <div className="space-y-2">
            {state.debts.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400">No debts recorded</p>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase mb-3">Outstanding Debts</p>
                {state.debts
                  .filter((d) => d.balance > 0)
                  .map((debt) => (
                    <div key={debt.id} className="flex justify-between items-center py-2">
                      <span className="text-slate-700 dark:text-slate-300">{debt.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(debt.balance)}</span>
                    </div>
                  ))}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-900 dark:text-white">Total Debt</span>
                    <span className="font-bold text-red-600 dark:text-red-400 text-lg">{formatCurrency(totalDebt)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Financial Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase">Debt-to-Assets Ratio</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{debtToAssetsRatio.toFixed(1)}%</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              {debtToAssetsRatio < 50 ? 'Healthy leverage' : 'Monitor debt levels'}
            </p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase">Asset Coverage</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{((totalAssets / totalDebt) || 0).toFixed(2)}x</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Assets per $1 of debt
            </p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase">Real Estate %</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{totalAssets > 0 ? ((propertyEquity / totalAssets) * 100).toFixed(1) : 0}%</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Of total assets in real estate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectionsPage() {
  const { state } = useFinance();
  const [scenario, setScenario] = useState({
    bonus_amount: 0,
    annual_raise_percent: 0,
    tax_refund: 0,
    extra_debt_payment: 0,
  });

  // Base case calculations
  const baseDebts = calculateDebtSnowball(state.debts, state.budget.debt_snowball_extra);
  const baseProjection = projectDebtPayoff(baseDebts, state.budget.debt_snowball_extra);
  const totalDebt = getTotalDebtBalance(state.debts);

  // Calculate scenario impact
  const monthlyExtraWithScenario = state.budget.debt_snowball_extra + (scenario.extra_debt_payment || 0);
  const scenarioDebts = calculateDebtSnowball(state.debts, monthlyExtraWithScenario);
  const scenarioProjection = projectDebtPayoff(scenarioDebts, monthlyExtraWithScenario);

  // Calculate time saved
  const baseDebtFreeDate = baseProjection.length > 0 ? baseProjection[baseProjection.length - 1].payoffDate : null;
  const scenarioDebtFreeDate = scenarioProjection.length > 0 ? scenarioProjection[scenarioProjection.length - 1].payoffDate : null;

  const getMonthsDifference = (date1, date2) => {
    if (!date1 || !date2) return 0;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    return Math.abs(Math.max(0, months));
  };

  const monthsSaved = getMonthsDifference(baseDebtFreeDate, scenarioDebtFreeDate);

  // One-time impact calculations
  const debtReductionFromBonus = scenario.bonus_amount > 0 ? scenario.bonus_amount : 0;
  const monthlyIncreaseFromRaise = (state.income.monthly_take_home_estimate * scenario.annual_raise_percent) / 100 / 12;
  const annualSavingsFromRaise = (state.income.monthly_take_home_estimate * scenario.annual_raise_percent) / 100;
  const oneTimeDebtReduction = debtReductionFromBonus + (scenario.tax_refund || 0);

  const projectedDebtWithScenario = Math.max(0, totalDebt - oneTimeDebtReduction);
  const projectedSavingsWithRaise = (scenario.annual_raise_percent > 0) ? monthlyIncreaseFromRaise : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Projections & Scenario Simulator</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Model future scenarios and forecast financial outcomes.
        </p>
      </div>

      {/* Scenario Input Form */}
      <div className="card mt-8 bg-blue-50 dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Build Your Scenario</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Adjust these values to see how different financial events impact your debt payoff timeline.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="label">Bonus or Windfall Amount</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400">$</span>
              <input
                type="number"
                className="input flex-1"
                value={scenario.bonus_amount}
                onChange={(e) => setScenario({ ...scenario, bonus_amount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                step="500"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              One-time amount to apply to debt payoff
            </p>
          </div>

          <div className="form-group">
            <label className="label">Annual Salary Raise</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input flex-1"
                value={scenario.annual_raise_percent}
                onChange={(e) => setScenario({ ...scenario, annual_raise_percent: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                step="0.5"
              />
              <span className="text-slate-600 dark:text-slate-400">%</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Percentage increase to annual take-home
            </p>
          </div>

          <div className="form-group">
            <label className="label">Tax Refund</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400">$</span>
              <input
                type="number"
                className="input flex-1"
                value={scenario.tax_refund}
                onChange={(e) => setScenario({ ...scenario, tax_refund: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                step="500"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Expected tax refund to apply to debt
            </p>
          </div>

          <div className="form-group">
            <label className="label">Extra Monthly Debt Payment</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400">$</span>
              <input
                type="number"
                className="input flex-1"
                value={scenario.extra_debt_payment}
                onChange={(e) => setScenario({ ...scenario, extra_debt_payment: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                step="100"
              />
              <span className="text-slate-600 dark:text-slate-400">/ mo</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Additional monthly payment beyond ${state.budget.debt_snowball_extra}
            </p>
          </div>
        </div>

        <button
          onClick={() => setScenario({ bonus_amount: 0, annual_raise_percent: 0, tax_refund: 0, extra_debt_payment: 0 })}
          className="btn-secondary mt-4"
        >
          Reset Scenario
        </button>
      </div>

      {/* Impact Summary */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Scenario Impact</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* One-time Debt Reduction */}
          {oneTimeDebtReduction > 0 && (
            <div className="card bg-green-50 dark:bg-slate-800 border-2 border-green-200 dark:border-green-900">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase">One-Time Debt Reduction</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{formatCurrency(oneTimeDebtReduction)}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Bonus + Tax Refund to apply to debt
              </p>
            </div>
          )}

          {/* Monthly Increase from Raise */}
          {projectedSavingsWithRaise > 0 && (
            <div className="card bg-blue-50 dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-900">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase">Monthly Income Increase</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{formatCurrency(monthlyIncreaseFromRaise)}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                From {scenario.annual_raise_percent}% annual raise ({formatCurrency(annualSavingsFromRaise)}/yr)
              </p>
            </div>
          )}

          {/* Debt Freedom Timeline */}
          <div className="card bg-purple-50 dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-900">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase">Base Case Debt-Free Date</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
              {baseDebtFreeDate ? new Date(baseDebtFreeDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              With current ${state.budget.debt_snowball_extra}/mo extra payment
            </p>
          </div>

          {/* Projected Debt-Free Date with Scenario */}
          {(monthsSaved > 0 || monthlyExtraWithScenario > state.budget.debt_snowball_extra) && (
            <div className="card bg-green-50 dark:bg-slate-800 border-2 border-green-200 dark:border-green-900">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase">Projected Debt-Free Date</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                {scenarioDebtFreeDate ? new Date(scenarioDebtFreeDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
              {monthsSaved > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  🎉 {monthsSaved} month{monthsSaved !== 1 ? 's' : ''} sooner!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Debt Payoff Timeline Comparison */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Payoff Timeline</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Base Case */}
          <div className="card">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Base Case (${state.budget.debt_snowball_extra}/mo extra)
            </h3>
            <div className="space-y-2">
              {baseProjection.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400 text-sm">No debts to pay off</p>
              ) : (
                baseProjection.slice(0, 8).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300 text-sm">{item.debtName}</span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {new Date(item.payoffDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.monthsToPayoff} mo
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Scenario Case */}
          {monthlyExtraWithScenario > state.budget.debt_snowball_extra && (
            <div className="card bg-green-50 dark:bg-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                With Your Scenario (${monthlyExtraWithScenario}/mo extra)
              </h3>
              <div className="space-y-2">
                {scenarioProjection.length === 0 ? (
                  <p className="text-slate-600 dark:text-slate-400 text-sm">No debts to pay off</p>
                ) : (
                  scenarioProjection.slice(0, 8).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-700 dark:text-slate-300 text-sm">{item.debtName}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {new Date(item.payoffDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.monthsToPayoff} mo
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Key Insights</h2>
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-slate-900 dark:text-white">Current Situation</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>• Total Debt: {formatCurrency(totalDebt)}</li>
              <li>• Monthly Extra Payment: ${state.budget.debt_snowball_extra}</li>
              <li>• Monthly Minimum Payments: ${state.debts.reduce((sum, d) => sum + (d.min_payment || 0), 0)}</li>
              <li>• Estimated Debt-Free Date: {baseDebtFreeDate ? new Date(baseDebtFreeDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</li>
            </ul>
          </div>

          {(scenario.bonus_amount > 0 || scenario.annual_raise_percent > 0 || scenario.tax_refund > 0 || scenario.extra_debt_payment > 0) && (
            <div className="card bg-green-50 dark:bg-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Scenario Results</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {scenario.bonus_amount > 0 && (
                  <li>✓ Bonus of {formatCurrency(scenario.bonus_amount)} reduces debt immediately</li>
                )}
                {scenario.tax_refund > 0 && (
                  <li>✓ Tax refund of {formatCurrency(scenario.tax_refund)} accelerates payoff</li>
                )}
                {scenario.annual_raise_percent > 0 && (
                  <li>✓ {scenario.annual_raise_percent}% raise adds {formatCurrency(monthlyIncreaseFromRaise)}/month to debt payoff</li>
                )}
                {scenario.extra_debt_payment > 0 && (
                  <li>✓ Extra {formatCurrency(scenario.extra_debt_payment)}/month reduces timeline by {monthsSaved} months</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
