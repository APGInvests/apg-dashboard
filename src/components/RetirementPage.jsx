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
        <div className="pb-3 border-b-2 border-cyber-teal/50 shadow-glow-cyan">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyber-teal via-cyber-cyan to-cyber-blue mt-0 drop-shadow-lg">Retirement Accounts</h1>
        </div>
        <p className="text-slate-300 mt-3">
          Track your Roth IRA and 401(k) balances
        </p>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className="mb-4 p-4 rounded-lg bg-cyber-green/20 text-cyber-green border border-cyber-green/50 animate-fade-in">
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
      <div className="glass-card border border-cyber-teal/40 glow-border-green p-6 animate-fade-in">
        <h2 className="text-xl font-bold text-teal-100 mb-4">Update Balances</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="form-group">
            <label className="label">Roth IRA Balance</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">$</span>
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
            <p className="text-xs text-slate-400 mt-2">
              Current: {formatCurrency(state.retirementAccounts?.roth_ira || 0)}
            </p>
          </div>

          <div className="form-group">
            <label className="label">401(k) Balance</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">$</span>
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
            <p className="text-xs text-slate-400 mt-2">
              Current: {formatCurrency(state.retirementAccounts?.four_oh_one_k || 0)}
            </p>
          </div>
        </div>

        {/* Summary Box */}
        <div className="glass-card border border-cyber-purple/30 bg-gradient-to-br from-cyber-purple/10 to-transparent p-4 rounded-lg mb-6">
          <p className="text-sm font-medium text-slate-300 mb-3">Summary:</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Roth IRA:</span>
              <span className="font-bold text-slate-100">
                {formatCurrency(parseFloat(formData.roth_ira) || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">401(k):</span>
              <span className="font-bold text-slate-100">
                {formatCurrency(parseFloat(formData.four_oh_one_k) || 0)}
              </span>
            </div>
            <div className="border-t border-slate-700/50 pt-2 flex justify-between">
              <span className="font-bold text-slate-100">Total:</span>
              <span className="font-bold text-cyber-purple">
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
