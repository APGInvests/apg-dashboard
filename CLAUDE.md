# APG Dashboard

## Project Overview

**APG Dashboard** is a personal finance tracking application that provides comprehensive visibility into income, expenses, debt payoff strategies, and retirement planning.

**Status:** 🔧 Active Maintenance
**Deployed:** https://apg-dashboard.vercel.app/
**GitHub:** https://github.com/APGInvests/apg-dashboard
**Last Updated:** November 19, 2025

---

## Core Features

### 1. **Income Tracking**
- Multiple income streams (salary, side gigs, passive income)
- Income recording with date tracking
- Monthly income totals and trends

### 2. **Expense Management**
- Categorized expense tracking
- Budget allocation by category
- Monthly spending analysis

### 3. **Debt Management**
- Comprehensive debt inventory (credit cards, student loans, mortgage, HELOC, car loans)
- Payment due date tracking with visual indicators
- Multiple payoff strategies:
  - **Snowball Method:** Smallest balance first (psychological wins)
  - **Avalanche Method:** Highest interest rate first (mathematically optimal)
  - **Custom:** Manual priority setting
- Color-coded debt status badges:
  - 🟢 Green: On track (< 30% of balance)
  - 🟡 Yellow: Moderate progress (30-60% of balance)
  - 🔴 Red: Behind schedule (> 60% of balance)

### 4. **Financial Health Dashboard**
- Net worth calculation (assets - liabilities)
- Monthly cash flow analysis
- Debt payoff timeline visualization
- Financial metrics and KPIs

### 5. **Retirement Planning**
- Retirement savings tracking
- Target calculations
- Projection timeline

### 6. **Settings & Customization**
- Data management (export/import)
- Preference settings

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 19.2.0 |
| **Build Tool** | Vite 7.2.2 |
| **Language** | JavaScript (JSX) |
| **Styling** | Tailwind CSS 3.4.18 |
| **UI Components** | Lucide React Icons 0.554.0 |
| **Charts** | Recharts 3.4.1 |
| **Build Process** | Vite build |
| **Code Quality** | ESLint 9.39.1 |

---

## Project Structure

```
/Projects/APGDashboard/
├── src/
│   ├── components/          # React components (navigation, cards, pages)
│   ├── context/             # React Context for state management
│   ├── utils/               # Helper functions
│   ├── types.js             # Type definitions
│   ├── App.jsx              # Main app component
│   ├── index.css            # Global styles
│   ├── App.css              # App-specific styles
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── dist/                    # Built production files
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── eslint.config.js         # ESLint configuration
└── package.json             # Dependencies
```

---

## Key Components

### Dashboard Components
- **StatCard** - Reusable metric display with icon, value, trend
- **Navigation** - Left sidebar navigation menu
- **DebtPayoffChart** - Visualization of debt payoff progress
- **IncomeRecorder** - Form for recording new income
- **ExpenseTracker** - Expense entry and categorization
- **PayoffStrategy** - Selection between Snowball/Avalanche/Custom
- **DebtPayoffTimeline** - Visual timeline of payoff completion

### Pages
- **Dashboard** - Main financial overview
- **Income** - Income tracking and management
- **Expenses** - Expense categorization and budgeting
- **Debt** - Debt inventory and payoff strategies
- **Retirement** - Retirement planning
- **Settings** - Application preferences

---

## Recent Updates

### November 19, 2025 (Latest)
- ✅ Reorganized to `/Projects/APGDashboard/` (was at `/Users/apg/Projects/workbench/finance-dashboard/`)
- ✅ Added to Projects README for agent discoverability
- ✅ Created CLAUDE.md for project context

### November 18, 2025
- ✅ Update Income page title to reflect all income tracking
- ✅ Upgrade UI with professional icons and enhanced page headers
- ✅ Fixed white space issues

### Earlier Updates
- ✅ Color-coded debt status badges
- ✅ Payment due date visibility improvements
- ✅ Income recording feature
- ✅ Debt payoff strategy system (Snowball, Avalanche, Custom)
- ✅ Paycheck date picker
- ✅ Left sidebar navigation
- ✅ Retirement page
- ✅ Modern SaaS-style dashboard redesign

---

## Development Commands

```bash
# Start development server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

---

## Deployment

**Platform:** Vercel
**URL:** https://apg-dashboard.vercel.app/
**Branch:** main
**Auto-deploy:** Enabled on push to main

**Deployment Process:**
```bash
# Push to main branch
git push origin main

# Vercel automatically deploys
# Check deployment at: https://apg-dashboard.vercel.app/
```

---

## Data Management

### Current Implementation
- **State Management:** React Context API + Local Component State
- **Data Storage:** Browser LocalStorage (currently)
- **Export/Import:** Available in Settings

### Future Enhancements
- Cloud database (Firebase/Supabase) for:
  - Multi-device sync
  - Historical data backup
  - Data security
  - Collaborative features

---

## Important Notes for Future Development

### 1. **Naming Consistency**
- Project folder: `APGDashboard` (PascalCase)
- GitHub repo: `apg-dashboard` (kebab-case)
- npm package: `finance-dashboard` (in package.json, keep for backward compatibility)

### 2. **File Organization**
- Components: `/src/components/` (organized by feature)
- Styles: Tailwind CSS (src/index.css for globals, inline for components)
- Types: `/src/types.js` (centralized type definitions)
- Utils: `/src/utils/` (helper functions)

### 3. **Styling Approach**
- **Primary:** Tailwind CSS classes
- **Icons:** Lucide React (import from `lucide-react`)
- **Charts:** Recharts components

### 4. **Key Components to Know**
- **StatCard:** Used across dashboard for metric display
- **Navigation:** Left sidebar - add new pages here
- **Context:** Global state for financial data
- **DebtPayoff:** Complex debt management logic

---

## Known Issues & Improvements

### Completed Fixes
- ✅ White space/spacing issues resolved
- ✅ Payment due date visibility
- ✅ Color-coded debt badges
- ✅ Professional icon upgrade

### Areas for Future Improvement
1. **Database Migration** - Replace localStorage with cloud storage
2. **Data Visualization** - Additional chart types (pie, radar)
3. **Mobile Optimization** - Better mobile experience
4. **Features:**
   - Budget forecasting
   - Spending analytics
   - Goal tracking
   - Net worth history/trends
   - PDF reports
   - Email summaries

---

## Critical Reminders for Claude Code

1. **Location:** `/Users/apg/apg/workbench/Projects/APGDashboard/` (not `/Users/apg/Projects/`)
2. **GitHub:** `APGInvests/apg-dashboard`
3. **Tech:** React (not Vue) - files are `.jsx`
4. **State:** React Context API (not Redux)
5. **Styling:** Tailwind CSS classes only (no CSS Modules)
6. **Entry Point:** `src/main.jsx` → renders `App.jsx`

---

## Session History

**Session 26 (Nov 19, 2025):**
- Reorganized project to correct location
- Updated Projects README
- Created CLAUDE.md documentation
- Verified git history integrity

---

## Questions or Issues?

When working on this project:
1. Always start by reading this CLAUDE.md
2. Check recent git commits for context
3. Verify component structure in `/src/components/`
4. Reference `/src/types.js` for data shape
5. Use Tailwind + Lucide for all new UI

**Deploy to Vercel:** `git push origin main` (auto-deploys)

---

**Last Updated:** November 19, 2025
**Maintained By:** APG (via Claude Code)
**Status:** ✅ Production Ready
