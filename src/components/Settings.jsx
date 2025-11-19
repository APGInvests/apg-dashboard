import React, { useState } from 'react';
import { useFinance, ACTIONS } from '../context/FinanceContext';
import { formatCurrency, getTotalMonthlyBudget } from '../utils/calculations';

const BUDGET_CATEGORIES = [
  { key: 'groceries', label: 'Groceries' },
  { key: 'restaurants', label: 'Restaurants' },
  { key: 'phone', label: 'Phone' },
  { key: 'internet', label: 'Internet' },
  { key: 'utilities', label: 'Utilities' },
  { key: 'subscriptions_software', label: 'Subscriptions & Software' },
  { key: 'aaa_insurance', label: 'AAA Insurance' },
  { key: 'vehicle_maintenance', label: 'Vehicle Maintenance' },
  { key: 'pool_service', label: 'Pool Service' },
  { key: 'baby_household', label: 'Baby & Household' },
  { key: 'personal_fun', label: 'Personal Fun' },
  { key: 'gifts_flexible', label: 'Gifts & Flexible' },
  { key: 'truck_payment', label: 'Truck Payment' },
  { key: 'debt_snowball_extra', label: 'Debt Snowball Extra' },
];

export function SettingsPage({ isDarkMode, onToggleDarkMode }) {
  const { state, dispatch } = useFinance();
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState('theme');

  const [formData, setFormData] = useState({
    checking_minimum: state.settings?.accountMinimums?.checking_minimum || 5000,
    savings_minimum: state.settings?.accountMinimums?.savings_minimum || 3500,
    budget: { ...state.budget },
    income: { ...state.income },
  });

  const handleSave = () => {
    // Update account minimums
    dispatch({
      type: ACTIONS.UPDATE_SETTINGS,
      payload: {
        accountMinimums: {
          checking_minimum: parseFloat(formData.checking_minimum) || 0,
          savings_minimum: parseFloat(formData.savings_minimum) || 0,
        },
      },
    });

    // Update budget
    dispatch({
      type: ACTIONS.UPDATE_BUDGET,
      payload: formData.budget,
    });

    // Update income
    dispatch({
      type: ACTIONS.UPDATE_INCOME,
      payload: formData.income,
    });

    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const totalBudget = getTotalMonthlyBudget(formData.budget);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Configure dashboard preferences, budget, and account settings
        </p>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700">
          ✓ {saveMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'theme'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          Theme
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'account'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          Account Minimums
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'budget'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          Budget
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            activeTab === 'income'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          Income
        </button>
      </div>

      {/* Theme Tab */}
      {activeTab === 'theme' && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Display Theme</h2>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onToggleDarkMode()}
              className="px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              style={{
                backgroundColor: isDarkMode ? '#334155' : '#e2e8f0',
                color: isDarkMode ? '#ffffff' : '#1e293b',
              }}
            >
              {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
            <p className="text-slate-600 dark:text-slate-400">
              Current mode: <span className="font-bold">{isDarkMode ? 'Dark' : 'Light'}</span>
            </p>
          </div>
        </div>
      )}

      {/* Account Minimums Tab */}
      {activeTab === 'account' && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Account Minimums</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Set the minimum balance you want to maintain in each account. Overages above these minimums are available for debt allocation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Checking Minimum */}
            <div className="form-group">
              <label className="label">Checking Account Minimum</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400">$</span>
                <input
                  type="number"
                  className="input flex-1"
                  value={formData.checking_minimum}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      checking_minimum: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Minimum balance to keep in checking for safety and upcoming payments
              </p>
            </div>

            {/* Savings Minimum */}
            <div className="form-group">
              <label className="label">Savings Account Minimum</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400">$</span>
                <input
                  type="number"
                  className="input flex-1"
                  value={formData.savings_minimum}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      savings_minimum: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Minimum balance to keep in savings for emergency fund
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Total Account Minimums:</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(
                (parseFloat(formData.checking_minimum) || 0) +
                  (parseFloat(formData.savings_minimum) || 0)
              )}
            </p>
          </div>
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Monthly Budget</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Adjust your monthly budget allocations. Changes will be reflected in your paycheck tracker and debt calculations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {BUDGET_CATEGORIES.map((category) => (
              <div key={category.key} className="form-group">
                <label className="label">{category.label}</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 dark:text-slate-400">$</span>
                  <input
                    type="number"
                    className="input flex-1"
                    value={formData.budget[category.key]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: {
                          ...formData.budget,
                          [category.key]: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Budget Summary */}
          <div className="bg-green-50 dark:bg-slate-800 p-4 rounded-lg border border-green-200 dark:border-green-900">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Total Monthly Budget:</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalBudget)}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Biweekly: {formatCurrency(totalBudget / 2)}
            </p>
          </div>
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Income Settings</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Configure your paycheck and income details.
          </p>

          <div className="space-y-6 mb-8">
            {/* Pay Frequency */}
            <div className="form-group">
              <label className="label">Pay Frequency</label>
              <select
                className="input"
                value={formData.income.pay_frequency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    income: {
                      ...formData.income,
                      pay_frequency: e.target.value,
                    },
                  })
                }
              >
                <option value="biweekly">Biweekly</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Average Net Per Check */}
            <div className="form-group">
              <label className="label">Average Net Per Check</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400">$</span>
                <input
                  type="number"
                  className="input flex-1"
                  value={formData.income.average_net_per_check}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      income: {
                        ...formData.income,
                        average_net_per_check: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Your take-home pay per paycheck
              </p>
            </div>

            {/* Monthly Estimate */}
            <div className="form-group">
              <label className="label">Monthly Take-Home Estimate</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400">$</span>
                <input
                  type="number"
                  className="input flex-1"
                  value={formData.income.monthly_take_home_estimate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      income: {
                        ...formData.income,
                        monthly_take_home_estimate: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Estimated monthly after-tax income
              </p>
            </div>

            {/* Last Paycheck Date */}
            <div className="form-group">
              <label className="label">Last Paycheck Date</label>
              <input
                type="date"
                className="input"
                value={formData.income.last_paycheck_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    income: {
                      ...formData.income,
                      last_paycheck_date: e.target.value,
                    },
                  })
                }
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Used to calculate next paycheck date (biweekly cycle)
              </p>
            </div>
          </div>

          {/* Income Summary */}
          <div className="bg-purple-50 dark:bg-slate-800 p-4 rounded-lg border border-purple-200 dark:border-purple-900">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Income Summary:</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Per Check:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(formData.income.average_net_per_check)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Monthly Estimate:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(formData.income.monthly_take_home_estimate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button onClick={handleSave} className="btn-primary">
        Save All Settings
      </button>
    </div>
  );
}
