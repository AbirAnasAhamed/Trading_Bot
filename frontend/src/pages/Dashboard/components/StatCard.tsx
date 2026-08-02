import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  subtitleIcon?: React.ReactNode;
  subtitleColor?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  valueColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  subtitleIcon,
  subtitleColor = 'text-secondary',
  icon,
  iconBgColor,
  valueColor = 'text-primary'
}) => {
  return (
    <div className="bg-panel border border-panel rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-secondary font-medium">{title}</h3>
        <div className={`p-2 ${iconBgColor} bg-opacity-20 rounded-lg`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      {subtitle && (
        <p className={`text-sm ${subtitleColor} mt-2 flex items-center`}>
          {subtitleIcon && <span className="mr-1">{subtitleIcon}</span>}
          {subtitle}
        </p>
      )}
    </div>
  );
};
