import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { dataService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('');
  const [selectedQuarters, setSelectedQuarters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get available quarters and historical data
      const quartersResponse = await dataService.getAvailableQuarters();
      const historicalResponse = await dataService.getHistoricalData();
      
      if (quartersResponse.success && historicalResponse.success) {
        // Calculate summary statistics
        const historicalData = historicalResponse.data || [];
        const uniqueMetrics = [...new Set(historicalData.map(item => item.metric_name))];
        const totalMetrics = historicalData.length;
        const quarters = quartersResponse.quarters || [];
        
        setAnalyticsData({
          summary: {
            totalMetrics,
            uniqueMetrics: uniqueMetrics.length,
            quarters: quarters.length
          },
          quarters: quarters,
          historicalData: historicalData,
          uniqueMetrics: uniqueMetrics
        });
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMetricChange = (metric) => {
    setSelectedMetric(metric);
  };

  const handleQuarterToggle = (quarter) => {
    setSelectedQuarters(prev => 
      prev.includes(quarter) 
        ? prev.filter(q => q !== quarter)
        : [...prev, quarter]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-mint-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gunmetal-200 mt-3">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-mint-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Analytics</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadAnalyticsData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { summary, quarters, uniqueMetrics } = analyticsData || {};

  // Sample data for demonstration - replace with real data
  const sampleTrendData = [
    { quarter: 'Q1 2024', ARR: 6500000, churn: 5.2, deployments: 12 },
    { quarter: 'Q2 2024', ARR: 7200000, churn: 4.8, deployments: 15 },
    { quarter: 'Q3 2024', ARR: 8100000, churn: 4.2, deployments: 18 },
    { quarter: 'Q4 2024', ARR: 9200000, churn: 3.9, deployments: 22 }
  ];

  const sampleComparisonData = [
    { metric: 'ARR', current: 9200000, previous: 8100000, change: 13.6 },
    { metric: 'Churn Rate', current: 3.9, previous: 4.2, change: -7.1 },
    { metric: 'Deployments', current: 22, previous: 18, change: 22.2 }
  ];

  const samplePieData = [
    { name: 'New Customers', value: 45, color: '#23DBA7' },
    { name: 'Existing Customers', value: 35, color: '#FCB01A' },
    { name: 'Enterprise', value: 20, color: '#8B5CF6' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-mint-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gunmetal mb-2">Analytics Dashboard</h1>
          <p className="text-gunmetal-200">Analyze trends and compare metrics across quarters</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gunmetal mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Metric Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Metric
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => handleMetricChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-mint focus:border-mint"
              >
                <option value="">All Metrics</option>
                {uniqueMetrics && uniqueMetrics.map(metric => (
                  <option key={metric} value={metric}>{metric}</option>
                ))}
              </select>
            </div>

            {/* Quarter Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Quarters
              </label>
              <div className="flex flex-wrap gap-2">
                {quarters && quarters.length > 0 ? (
                  quarters.map((quarter) => (
                    <button
                      key={`${quarter.quarter}-${quarter.year}`}
                      onClick={() => handleQuarterToggle(`${quarter.quarter} ${quarter.year}`)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedQuarters.includes(`${quarter.quarter} ${quarter.year}`)
                          ? 'bg-mint text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {quarter.quarter} {quarter.year}
                    </button>
                  ))
                ) : (
                  <span className="text-gray-500">No quarters available</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Metrics</p>
                <p className="text-2xl font-bold text-gray-900">{summary?.totalMetrics || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-mint" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Metrics</p>
                <p className="text-2xl font-bold text-gray-900">{summary?.uniqueMetrics || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-mint" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Points</p>
                <p className="text-2xl font-bold text-gray-900">{summary?.quarters?.length || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-violet" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sampleTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  typeof value === 'number' && name === 'ARR' ? `$${value.toLocaleString()}` : value,
                  name
                ]} />
                <Legend />
                <Line type="monotone" dataKey="ARR" stroke="#23DBA7" strokeWidth={2} />
                <Line type="monotone" dataKey="churn" stroke="#FCB01A" strokeWidth={2} />
                <Line type="monotone" dataKey="deployments" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sampleComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  typeof value === 'number' && name === 'Current' ? `$${value.toLocaleString()}` : value,
                  name
                ]} />
                <Legend />
                <Bar dataKey="current" fill="#23DBA7" />
                <Bar dataKey="previous" fill="#FCB01A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={samplePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {samplePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* No Data State */}
        {(!summary || summary.totalMetrics === 0) && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <PieChartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data Available</h3>
            <p className="text-gray-600 mb-6">
              Upload some data to see analytics and trends. Start by uploading a CSV or Excel file with your quarterly metrics.
            </p>
            <button className="bg-mint text-white px-6 py-3 rounded-lg hover:bg-mint-600 transition-colors">
              Upload Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
