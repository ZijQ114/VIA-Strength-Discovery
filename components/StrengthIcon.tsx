import React from 'react';
import { STRENGTH_ICONS, VIRTUE_COLORS, ALL_STRENGTHS } from '../constants';

interface Props {
  strengthId: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTooltip?: boolean;
}

const StrengthIcon: React.FC<Props> = ({ strengthId, size = 'md', className = '', showTooltip = false }) => {
  const Icon = STRENGTH_ICONS[strengthId];
  const strength = ALL_STRENGTHS.find(s => s.id === strengthId);
  
  if (!Icon || !strength) return <div className="w-8 h-8 bg-gray-200 rounded-full" />;

  const colorClass = VIRTUE_COLORS[strength.virtue];

  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-12 h-12 p-2.5',
    lg: 'w-16 h-16 p-3.5',
    xl: 'w-24 h-24 p-5'
  };

  return (
    <div className={`relative group ${className}`} title={showTooltip ? strength.name : undefined}>
      <div className={`rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-sm ${colorClass} ${sizeClasses[size]}`}>
        <Icon className="w-full h-full" strokeWidth={2} />
      </div>
      {showTooltip && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
          {strength.name}
        </span>
      )}
    </div>
  );
};

export default StrengthIcon;
