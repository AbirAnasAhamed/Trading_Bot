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
    <div className="relative overflow-hidden bg-panel/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-white/20 transition-all duration-300 group">
      {/* Decorative tech corners */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-tr-2xl pointer-events-none" />
      <div className="absolute top-3 right-3 w-2 h-2 border-t-2 border-r-2 border-white/20 rounded-tr-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-3 left-3 w-2 h-2 border-b-2 border-l-2 border-white/20 rounded-bl-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-secondary font-medium tracking-wider uppercase text-xs">{title}</h3>
        <div className={`p-2 ${iconBgColor} bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-bold font-mono tracking-tight ${valueColor} relative z-10 drop-shadow-md`}>{value}</p>
      {subtitle && (
        <p className={`text-sm ${subtitleColor} mt-3 flex items-center relative z-10 opacity-80`}>
          {subtitleIcon && <span className="mr-1">{subtitleIcon}</span>}
          {subtitle}
        </p>
      )}
    </div>
  );
};
