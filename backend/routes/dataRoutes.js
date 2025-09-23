const express = require('express');
const router = express.Router();

const database = require('../services/database');

// Get all quarterly data
router.get('/quarterly', async (req, res) => {
  try {
    const { quarter, year } = req.query;
    const data = await database.getQuarterlyData(quarter, year);
    
    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching quarterly data:', error);
    res.status(500).json({ error: 'Failed to fetch quarterly data' });
  }
});

// Get metrics comparison across quarters
router.get('/comparison', async (req, res) => {
  try {
    const { quarters } = req.query;
    let quartersArray = [];
    
    if (quarters) {
      quartersArray = quarters.split(',');
    }
    
    const data = await database.getMetricsComparison(quartersArray);
    
    // Group data by metric for easier comparison
    const groupedData = {};
    data.forEach(row => {
      const key = `${row.year}-${row.quarter}`;
      if (!groupedData[row.metric_name]) {
        groupedData[row.metric_name] = {
          metric_name: row.metric_name,
          metric_unit: row.metric_unit,
          category: row.category,
          quarters: {}
        };
      }
      groupedData[row.metric_name].quarters[key] = {
        value: row.metric_value,
        quarter: row.quarter,
        year: row.year
      };
    });

    res.json({
      success: true,
      data: Object.values(groupedData),
      quarters: [...new Set(data.map(row => `${row.year}-${row.quarter}`))].sort()
    });
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
});

// Get available quarters
router.get('/quarters', async (req, res) => {
  try {
    const data = await database.getQuarterlyData();
    const quarters = [...new Set(data.map(row => `${row.year}-${row.quarter}`))].sort();
    
    res.json({
      success: true,
      quarters: quarters
    });
  } catch (error) {
    console.error('Error fetching quarters:', error);
    res.status(500).json({ error: 'Failed to fetch quarters' });
  }
});

// Get metrics by category
router.get('/metrics/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { quarter, year } = req.query;
    
    let data = await database.getQuarterlyData(quarter, year);
    
    if (category !== 'all') {
      data = data.filter(row => row.category === category);
    }
    
    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching metrics by category:', error);
    res.status(500).json({ error: 'Failed to fetch metrics by category' });
  }
});

