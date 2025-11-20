/**
 * StatCard Component - Professional Theme
 * Displays a metric with icon, main value, and supporting text
 * Features: Clean white card, colored left border accent
 */

export function StatCard({
  icon,
  label,
  value,
  subtext,
  accentColor = 'blue',
  className = '',
}) {
  // Professional color palette mapping
  const colorMap = {
    blue: {
      icon: 'text-primary',
      border: 'border-l-primary',
    },
    green: {
      icon: 'text-success',
      border: 'border-l-success',
    },
    red: {
      icon: 'text-error',
      border: 'border-l-error',
    },
    navy: {
      icon: 'text-navy',
      border: 'border-l-navy',
    },
    cyan: {
      icon: 'text-blue-light',
      border: 'border-l-blue-light',
    },
    purple: {
      icon: 'text-primary',
      border: 'border-l-primary',
    },
    pink: {
      icon: 'text-primary',
      border: 'border-l-primary',
    },
    teal: {
      icon: 'text-blue-light',
      border: 'border-l-blue-light',
    },
  };

  const color = colorMap[accentColor] || colorMap.blue;

  return (
    <div className={`
      card border-l-4 ${color.border}
      p-4 flex flex-col
      hover:shadow-md
      transition-shadow duration-200
      ${className}
    `}>
      {/* Header with icon and label */}
      <div className="flex items-center justify-between mb-4">
        <p className="metric-label">
          {label}
        </p>
        {icon && (
          <div className={`${color.icon} flex-shrink-0`}>
            {typeof icon === 'string'
              ? <span className="text-2xl">{icon}</span>
              : <div className="text-2xl w-6 h-6">{icon}</div>
            }
          </div>
        )}
      </div>

      {/* Main value */}
      <p className="metric-large text-gray-900 mb-2">
        {value}
      </p>

      {/* Subtext */}
      {subtext && (
        <p className="text-xs text-gray-600 leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
}
