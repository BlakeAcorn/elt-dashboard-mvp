const express = require('express');
const router = express.Router();
const hubspotService = require('../services/hubspotService');
const database = require('../services/database');

// Get HubSpot pipeline metrics
router.get('/pipeline', async (req, res) => {
  try {
    const metrics = await hubspotService.getPipelineMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching pipeline metrics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch pipeline metrics',
      message: error.message
    });
  }
});

// Get HubSpot revenue metrics
router.get('/revenue', async (req, res) => {
  try {
    const metrics = await hubspotService.getRevenueMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch revenue metrics',
      message: error.message
    });
  }
});

// Get HubSpot deals data
router.get('/deals', async (req, res) => {
  try {
    const deals = await hubspotService.getDeals();
    
    res.json({
      success: true,
      data: deals,
      count: deals.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch deals',
      message: error.message
    });
  }
});

// Get HubSpot contacts data
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await hubspotService.getContacts();
    
    res.json({
      success: true,
      data: contacts,
      count: contacts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch contacts',
      message: error.message
    });
  }
});

// Get HubSpot companies data
router.get('/companies', async (req, res) => {
  try {
    const companies = await hubspotService.getCompanies();
    
    res.json({
      success: true,
      data: companies,
      count: companies.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch companies',
      message: error.message
    });
  }
});

// Sync HubSpot data to local database
router.post('/sync', async (req, res) => {
  try {
    const { dataType } = req.body; // 'pipeline', 'revenue', 'deals', 'contacts', 'companies'
    
    let hubspotData;
    let quarter = 'Q1';
    let year = new Date().getFullYear();
    
    switch (dataType) {
      case 'pipeline':
        hubspotData = await hubspotService.getPipelineMetrics();
        // Store pipeline metrics
        await database.saveQuarterlyData(quarter, year, 'Pipeline Value', hubspotData.totalPipelineValue, 'USD', 'Sales');
        await database.saveQuarterlyData(quarter, year, 'Active Deals', hubspotData.activeDeals, 'Count', 'Sales');
        await database.saveQuarterlyData(quarter, year, 'Win Rate', hubspotData.winRate, '%', 'Sales');
        break;
        
      case 'revenue':
        hubspotData = await hubspotService.getRevenueMetrics();
        // Store revenue metrics
        await database.saveQuarterlyData(quarter, year, 'Current Quarter Revenue', hubspotData.currentQuarterRevenue, 'USD', 'Financial');
        await database.saveQuarterlyData(quarter, year, 'Year to Date Revenue', hubspotData.yearToDateRevenue, 'USD', 'Financial');
        await database.saveQuarterlyData(quarter, year, 'Revenue Growth', hubspotData.revenueGrowth, '%', 'Financial');
        break;
        
      case 'deals':
        hubspotData = await hubspotService.getDeals();
        // Store deals data
        await database.saveQuarterlyData(quarter, year, 'Total Deals', hubspotData.length, 'Count', 'Sales');
        break;
        
      case 'contacts':
        hubspotData = await hubspotService.getContacts();
        // Store contacts data
        await database.saveQuarterlyData(quarter, year, 'Total Contacts', hubspotData.length, 'Count', 'Marketing');
        break;
        
      case 'companies':
        hubspotData = await hubspotService.getCompanies();
        // Store companies data
        await database.saveQuarterlyData(quarter, year, 'Total Companies', hubspotData.length, 'Count', 'Sales');
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid data type. Must be: pipeline, revenue, deals, contacts, or companies'
        });
    }
    
    res.json({
      success: true,
      message: `Successfully synced ${dataType} data from HubSpot`,
      data: hubspotData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error syncing HubSpot data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to sync HubSpot data',
      message: error.message
    });
  }
});

// Get all HubSpot metrics combined
router.get('/all', async (req, res) => {
  try {
    const [pipelineMetrics, revenueMetrics, deals, contacts, companies] = await Promise.all([
      hubspotService.getPipelineMetrics(),
      hubspotService.getRevenueMetrics(),
      hubspotService.getDeals(),
      hubspotService.getContacts(),
      hubspotService.getCompanies()
    ]);
    
    res.json({
      success: true,
      data: {
        pipeline: pipelineMetrics,
        revenue: revenueMetrics,
        deals: deals,
        contacts: contacts,
        companies: companies
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching all HubSpot data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch HubSpot data',
      message: error.message
    });
  }
});

module.exports = router;
