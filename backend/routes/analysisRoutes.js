const express = require('express');
const router = express.Router();
const openaiService = require('../services/openaiService');
const database = require('../services/database');

// Get latest stored insights
router.get('/insights', async (req, res) => {
  try {
    const latestInsights = await database.getLatestInsights();
    
    if (latestInsights) {
      res.json({
        success: true,
        insights: latestInsights.insights_text,
        qoqData: latestInsights.qoq_data,
        currentQuarter: latestInsights.current_quarter,
        timestamp: latestInsights.created_at,
        updatedAt: latestInsights.updated_at
      });
    } else {
      res.json({
        success: true,
        insights: null,
        message: 'No insights available. Generate insights to get started.'
      });
    }
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insights'
    });
  }
});

// Generate new AI insights and save to database
router.post('/insights', async (req, res) => {
  try {
    // Get current dashboard data
    const quarterlyData = await database.getQuarterlyData();
    
    // Extract key metrics for analysis
    const dashboardData = extractKeyMetrics(quarterlyData);
    
    // Get QoQ comparisons from request body
    const { qoqComparisons, currentQuarter } = req.body;
    
    // Generate insights using OpenAI with QoQ data
    const analysis = await openaiService.generateInsights(dashboardData, qoqComparisons, currentQuarter);
    
    if (analysis.success) {
      // Save insights to database
      try {
        await database.saveInsights(analysis.analysis, qoqComparisons, currentQuarter);
      } catch (saveError) {
        console.error('Error saving insights:', saveError);
        // Continue even if save fails
      }
      
      res.json({
        success: true,
        insights: analysis.analysis,
        usage: analysis.usage,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: analysis.error
      });
    }
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights'
    });
  }
});

// Get dashboard summary data for analysis
router.get('/dashboard-data', async (req, res) => {
  try {
    const quarterlyData = await database.getQuarterlyData();
    const dashboardData = extractKeyMetrics(quarterlyData);
    
    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Data extraction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extract dashboard data'
    });
  }
});

// Helper function to extract key metrics from quarterly data
function extractKeyMetrics(data) {
  // Default values if no data exists
  const defaultData = {
    totalARR: 6.52,
    targetARR: 7.1,
    arrStatus: 'amber',
    netNewARR: 238,
    targetNetNewARR: 350,
    netNewARRStatus: 'red',
    pipeline: 7.7,
    targetPipeline: 8.5,
    pipelineStatus: 'amber',
    churn: -95,
    targetChurn: -50,
    churnStatus: 'red',
    nrr: 105,
    targetNRR: 110,
    nrrStatus: 'amber',
    burnMultiple: 1.35,
    targetBurnMultiple: 1,
    burnMultipleStatus: 'red',
    cac: 2340,
    targetCAC: 2000,
    cacStatus: 'red',
    deploymentFreq: 12,
    targetDeploymentFreq: 15,
    deploymentFreqStatus: 'amber',
    enps: 50,
    targetENPS: 60,
    enpsStatus: 'amber'
  };

  if (!data || data.length === 0) {
    return defaultData;
  }

  // Extract metrics from database data
  const metrics = {};
  data.forEach(row => {
    const key = row.metric_name.toLowerCase().replace(/[^a-z0-9]/g, '');
    metrics[key] = {
      value: row.metric_value,
      target: row.target_value,
      status: row.status || 'neutral'
    };
  });

  // Map database data to expected format
  return {
    totalARR: metrics.totalarr?.value || defaultData.totalARR,
    targetARR: metrics.totalarr?.target || defaultData.targetARR,
    arrStatus: metrics.totalarr?.status || defaultData.arrStatus,
    netNewARR: metrics.netnewarradded?.value || defaultData.netNewARR,
    targetNetNewARR: metrics.netnewarradded?.target || defaultData.targetNetNewARR,
    netNewARRStatus: metrics.netnewarradded?.status || defaultData.netNewARRStatus,
    pipeline: metrics.pipeline?.value || defaultData.pipeline,
    targetPipeline: metrics.pipeline?.target || defaultData.targetPipeline,
    pipelineStatus: metrics.pipeline?.status || defaultData.pipelineStatus,
    churn: metrics.churn?.value || defaultData.churn,
    targetChurn: metrics.churn?.target || defaultData.targetChurn,
    churnStatus: metrics.churn?.status || defaultData.churnStatus,
    nrr: metrics.nrr?.value || defaultData.nrr,
    targetNRR: metrics.nrr?.target || defaultData.targetNRR,
    nrrStatus: metrics.nrr?.status || defaultData.nrrStatus,
    burnMultiple: metrics.burnmultiple?.value || defaultData.burnMultiple,
    targetBurnMultiple: metrics.burnmultiple?.target || defaultData.targetBurnMultiple,
    burnMultipleStatus: metrics.burnmultiple?.status || defaultData.burnMultipleStatus,
    cac: metrics.cac?.value || defaultData.cac,
    targetCAC: metrics.cac?.target || defaultData.targetCAC,
    cacStatus: metrics.cac?.status || defaultData.cacStatus,
    deploymentFreq: metrics.deploymentfrequency?.value || defaultData.deploymentFreq,
    targetDeploymentFreq: metrics.deploymentfrequency?.target || defaultData.targetDeploymentFreq,
    deploymentFreqStatus: metrics.deploymentfrequency?.status || defaultData.deploymentFreqStatus,
    enps: metrics.enps?.value || defaultData.enps,
    targetENPS: metrics.enps?.target || defaultData.targetENPS,
    enpsStatus: metrics.enps?.status || defaultData.enpsStatus
  };
}

module.exports = router;