// Get dashboard summary statistics
router.get('/summary', async (req, res) => {
  try {
    const data = await database.getQuarterlyData();
    
    const summary = {
      totalMetrics: data.length,
      uniqueMetrics: [...new Set(data.map(row => row.metric_name))].length,
      categories: [...new Set(data.map(row => row.category).filter(Boolean))],
      quarters: [...new Set(data.map(row => `${row.year}-${row.quarter}`))].sort(),
      years: [...new Set(data.map(row => row.year))].sort(),
      latestQuarter: data.length > 0 ? 
        data.reduce((latest, current) => {
          const currentKey = `${current.year}-${current.quarter}`;
          const latestKey = `${latest.year}-${latest.quarter}`;
          return currentKey > latestKey ? current : latest;
        }).year + '-' + data.reduce((latest, current) => {
          const currentKey = `${current.year}-${current.quarter}`;
          const latestKey = `${latest.year}-${latest.quarter}`;
          return currentKey > latestKey ? current : latest;
        }).quarter : null
    };

    res.json({
      success: true,
      summary: summary
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Save dashboard configuration
router.post('/config', async (req, res) => {
  try {
    const { configName, configData } = req.body;
    
    if (!configName || !configData) {
      return res.status(400).json({ error: 'Config name and data are required' });
    }

    await database.saveDashboardConfig(configName, configData);
    
    res.json({
      success: true,
      message: 'Configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving config:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// Get dashboard configuration
router.get('/config/:configName', async (req, res) => {
  try {
    const { configName } = req.params;
    const config = await database.getDashboardConfig(configName);
    
    res.json({
      success: true,
      config: config
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Get trend analysis for a specific metric
router.get('/trend/:metricName', async (req, res) => {
  try {
    const { metricName } = req.params;
    const data = await database.getQuarterlyData();
    
    const metricData = data
      .filter(row => row.metric_name === metricName)
      .sort((a, b) => {
        const aKey = `${a.year}-${a.quarter}`;
        const bKey = `${b.year}-${b.quarter}`;
        return aKey.localeCompare(bKey);
      });

    // Calculate trend
    const trend = {
      metric_name: metricName,
      data_points: metricData.length,
      values: metricData.map(row => ({
        quarter: `${row.year}-${row.quarter}`,
        value: row.metric_value,
        unit: row.metric_unit
      })),
      trend_direction: 'stable'
    };

    if (metricData.length >= 2) {
      const firstValue = metricData[0].metric_value;
      const lastValue = metricData[metricData.length - 1].metric_value;
      const change = ((lastValue - firstValue) / firstValue) * 100;
      
      if (change > 5) trend.trend_direction = 'increasing';
      else if (change < -5) trend.trend_direction = 'decreasing';
      
      trend.change_percentage = change;
    }

    res.json({
      success: true,
      trend: trend
    });
  } catch (error) {
    console.error('Error fetching trend:', error);
    res.status(500).json({ error: 'Failed to fetch trend analysis' });
  }
});

// Get historical data for a specific metric
router.get('/historical/:metricName', async (req, res) => {
  try {
    const { metricName } = req.params;
    const { limit } = req.query;
    
    const data = await database.getHistoricalData(metricName, limit ? parseInt(limit) : null);
    
    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Get quarter-over-quarter comparison for a metric
router.get('/qoq/:metricName', async (req, res) => {
  try {
    const { metricName } = req.params;
    const { quarter, year } = req.query;
    
    if (!quarter || !year) {
      return res.status(400).json({ error: 'Quarter and year are required' });
    }
    
    const comparison = await database.getQuarterOverQuarterComparison(metricName, quarter, parseInt(year));
    
    res.json({
      success: true,
      metric: metricName,
      currentQuarter: `${year}-${quarter}`,
      comparison: comparison
    });
  } catch (error) {
    console.error('Error fetching QoQ comparison:', error);
    res.status(500).json({ error: 'Failed to fetch quarter-over-quarter comparison' });
  }
});

// Get metrics for a specific quarter
router.get('/quarter/:quarter/:year', async (req, res) => {
  try {
    const { quarter, year } = req.params;
    
    const data = await database.getMetricsByQuarter(quarter, parseInt(year));
    
    res.json({
      success: true,
      quarter: quarter,
      year: parseInt(year),
      data: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching quarter data:', error);
    res.status(500).json({ error: 'Failed to fetch quarter data' });
  }
});

// Get available quarters
router.get('/quarters/available', async (req, res) => {
  try {
    const quarters = await database.getAvailableQuarters();
    
    res.json({
      success: true,
      quarters: quarters
    });
  } catch (error) {
    console.error('Error fetching available quarters:', error);
    res.status(500).json({ error: 'Failed to fetch available quarters' });
  }
});

// Get trend data for a specific metric
router.get('/trend-data/:metricName', async (req, res) => {
  try {
    const { metricName } = req.params;
    const { quarters } = req.query;
    
    const data = await database.getTrendData(metricName, quarters ? parseInt(quarters) : 8);
    
    res.json({
      success: true,
      metric: metricName,
      data: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});

// Get all historical data with pagination
router.get('/historical', async (req, res) => {
  try {
    const { limit, offset } = req.query;
    
    const data = await database.getHistoricalData(null, limit ? parseInt(limit) : null);
    
    // Apply offset if provided
    const startIndex = offset ? parseInt(offset) : 0;
    const endIndex = limit ? startIndex + parseInt(limit) : data.length;
    const paginatedData = data.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedData,
      count: paginatedData.length,
      total: data.length,
      offset: startIndex,
      limit: limit ? parseInt(limit) : null
    });
  } catch (error) {
    console.error('Error fetching all historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

module.exports = router;
