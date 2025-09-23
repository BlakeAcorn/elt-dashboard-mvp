import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Brain, RefreshCw, AlertCircle, CheckCircle, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { dataService } from '../services/api';

const Summary = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [qoqComparisons, setQoqComparisons] = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState(null);
  const [error, setError] = useState(null);

  const loadQoQComparisons = useCallback(async () => {
    try {
      // Get available quarters to find the latest
      const quartersResponse = await dataService.getAvailableQuarters();
      if (quartersResponse.success && quartersResponse.quarters.length > 0) {
        // Sort quarters from newest to oldest and get the latest
        const sortedQuarters = quartersResponse.quarters.sort((a, b) => {
          const yearA = a.year;
          const yearB = b.year;
          const qOrder = { 'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4 };
          if (yearA !== yearB) return yearB - yearA;
          return qOrder[b.quarter] - qOrder[a.quarter];
        });
        
        const latestQuarter = sortedQuarters[0];
        setCurrentQuarter(latestQuarter);
        
        // Get QoQ comparisons for key metrics
        const keyMetrics = [
          'Total ARR', 'Net New ARR Added', 'Churn', 'NRR', 
          'Burn Multiple', 'CAC', 'Deployment Frequency', 'eNPS (Employee Engagement)'
        ];
        
        // Load QoQ comparisons sequentially to avoid rate limiting
        const newQoQComparisons = {};
        
        for (const metric of keyMetrics) {
          try {
            const res = await dataService.getQuarterOverQuarterComparison(metric, latestQuarter.quarter, latestQuarter.year);
            if (res.success) {
              newQoQComparisons[res.metric] = res.comparison;
            }
            // Add small delay between requests
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            console.error(`Error loading QoQ comparison for ${metric}:`, error);
            // Add delay even on error
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        setQoqComparisons(newQoQComparisons);
      }
    } catch (error) {
      console.error('Error loading QoQ comparisons:', error);
      // Don't set error state for QoQ failures, just log them
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/analysis/dashboard-data');
      setDashboardData(response.data);
      
      // Load quarter-over-quarter comparisons
      await loadQoQComparisons();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [loadQoQComparisons]);

  const loadStoredInsights = useCallback(async () => {
    try {
      const response = await api.get('/analysis/insights');
      if (response.success && response.insights) {
        setInsights(response.insights);
        if (response.qoqData) {
          setQoqComparisons(response.qoqData);
        }
        if (response.currentQuarter) {
          setCurrentQuarter(response.currentQuarter);
        }
      }
    } catch (error) {
      console.error('Error loading stored insights:', error);
      // Don't set error state for this, just log it
    }
  }, []);

  // Load dashboard data and stored insights on component mount
  useEffect(() => {
    const initializePage = async () => {
      // First try to load stored insights
      await loadStoredInsights();
      // Then load fresh dashboard data and QoQ comparisons
      await loadDashboardData();
    };
    
    initializePage();
  }, [loadStoredInsights, loadDashboardData]);

  const generateInsights = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      
      // Include QoQ comparisons in the request
      const response = await api.post('/analysis/insights', {
        qoqComparisons: qoqComparisons,
        currentQuarter: currentQuarter
      });
      
      if (response.success) {
        setInsights(response.insights);
      } else {
        setError(response.error || 'Failed to generate insights');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      setError('Failed to generate insights. Blake is making some changes - please try again in a moment.');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatInsights = (text) => {
    if (!text) return '';
    
    // Split by common section headers and format
    const sections = text.split(/(\d+\.\s*[A-Z\s]+:|\n\n)/);
    return sections.map((section, index) => {
      if (section.match(/^\d+\.\s*[A-Z\s]+:$/)) {
        return (
          <h3 key={index} className="text-lg font-semibold text-gunmetal mt-6 mb-3 first:mt-0">
            {section.replace(/^\d+\.\s*/, '')}
          </h3>
        );
      } else if (section.trim() && !section.match(/^\n\n$/)) {
        return (
          <div key={index} className="text-gunmetal-200 leading-relaxed mb-4">
            {section.split('\n').map((line, lineIndex) => (
              line.trim() ? (
                <p key={lineIndex} className="mb-2">
                  {line.trim()}
                </p>
              ) : null
            ))}
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-white to-mint-50 min-h-screen p-6">
      {/* Header */}
      <div className="bg-white rounded-acorn p-6 shadow-sm border border-gunmetal-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display text-gunmetal bg-gradient-to-r from-gunmetal to-mint-600 bg-clip-text text-transparent">
              Summary
            </h1>
            <p className="mt-2 text-base text-gunmetal-200 font-medium">
              Comprehensive overview and executive summary
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-mint" />
          </div>
        </div>
      </div>

      {/* Analysis Controls */}
      <div className="bg-white rounded-acorn p-6 shadow-sm border border-gunmetal-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium font-display text-gunmetal">AI-Powered Analysis</h3>
            {insights && (
              <p className="text-sm text-gunmetal-200 mt-1">
                Last updated: {new Date().toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={generateInsights}
            disabled={analyzing || loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-acorn text-white bg-mint hover:bg-mint-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <>
                <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
                {insights ? 'Refresh Insights' : 'Generate Insights'}
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-acorn">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  Blake is making some changes
                </p>
                <p className="text-sm text-amber-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {dashboardData && (
          <div className="mb-4 p-4 bg-mint-50 border border-mint-200 rounded-acorn">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-mint" />
              <div className="ml-3">
                <p className="text-sm text-mint-800">
                  Dashboard data loaded successfully. Ready for AI analysis.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quarter-over-Quarter Comparison */}
      {qoqComparisons && currentQuarter && (
        <div className="bg-white rounded-acorn p-6 shadow-sm border border-gunmetal-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-mint mr-3" />
              <h3 className="text-lg font-medium font-display text-gunmetal">
                Quarter Comparison: {currentQuarter.quarter} {currentQuarter.year} vs {qoqComparisons['Total ARR']?.previous?.quarter} {qoqComparisons['Total ARR']?.previous?.year}
              </h3>
            </div>
            <div className="text-sm text-gunmetal-200">
              Quarter-over-Quarter Analysis
            </div>
          </div>
          
          {/* Key Metrics Comparison Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {currentQuarter.quarter} {currentQuarter.year}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {qoqComparisons['Total ARR']?.previous?.quarter} {qoqComparisons['Total ARR']?.previous?.year}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(qoqComparisons).map(([metric, comparison]) => {
                  const change = comparison.change;
                  const changePercent = comparison.changePercent;
                  const isPositive = change > 0;
                  const isNegative = change < 0;
                  const isImprovement = (metric === 'Churn' && change < 0) || 
                                       (metric === 'Burn Multiple' && change < 0) || // Lower burn multiple is better
                                       (metric === 'CAC' && change < 0) || // Lower CAC is better
                                       (['Total ARR', 'Net New ARR Added', 'NRR', 'Deployment Frequency', 'eNPS (Employee Engagement)'].includes(metric) && change > 0);

                  let changeText = '';
                  let changeValue = '';
                  if (comparison.current.metric_unit === 'USD') {
                    changeText = `${isPositive ? '+' : ''}$${(change / 1000).toFixed(0)}K`;
                    changeValue = `${isPositive ? '+' : ''}$${(change / 1000).toFixed(0)}K`;
                  } else if (comparison.current.metric_unit === '%') {
                    changeText = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
                    changeValue = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
                  } else {
                    changeText = `${isPositive ? '+' : ''}${change.toFixed(1)}`;
                    changeValue = `${isPositive ? '+' : ''}${change.toFixed(1)}`;
                  }

                  return (
                    <tr key={metric} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {metric}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {comparison.current.metric_value} {comparison.current.metric_unit}
                          </span>
                          {comparison.current.status && (
                            <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block w-fit ${
                              comparison.current.status === 'green' ? 'bg-green-100 text-green-800' :
                              comparison.current.status === 'amber' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {comparison.current.status === 'green' ? 'On Track' :
                               comparison.current.status === 'amber' ? 'At Risk' : 'Behind'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {comparison.previous.metric_value} {comparison.previous.metric_unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
                            {changeValue}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({changePercent?.toFixed(1)}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isImprovement ? (
                          <div className="flex items-center text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="text-sm">Improving</span>
                          </div>
                        ) : isNegative && !isImprovement ? (
                          <div className="flex items-center text-red-600">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            <span className="text-sm">Declining</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-500">
                            <div className="h-4 w-4 rounded-full bg-gray-300 mr-2"></div>
                            <span className="text-sm">Stable</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">Improving Metrics</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-green-900">
                {Object.entries(qoqComparisons).filter(([metric, comparison]) => {
                  const change = comparison.change;
                  return (metric === 'Churn' && change < 0) || 
                         (metric === 'Burn Multiple' && change < 0) ||
                         (metric === 'CAC' && change < 0) ||
                         (['Total ARR', 'Net New ARR Added', 'NRR', 'Deployment Frequency', 'eNPS (Employee Engagement)'].includes(metric) && change > 0);
                }).length}
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center">
                <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800">Declining Metrics</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-red-900">
                {Object.entries(qoqComparisons).filter(([metric, comparison]) => {
                  const change = comparison.change;
                  const isImprovement = (metric === 'Churn' && change < 0) || 
                                       (metric === 'Burn Multiple' && change < 0) || // Lower burn multiple is better
                                       (metric === 'CAC' && change < 0) || // Lower CAC is better
                                       (['Total ARR', 'Net New ARR Added', 'NRR', 'Deployment Frequency', 'eNPS (Employee Engagement)'].includes(metric) && change > 0);
                  return change < 0 && !isImprovement;
                }).length}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="h-5 w-5 rounded-full bg-gray-400 mr-2"></div>
                <span className="text-sm font-medium text-gray-800">Total Metrics</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {Object.keys(qoqComparisons).length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Display */}
      {insights && (
        <div className="bg-white rounded-acorn p-8 shadow-sm border border-gunmetal-50">
          <div className="flex items-center mb-6">
            <Brain className="h-6 w-6 text-mint mr-3" />
            <h2 className="text-2xl font-semibold font-display text-gunmetal">
              AI-Generated Insights
            </h2>
          </div>
          
          <div className="prose max-w-none">
            {formatInsights(insights)}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gunmetal-100">
            <p className="text-sm text-gunmetal-200">
              Generated by OpenAI GPT-4 • {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-acorn p-8 shadow-sm border border-gunmetal-50">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gunmetal-200">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!insights && !loading && !analyzing && (
        <div className="bg-white rounded-acorn p-8 shadow-sm border border-gunmetal-50">
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-mint-50 rounded-full flex items-center justify-center mb-6">
              <Brain className="h-12 w-12 text-mint" />
            </div>
            <h2 className="text-2xl font-semibold font-display text-gunmetal mb-4">
              No Insights Available
            </h2>
            <p className="text-gunmetal-200 max-w-md mx-auto mb-6">
              No stored insights found. Generate your first AI-powered analysis to get started with intelligent business insights.
            </p>
            <button
              onClick={generateInsights}
              disabled={analyzing || loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-acorn text-white bg-mint hover:bg-mint-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Brain className="-ml-1 mr-2 h-5 w-5" />
              Generate First Insights
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
