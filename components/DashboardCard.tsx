
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-card-bg p-6 rounded-lg shadow-md flex items-center">
      <div className={`p-3 rounded-full mr-4`} style={{ backgroundColor: color + '1A' }}>
        <div style={{ color: color }}>{icon}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
