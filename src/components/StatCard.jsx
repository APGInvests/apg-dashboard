/**
 * Redesigned StatCard Component - Futuristic Theme
 * Displays a metric with icon, main value, and supporting text
 * Features: Glass morphism, glow effects, Lucide icon support
 */

export function StatCard({
  icon,
  label,
  value,
  subtext,
  accentColor = 'cyan',
  className = '',
}) {
  // Cyber color palette mapping
  const colorMap = {
    cyan: {
      text: 'text-cyber-cyan',
      glow: 'glow-border-cyan border-cyber-cyan/70',
      bg: 'from-cyber-cyan/10 to-transparent',
    },
    green: {
      text: 'text-cyber-green',
      glow: 'glow-border-green border-cyber-green/70',
      bg: 'from-cyber-green/10 to-transparent',
    },
    purple: {
      text: 'text-cyber-purple',
      glow: 'glow-border-purple border-cyber-purple/70',
      bg: 'from-cyber-purple/10 to-transparent',
    },
    pink: {
      text: 'text-cyber-pink',
      glow: 'glow-border-pink border-cyber-pink/70',
      bg: 'from-cyber-pink/10 to-transparent',
    },
    blue: {
      text: 'text-cyber-blue',
      glow: 'glow-border-cyan border-cyber-blue/70',
      bg: 'from-cyber-blue/10 to-transparent',
    },
    red: {
      text: 'text-cyber-red',
      glow: 'border-cyber-red/70',
      bg: 'from-cyber-red/10 to-transparent',
    },
    teal: {
      text: 'text-cyber-teal',
      glow: 'border-cyber-teal/70',
      bg: 'from-cyber-teal/10 to-transparent',
    },
  };

  const color = colorMap[accentColor] || colorMap.cyan;

  return (
    <div className={`
      glass-card p-5 flex flex-col
      border-l-4 ${color.glow}
      hover:border-l-[6px] hover:shadow-lg
      transition-all duration-300
      backdrop-blur-xl bg-gradient-to-br ${color.bg} bg-slate-900/40
      ${className}
    `}>
      {/* Header with icon and label */}
      <div className="flex items-center justify-between mb-4">
        <p className="metric-label text-slate-300">
          {label}
        </p>
        {icon && (
          <div className={`${color.text} flex-shrink-0`}>
            {typeof icon === 'string'
              ? <span className="text-2xl">{icon}</span>
              : <div className="text-2xl w-6 h-6">{icon}</div>
            }
          </div>
        )}
      </div>

      {/* Main value with glow effect */}
      <p className={`metric-large ${color.text} mb-2 drop-shadow-lg`}>
        {value}
      </p>

      {/* Subtext */}
      {subtext && (
        <p className="text-xs text-slate-400 leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
}
