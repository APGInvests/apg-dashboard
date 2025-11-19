import React, { useState } from 'react';
import { useFinance, ACTIONS } from '../context/FinanceContext';
import { StatCard } from './StatCard';
import { formatCurrency } from '../utils/calculations';

export function RetirementPage() {
  const { state, dispatch } = useFinance();
  const [formData, setFormData] = useState({
    roth_ira: state.retirementAccounts?.roth_ira || 0,
    four_oh_one_k: state.retirementAccounts?.four_oh_one_k || 0,
  });
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = () => {
    dispatch({
      type: ACTIONS.UPDATE_RETIREMENT_ACCOUNTS,
      payload: {
        roth_ira: parseFloat(formData.roth_ira) || 0,
        four_oh_one_k: parseFloat(formData.four_oh_one_k) || 0,
      },
    });

    setSaveMessage('Retirement accounts updated!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const totalRetirement = (parseFloat(formData.roth_ira) || 0) + (parseFloat(formData.four_oh_one_k) || 0);

  return (
    <div className="max-w-6xl mx-auto page-container">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Retirement Accounts</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Track your Roth IRA and 401(k) balances
        </p>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className="mb-4 p-4 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700">
          ✓ {saveMessage}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon="💰"
          label="Roth IRA"
          value={formatCurrency(parseFloat(formData.roth_ira) || 0)}
          subtext="Tax-free growth"
          accentColor="green"
        />

        <StatCard
          icon="🏢"
          label="401(k)"
          value={formatCurrency(parseFloat(formData.four_oh_one_k) || 0)}
          subtext="Employer-sponsored"
          accentColor="blue"
        />

        <StatCard
          icon="📈"
          label="Total Retirement"
          value={formatCurrency(totalRetirement)}
          subtext="Combined balance"
          accentColor="purple"
        />
      </div>

      {/* Balance Input Form */}
      <div className="card">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Update Balances</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="form-group">
            <label className="label">Roth IRA Balance</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400">$</span>
              <input
                type="number"
                className="input flex-1"
                value={formData.roth_ira}
                onChange={(e) =>
                  setFormData({ ...formData, roth_ira: e.target.value })
                }
                placeholder="0"
                step="0.01"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Current: {formatCurrency(state.retirementAccounts?.roth_ira || 0)}
            </p>
          </div>

          <div className="form-group">
            <label className="label">401(k) Balance</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400">$</span>
              <input
                type="number"
                className="input flex-1"
                value={formData.four_oh_one_k}
                onChange={(e) =>
                  setFormData({ ...formData, four_oh_one_k: e.target.value })
                }
                placeholder="0"
                step="0.01"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Current: {formatCurrency(state.retirementAccounts?.four_oh_one_k || 0)}
            </p>
          </div>
        </div>

        {/* Summary Box */}
        <div className="bg-purple-50 dark:bg-slate-800 p-4 rounded-lg border border-purple-200 dark:border-purple-900 mb-6">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Summary:</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Roth IRA:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(parseFloat(formData.roth_ira) || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">401(k):</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(parseFloat(formData.four_oh_one_k) || 0)}
              </span>
            </div>
            <div className="border-t border-purple-200 dark:border-purple-700 pt-2 flex justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Total:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(totalRetirement)}
              </span>
            </div>
          </div>
        </div>

        <button onClick={handleSave} className="btn-primary">
          Save Changes
        </button>
      </div>
    </div>
  );
}
