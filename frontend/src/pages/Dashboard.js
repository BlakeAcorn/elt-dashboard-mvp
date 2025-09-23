import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Percent,
  UserCheck,
  Calendar,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadialBarChart, RadialBar } from 'recharts';
import MetricCard from '../components/MetricCard';
import LoadingSpinner from '../components/LoadingSpinner';

// Key Metric Card Component for larger display
const KeyMetricCard = ({ title, value, change, changeType, icon: Icon, color = 'mint', status, currentValue, targetValue }) => {
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
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className={`rounded-lg p-4 ${bgColorClasses[color]}`}>
            <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
          </div>
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <dt className="text-base font-medium text-gunmetal truncate">{title}</dt>
          <dd className="flex flex-col">
            <div className="text-3xl font-bold text-gunmetal mt-2">{value}</div>
            {change && (
              <div className={`flex items-center text-sm font-medium mt-2 ${
                changeType === 'positive' ? 'text-mint' : 
                changeType === 'negative' ? 'text-blush' : 
                'text-gunmetal'
              }`}>
                {changeType === 'positive' && <TrendingUp className="h-4 w-4 mr-1" />}
                {changeType === 'negative' && <TrendingDown className="h-4 w-4 mr-1" />}
                <span className="truncate">{change}</span>
              </div>
            )}
            {status && (
              <div className={`mt-3 px-3 py-1 rounded-full text-sm font-medium border ${statusClasses[status]}`}>
                {getStatusMessage()}
              </div>
            )}
          </dd>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Key metrics for top section - memoized for performance
  const keyMetricsKPIs = useMemo(() => [
    {
      title: 'Total ARR',
      value: '$6.52M',
      change: 'Target: $7.1M',
      changeType: 'neutral',
      icon: DollarSign,
      color: 'mint',
      status: 'amber',
      currentValue: 6520000,
      targetValue: 7100000
    },
    {
      title: 'Net New ARR Added',
      value: '$238K',
      change: 'Target: $350K',
      changeType: 'neutral',
      icon: TrendingUp,
      color: 'mint',
      status: 'red',
      currentValue: 238000,
      targetValue: 350000
    },
    {
      title: 'Pipeline',
      value: '$7.7M',
      change: 'Target: $8.5M',
      changeType: 'neutral',
      icon: Target,
      color: 'mint',
      status: 'amber',
      currentValue: 7700000,
      targetValue: 8500000
    }
  ], []);

  // Organized by color groups for better visibility
  const growthRetentionKPIs = [
    {
      title: 'Churn',
      value: '($95K)',
      change: '-$45K',
      changeType: 'positive',
      icon: TrendingDown,
      color: 'mint'
    },
    {
      title: 'NRR',
      value: '105%',
      change: '+8%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'mint'
    },
    {
      title: 'ARR Growth (YoY)',
      value: '47%',
      change: '+12%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'mint'
    },
    {
      title: 'Logo ARR Added',
      value: '$4.8K',
      change: '+$1.2K',
      changeType: 'positive',
      icon: DollarSign,
      color: 'mint'
    },
    {
      title: 'Gross Logo Churn',
      value: '5.2%',
      change: '-1.2%',
      changeType: 'positive',
      icon: TrendingDown,
      color: 'mint'
    }
  ];

  const productEngineeringKPIs = [
    {
      title: 'Defect Escape Rate',
      value: '44%',
      change: '-6%',
      changeType: 'positive',
      icon: AlertCircle,
      color: 'violet'
    },
    {
      title: 'Deployment Frequency',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: Activity,
      color: 'violet'
    },
    {
      title: 'Uptime / SLA',
      value: '99.9%',
      change: '+0.1%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'violet'
    },
    {
      title: 'Feature Adoption',
      value: '68%',
      change: '+12%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'violet'
    },
    {
      title: 'Current CSAT',
      value: '84.6%',
      change: '+2.1%',
      changeType: 'positive',
      icon: Users,
      color: 'violet'
    },
    {
      title: 'Target CSAT',
      value: '≥ 90%',
      change: 'On Track',
      changeType: 'positive',
      icon: Target,
      color: 'violet'
    }
  ];

  const peopleCultureKPIs = [
    {
      title: 'Headcount vs. Plan',
      value: '71%',
      change: 'Goal: 100%',
      changeType: 'neutral',
      icon: Users,
      color: 'blush'
    },
    {
      title: 'Attrition % (Voluntary)',
      value: '1.4%',
      change: '-0.3%',
      changeType: 'positive',
      icon: TrendingDown,
      color: 'blush'
    },
    {
      title: 'NPS (Customer Loyalty)',
      value: '42',
      change: '+8',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'blush'
    },
    {
      title: 'CSAT (Support Satisfaction)',
      value: '84.6%',
      change: 'Target: ≥90%',
      changeType: 'neutral',
      icon: CheckCircle,
      color: 'blush'
    },
    {
      title: 'Ticket Volume / Velocity',
      value: '1101 / 213',
      change: '+45 tickets',
      changeType: 'neutral',
      icon: Activity,
      color: 'blush'
    },
    {
      title: 'Time-to-First-Value',
      value: '12 days',
      change: 'Target: 14 days',
      changeType: 'positive',
      icon: Clock,
      color: 'blush'
    },
    {
      title: 'eNPS (Employee Engagement)',
      value: '50',
      change: 'Baseline: 10',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'blush'
    }
  ];

  const financialSalesKPIs = [
    {
      title: 'Burn Multiple',
      value: '1.35',
      change: '-0.2x',
      changeType: 'positive',
      icon: BarChart3,
      color: 'sunray'
    },
    {
      title: 'Runway',
      value: '18 months',
      change: '+2 months',
      changeType: 'positive',
      icon: Calendar,
      color: 'sunray'
    },
    {
      title: 'Gross Margin',
      value: '78%',
      change: '+3%',
      changeType: 'positive',
      icon: Percent,
      color: 'sunray'
    },
    {
      title: 'CAC',
      value: '$2,340',
      change: '-$180',
      changeType: 'positive',
      icon: DollarSign,
      color: 'sunray'
    },
    {
      title: 'CAC Payback Period',
      value: '13 months',
      change: '-1 month',
      changeType: 'positive',
      icon: Target,
      color: 'sunray'
    },
    {
      title: 'ARR per Head',
      value: '$5,230',
      change: '+$420',
      changeType: 'positive',
      icon: UserCheck,
      color: 'sunray'
    },
    {
      title: 'Win Rate',
      value: '14%',
      change: 'Target: ≥30%',
      changeType: 'neutral',
      icon: Target,
      color: 'sunray'
    },
    {
      title: 'Sales Cycle - Mid Market',
      value: '85 days',
      change: '+5 days',
      changeType: 'negative',
      icon: Clock,
      color: 'sunray'
    },
    {
      title: 'Sales Cycle - Enterprise',
      value: '152 days',
      change: 'NA: 149, APAC: 155',
      changeType: 'neutral',
      icon: Clock,
      color: 'sunray'
    },
    {
      title: 'Pipeline Coverage',
      value: '3.2x',
      change: '+0.3x',
      changeType: 'positive',
      icon: BarChart3,
      color: 'sunray'
    },
    {
      title: 'Current ARR per Person',
      value: '$78k',
      change: '+$8k',
      changeType: 'positive',
      icon: UserCheck,
      color: 'sunray'
    },
    {
      title: 'Q1 FY26 Target ARR per Person',
      value: '$96k',
      change: 'Target',
      changeType: 'neutral',
      icon: Target,
      color: 'sunray'
    },
    {
      title: 'Revenue Split - North America',
      value: '30%',
      change: '+5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'sunray'
    },
    {
      title: 'Revenue Split - APAC',
      value: '70%',
      change: '-5%',
      changeType: 'negative',
      icon: DollarSign,
      color: 'sunray'
    }
  ];

  // Sample chart data - memoized for performance
  const arrTrendData = useMemo(() => [
    { quarter: 'Q1 2023', arr: 5200000, target: 5500000 },
    { quarter: 'Q2 2023', arr: 5800000, target: 6000000 },
    { quarter: 'Q3 2023', arr: 6200000, target: 6500000 },
    { quarter: 'Q4 2023', arr: 6500000, target: 7000000 },
    { quarter: 'Q1 2024', arr: 6800000, target: 7200000 },
  ], []);

  const churnData = useMemo(() => [
    { quarter: 'Q1 2023', churn: 6.2 },
    { quarter: 'Q2 2023', churn: 5.8 },
    { quarter: 'Q3 2023', churn: 5.5 },
    { quarter: 'Q4 2023', churn: 5.2 },
    { quarter: 'Q1 2024', churn: 5.0 },
  ], []);


  const gaugeData = useMemo(() => [
    { name: 'CAC Payback', value: 13, fill: '#23DBA7' },
    { name: 'Remaining', value: 2, fill: '#E9FBF6' }
  ], []);

  const revenueSplitData = useMemo(() => [
    { quarter: 'Q1 2023', northAmerica: 10, apac: 90 },
    { quarter: 'Q2 2023', northAmerica: 15, apac: 85 },
    { quarter: 'Q3 2023', northAmerica: 20, apac: 80 },
    { quarter: 'Q4 2023', northAmerica: 25, apac: 75 },
    { quarter: 'Q1 2024', northAmerica: 30, apac: 70 },
  ], []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gradient-to-br from-white to-mint-50 min-h-screen p-4">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between bg-white rounded-acorn p-4 shadow-sm border border-gunmetal-50">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold font-display leading-7 text-gunmetal sm:truncate sm:text-3xl sm:tracking-tight bg-gradient-to-r from-gunmetal to-mint-600 bg-clip-text text-transparent">
            ELT Dashboard
          </h2>
          <p className="mt-1 text-sm text-gunmetal-200 font-medium">
            Comprehensive analytics dashboard for software company KPIs
          </p>
        </div>
        <div className="mt-2 flex md:ml-4 md:mt-0">
          <span className="inline-flex items-center rounded-acorn bg-gradient-to-r from-mint-50 to-mint-100 px-3 py-1 text-xs font-medium text-mint-700 ring-1 ring-inset ring-mint-200 shadow-sm">
            <CheckCircle className="mr-1 h-3 w-3" />
            All systems operational
          </span>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="bg-white rounded-acorn p-6 shadow-sm border border-gunmetal-50">
        <div className="flex items-center mb-4">
          <div className="w-5 h-5 bg-mint rounded mr-3"></div>
          <h3 className="text-xl font-medium font-display text-gunmetal">Key Performance Metrics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {keyMetricsKPIs.map((kpi, index) => (
            <KeyMetricCard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Growth & Retention Metrics (Green) */}
      <div className="bg-white rounded-acorn p-4 shadow-sm border border-gunmetal-50">
        <div className="flex items-center mb-3">
          <div className="w-4 h-4 bg-mint rounded mr-3"></div>
          <h3 className="text-lg font-medium font-display text-gunmetal">Growth & Retention</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {growthRetentionKPIs.map((kpi, index) => (
            <MetricCard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Product & Engineering Metrics (Purple) */}
      <div className="bg-white rounded-acorn p-4 shadow-sm border border-gunmetal-50">
        <div className="flex items-center mb-3">
          <div className="w-4 h-4 bg-violet rounded mr-3"></div>
          <h3 className="text-lg font-medium font-display text-gunmetal">Product & Engineering</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {productEngineeringKPIs.map((kpi, index) => (
            <MetricCard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* People & Culture Metrics (Pink) */}
      <div className="bg-white rounded-acorn p-4 shadow-sm border border-gunmetal-50">
        <div className="flex items-center mb-3">
          <div className="w-4 h-4 bg-blush rounded mr-3"></div>
          <h3 className="text-lg font-medium font-display text-gunmetal">People & Culture</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {peopleCultureKPIs.map((kpi, index) => (
            <MetricCard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Financial & Sales Metrics (Yellow) */}
      <div className="bg-white rounded-acorn p-4 shadow-sm border border-gunmetal-50">
        <div className="flex items-center mb-3">
          <div className="w-4 h-4 bg-sunray rounded mr-3"></div>
          <h3 className="text-lg font-medium font-display text-gunmetal">Financial & Sales</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {financialSalesKPIs.map((kpi, index) => (
            <MetricCard key={index} {...kpi} />
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ARR Trend Chart */}
        <div className="bg-white rounded-acorn p-4 shadow-sm border border-gunmetal-50 hover:shadow-md transition-shadow duration-200">
          <h3 className="text-base font-medium font-display text-gunmetal mb-3 flex items-center">
            <TrendingUp className="mr-2 h-4 w-4 text-mint" />
            ARR Growth Trend
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={arrTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  formatter={(value, name) => [`$${(value / 1000000).toFixed(2)}M`, name]}
                  labelFormatter={(label) => `Quarter: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="arr" 
                  stroke="#23DBA7" 
                  strokeWidth={3}
                  dot={{ fill: '#23DBA7', strokeWidth: 2, r: 4 }}
                  name="Actual ARR"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#FCB01A" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#FCB01A', strokeWidth: 2, r: 4 }}
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn Rate Chart */}
        <div className="bg-white rounded-acorn p-4 shadow-sm border border-gunmetal-50 hover:shadow-md transition-shadow duration-200">
          <h3 className="text-base font-medium font-display text-gunmetal mb-3 flex items-center">
            <TrendingDown className="mr-2 h-4 w-4 text-blush" />
            Customer Churn Rate
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={churnData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Churn Rate']}
                  labelFormatter={(label) => `Quarter: ${label}`}
                />
                <Bar dataKey="churn" fill="#743BFC" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Split Chart */}
        <div className="bg-white rounded-acorn p-4 shadow-sm border border-gunmetal-50 hover:shadow-md transition-shadow duration-200">
          <h3 className="text-base font-medium font-display text-gunmetal mb-3 flex items-center">
            <DollarSign className="mr-2 h-4 w-4 text-sunray" />
            Revenue Split by Region
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSplitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, name === 'northAmerica' ? 'North America' : 'APAC']}
                  labelFormatter={(label) => `Quarter: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="northAmerica" 
                  stroke="#FCB01A" 
                  strokeWidth={3}
                  dot={{ fill: '#FCB01A', strokeWidth: 2, r: 4 }}
                  name="North America"
                />
                <Line 
                  type="monotone" 
                  dataKey="apac" 
                  stroke="#23DBA7" 
                  strokeWidth={3}
                  dot={{ fill: '#23DBA7', strokeWidth: 2, r: 4 }}
                  name="APAC"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* CAC Payback Period Gauge */}
        <div className="bg-white rounded-acorn p-6 shadow-sm border border-gunmetal-50 hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-medium font-display text-gunmetal mb-4 flex items-center">
            <Target className="mr-2 h-5 w-5 text-mint" />
            CAC Payback Period
          </h3>
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={200} height={120}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="60%" 
                  outerRadius="90%" 
                  barSize={20}
                  data={gaugeData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar 
                    dataKey="value" 
                    cornerRadius={10}
                    fill="#23DBA7"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold font-display text-gunmetal">13</div>
                  <div className="text-sm text-gunmetal-200">months</div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-gunmetal-200">Range: 0-15 months</div>
              <div className="text-xs text-mint-600 mt-1">Target: ≤12 months</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-acorn p-6 shadow-sm border border-gunmetal-50 lg:col-span-2 hover:shadow-md transition-shadow duration-200">
          <h3 className="text-lg font-medium font-display text-gunmetal mb-4 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-violet" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-mint-50 border border-mint-100">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-mint" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gunmetal">Q1 2024 data uploaded</p>
                <p className="text-sm text-mint-600">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-violet-50 border border-violet-100">
              <div className="flex-shrink-0">
                <Activity className="h-5 w-5 text-violet" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gunmetal">Dashboard configuration updated</p>
                <p className="text-sm text-violet-600">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-sunray-50 border border-sunray-100">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-sunray" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gunmetal">Churn rate threshold exceeded</p>
                <p className="text-sm text-sunray-600">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
