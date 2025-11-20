import React, { useState } from 'react';
import { useFinance, ACTIONS } from '../context/FinanceContext';
import { StatCard } from './StatCard';
import { formatCurrency } from '../utils/calculations';
import { DollarSign, Building2, TrendingUp } from 'lucide-react';

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
      <div className="mb-6">
        <div className="pb-3 border-b-2 border-gray-200">
          <h1 className="text-5xl font-bold text-navy mt-0">Retirement Accounts</h1>
        </div>
        <p className="text-gray-600 mt-3">
          Track your Roth IRA and 401(k) balances
        </p>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 text-success border border-success/30 animate-fade-in">
          ✓ {saveMessage}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-stagger">
        <StatCard
          icon={<DollarSign size={24} />}
          label="Roth IRA"
          value={formatCurrency(parseFloat(formData.roth_ira) || 0)}
          subtext="Tax-free growth"
          accentColor="green"
        />

        <StatCard
          icon={<Building2 size={24} />}
          label="401(k)"
          value={formatCurrency(parseFloat(formData.four_oh_one_k) || 0)}
          subtext="Employer-sponsored"
          accentColor="cyan"
        />

        <StatCard
          icon={<TrendingUp size={24} />}
          label="Total Retirement"
          value={formatCurrency(totalRetirement)}
          subtext="Combined balance"
          accentColor="purple"
        />
      </div>

      {/* Balance Input Form */}
      <div className="card p-6 animate-fade-in">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Update Balances</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="form-group">
            <label className="label">Roth IRA Balance</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">$</span>
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
            <p className="text-xs text-gray-500 mt-2">
              Current: {formatCurrency(state.retirementAccounts?.roth_ira || 0)}
            </p>
          </div>

          <div className="form-group">
            <label className="label">401(k) Balance</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">$</span>
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
            <p className="text-xs text-gray-500 mt-2">
              Current: {formatCurrency(state.retirementAccounts?.four_oh_one_k || 0)}
            </p>
          </div>
        </div>

        {/* Summary Box */}
        <div className="card border border-gray-200 bg-gray-50 p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Summary:</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Roth IRA:</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(parseFloat(formData.roth_ira) || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">401(k):</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(parseFloat(formData.four_oh_one_k) || 0)}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-bold text-gray-900">Total:</span>
              <span className="font-bold text-primary">
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
