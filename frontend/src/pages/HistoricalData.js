import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dataService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const HistoricalData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableQuarters, setAvailableQuarters] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [quarterData, setQuarterData] = useState([]);
  const [trendData, setTrendData] = useState({});
  const [comparisons, setComparisons] = useState({});

  useEffect(() => {
    loadHistoricalData();
  }, []);

  useEffect(() => {
    if (selectedQuarter) {
      loadQuarterData(selectedQuarter.quarter, selectedQuarter.year);
    }
  }, [selectedQuarter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHistoricalData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading historical data...');
      
      const response = await dataService.getAvailableQuarters();
      console.log('Quarters response:', response);
      
      if (response.success && response.quarters) {
        // Sort quarters from newest to oldest
        const sortedQuarters = response.quarters.sort((a, b) => {
          const yearA = a.year;
          const yearB = b.year;
          const qOrder = { 'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4 };
          if (yearA !== yearB) return yearB - yearA;
          return qOrder[b.quarter] - qOrder[a.quarter];
        });
        
        console.log('Sorted quarters:', sortedQuarters);
        setAvailableQuarters(sortedQuarters);
        
        if (sortedQuarters.length > 0) {
          setSelectedQuarter(sortedQuarters[0]);
          console.log('Selected quarter:', sortedQuarters[0]);
        }
      } else {
        console.error('Failed to load quarters:', response);
        setError('Failed to load available quarters');
        setAvailableQuarters([]);
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
      setError(`Error loading historical data: ${error.message}`);
      setAvailableQuarters([]);
    } finally {
      setLoading(false);
    }
  };

  const loadQuarterData = async (quarter, year) => {
    try {
      console.log(`Loading data for ${quarter} ${year}...`);
      
      // Load quarter data first
      const quarterRes = await dataService.getMetricsByQuarter(quarter, year);
      console.log('Quarter response:', quarterRes);

      if (quarterRes.success) {
        setQuarterData(quarterRes.data || []);
        console.log('Quarter data loaded:', quarterRes.data?.length || 0, 'metrics');
      } else {
        console.error('Failed to load quarter data:', quarterRes);
        setQuarterData([]);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load trend data for key metrics sequentially to avoid rate limiting
      const keyMetrics = ['Total ARR', 'Net New ARR Added', 'Churn', 'NRR', 'Revenue Split - North America', 'Revenue Split - APAC'];
      const trendMap = {};
      
      for (const metric of keyMetrics) {
        try {
          const trendRes = await dataService.getTrendData(metric, 8);
          if (trendRes.success) {
            trendMap[metric] = trendRes.data || [];
            console.log(`Trend data loaded for ${metric}:`, trendRes.data?.length || 0, 'points');
          } else {
            console.error(`Failed to load trend data for ${metric}:`, trendRes);
            trendMap[metric] = [];
          }
          // Add small delay between requests
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error loading trend data for ${metric}:`, error);
          trendMap[metric] = [];
          // Add delay even on error
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      setTrendData(trendMap);
      console.log('Trend data loaded for metrics:', Object.keys(trendMap));

      // Add delay before loading comparisons
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load quarter-over-quarter comparisons sequentially
      const comparisonMap = {};
      
      for (const metric of keyMetrics) {
        try {
          const comparisonRes = await dataService.getQuarterOverQuarterComparison(metric, quarter, year);
          if (comparisonRes.success) {
            comparisonMap[metric] = comparisonRes.comparison;
            console.log(`Comparison loaded for ${metric}`);
          } else {
            console.error(`Failed to load comparison for ${metric}:`, comparisonRes);
          }
          // Add small delay between requests
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error loading comparison for ${metric}:`, error);
          // Add delay even on error
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      setComparisons(comparisonMap);
      console.log('Comparisons loaded:', Object.keys(comparisonMap).length);
    } catch (error) {
      console.error('Error loading quarter data:', error);
      setQuarterData([]);
      setTrendData({});
      setComparisons({});
    }
  };


  const formatValue = (value, unit) => {
    if (unit === 'USD') {
      if (Math.abs(value) >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (Math.abs(value) >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      }
      return `$${value.toLocaleString()}`;
    }
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const prepareChartData = (metricData) => {
    if (!metricData || !Array.isArray(metricData)) {
      console.warn('prepareChartData: metricData is not an array:', metricData);
      return [];
    }
    
    if (metricData.length === 0) {
      console.warn('prepareChartData: metricData is empty');
      return [];
    }
    
    return metricData.map(item => ({
      quarter: `${item.year}-${item.quarter}`,
      value: item.metric_value,
      target: item.target_value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <p className="ml-3 text-gunmetal-200">Loading historical data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-acorn border border-red-200">
        <AlertCircle className="h-8 w-8 mx-auto mb-3" />
        <p className="text-lg">{error}</p>
        <button 
          onClick={() => loadHistoricalData()}
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!selectedQuarter || availableQuarters.length === 0) {
    return (
      <div className="p-6 text-center text-gunmetal-200 bg-white rounded-acorn border border-gunmetal-50">
        <Calendar className="h-8 w-8 mx-auto mb-3" />
        <p className="text-lg">No historical data available. Please upload data via the Data Upload page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-white to-mint-50 min-h-screen p-6">
      {/* Header */}
      <div className="bg-white rounded-acorn p-6 shadow-sm border border-gunmetal-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold font-display leading-7 text-gunmetal sm:truncate sm:text-4xl sm:tracking-tight bg-gradient-to-r from-gunmetal to-mint-600 bg-clip-text text-transparent">
              Historical Data Analysis
            </h2>
            <p className="mt-2 text-base text-gunmetal-200 font-medium">
              Quarter-over-quarter comparisons and trend analysis
            </p>
          </div>
          <div className="flex-shrink-0">
            <Calendar className="h-8 w-8 text-mint" />
          </div>
        </div>
      </div>

      {/* Quarter Selector */}
      <div className="bg-white rounded-acorn p-6 shadow-sm border border-gunmetal-50">
        <h3 className="text-lg font-medium font-display text-gunmetal mb-4">Select Quarter</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {availableQuarters.map((quarter, index) => (
            <button
              key={index}
              onClick={() => setSelectedQuarter(quarter)}
              className={`p-3 rounded-lg border text-center transition-colors ${
                selectedQuarter?.quarter === quarter.quarter && selectedQuarter?.year === quarter.year
                  ? 'bg-mint-100 border-mint-300 text-mint-700'
                  : 'bg-white border-gunmetal-200 text-gunmetal hover:bg-mint-50 hover:border-mint-200'
              }`}
            >
              <div className="font-medium">{quarter.quarter}</div>
              <div className="text-sm">{quarter.year}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedQuarter && (
        <>
          {/* Quarter Overview */}
          <div className="bg-white rounded-acorn p-6 shadow-sm border border-gunmetal-50">
            <h3 className="text-lg font-medium font-display text-gunmetal mb-4">
              {selectedQuarter.quarter} {selectedQuarter.year} Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quarterData.slice(0, 8).map((metric, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gunmetal truncate">{metric.metric_name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      metric.status === 'green' ? 'bg-green-100 text-green-800' :
                      metric.status === 'amber' ? 'bg-amber-100 text-amber-800' :
                      metric.status === 'red' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {metric.status || 'N/A'}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-gunmetal mb-1">
                    {formatValue(metric.metric_value, metric.metric_unit)}
                  </div>
                  {metric.target_value && (
                    <div className="text-sm text-gunmetal-200">
                      Target: {formatValue(metric.target_value, metric.metric_unit)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quarter-over-Quarter Comparisons */}
          <div className="bg-white rounded-acorn p-6 shadow-sm border border-gunmetal-50">
            <h3 className="text-lg font-medium font-display text-gunmetal mb-4 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-mint" />
              Quarter-over-Quarter Comparison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(comparisons).map(([metricName, comparison]) => (
                <div key={metricName} className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gunmetal mb-3">{metricName}</h4>
                  {comparison.current && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gunmetal-200">Current ({selectedQuarter.quarter} {selectedQuarter.year})</span>
                        <span className="font-medium text-gunmetal">
                          {formatValue(comparison.current.metric_value, comparison.current.metric_unit)}
                        </span>
                      </div>
                      {comparison.previous && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gunmetal-200">Previous</span>
                            <span className="font-medium text-gunmetal">
                              {formatValue(comparison.previous.metric_value, comparison.previous.metric_unit)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <span className="text-sm font-medium text-gunmetal">Change</span>
                            <div className={`flex items-center font-medium ${getChangeColor(comparison.change)}`}>
                              {getChangeIcon(comparison.change)}
                              <span className="ml-1">
                                {formatValue(Math.abs(comparison.change), comparison.current.metric_unit)}
                                {comparison.changePercent && ` (${comparison.changePercent.toFixed(1)}%)`}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trend Charts */}
          <div className="bg-white rounded-acorn p-6 shadow-sm border border-gunmetal-50">
            <h3 className="text-lg font-medium font-display text-gunmetal mb-4 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-violet" />
              Historical Trends
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(trendData).map(([metricName, data]) => {
                const chartData = prepareChartData(data);
                if (chartData.length === 0) {
                  return (
                    <div key={metricName} className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gunmetal mb-4">{metricName}</h4>
                      <div className="h-64 flex items-center justify-center text-gunmetal-200">
                        <p>No trend data available</p>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={metricName} className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gunmetal mb-4">{metricName}</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="quarter" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value, name) => [
                              formatValue(value, data[0]?.metric_unit || ''), 
                              name === 'value' ? 'Actual' : 'Target'
                            ]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#23DBA7" 
                            strokeWidth={2}
                            dot={{ fill: '#23DBA7', strokeWidth: 2, r: 4 }}
                            name="Actual"
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
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoricalData;
