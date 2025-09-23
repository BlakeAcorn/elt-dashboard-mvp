import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

const MetricCard = ({ title, value, change, changeType, icon: Icon, color = 'mint', status, currentValue, targetValue }) => {
  const colorClasses = {
    mint: 'text-mint',
    violet: 'text-violet',
    blush: 'text-blush',
    sunray: 'text-sunray',
    gunmetal: 'text-gunmetal',
  };

  const bgColorClasses = {
    mint: 'bg-mint-50',
    violet: 'bg-violet-50',
    blush: 'bg-blush-50',
    sunray: 'bg-sunray-50',
    gunmetal: 'bg-gunmetal-50',
  };

  const statusClasses = {
    green: 'text-green-600 bg-green-50 border-green-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    red: 'text-red-600 bg-red-50 border-red-200',
  };

  const getStatusMessage = () => {
    if (status) {
      const statusMessages = {
        green: 'On Track',
        amber: 'At Risk',
        red: 'Behind Target',
      };
      return statusMessages[status];
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className={clsx('rounded-lg p-2', bgColorClasses[color])}>
            <Icon className={clsx('h-4 w-4', colorClasses[color])} />
          </div>
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <dt className="text-sm font-medium text-gunmetal truncate">{title}</dt>
          <dd className="flex flex-col">
            <div className="text-xl font-bold text-gunmetal">{value}</div>
            {change && (
              <div className={clsx(
                'flex items-center text-xs font-medium mt-1',
                {
                  'text-mint': changeType === 'positive',
                  'text-blush': changeType === 'negative',
                  'text-gunmetal': changeType === 'neutral',
                }
              )}>
                {changeType === 'positive' && <TrendingUp className="h-3 w-3 mr-1" />}
                {changeType === 'negative' && <TrendingDown className="h-3 w-3 mr-1" />}
                <span className="truncate">{change}</span>
              </div>
            )}
            {status && (
              <div className={clsx(
                'mt-2 px-2 py-1 rounded-full text-xs font-medium border',
                statusClasses[status]
              )}>
                {getStatusMessage()}
              </div>
            )}
          </dd>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
