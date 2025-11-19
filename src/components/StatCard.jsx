/**
 * Reusable StatCard Component
 * Displays a metric with icon, main value, and supporting text
 * Follows React best practices: pure component with props-based styling
 */

export function StatCard({
  icon,
  label,
  value,
  subtext,
  accentColor = 'blue',
  className = '',
}) {
  const colorMap = {
    green: 'text-green-600 dark:text-green-400',
    blue: 'text-blue-600 dark:text-blue-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
    slate: 'text-slate-900 dark:text-white',
  };

  return (
    <div className={`card flex flex-col ${className}`}>
      {/* Header with icon and label */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {label}
        </p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>

      {/* Main value */}
      <p className={`text-4xl font-bold mb-2 ${colorMap[accentColor]}`}>
        {value}
      </p>

      {/* Subtext */}
      {subtext && (
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {subtext}
        </p>
      )}
    </div>
  );
}
