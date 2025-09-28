const axios = require('axios');

class HubSpotService {
  constructor() {
    this.apiKey = process.env.HUBSPOT_API_KEY || '6376bc5a-227c-443e-af3c-f887f80f0b78';
    this.baseURL = 'https://api.hubapi.com';
  }

  // Get deals data for pipeline analysis
  async getDeals() {
    try {
      const response = await axios.get(`${this.baseURL}/crm/v3/objects/deals`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          properties: 'dealname,amount,dealstage,closedate,createdate,pipeline',
          limit: 100
        }
      });
      
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching HubSpot deals:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get contacts data for customer analysis
  async getContacts() {
    try {
      const response = await axios.get(`${this.baseURL}/crm/v3/objects/contacts`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          properties: 'firstname,lastname,email,company,createdate,lastmodifieddate',
          limit: 100
        }
      });
      
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching HubSpot contacts:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get companies data for revenue analysis
  async getCompanies() {
    try {
      const response = await axios.get(`${this.baseURL}/crm/v3/objects/companies`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          properties: 'name,domain,industry,annualrevenue,createdate,lastmodifieddate',
          limit: 100
        }
      });
      
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching HubSpot companies:', error.response?.data || error.message);
      throw error;
    }
  }

  // Calculate pipeline metrics
  async getPipelineMetrics() {
    try {
      const deals = await this.getDeals();
      
      const metrics = {
        totalDeals: deals.length,
        totalPipelineValue: 0,
        wonDeals: 0,
        wonRevenue: 0,
        activeDeals: 0,
        activePipelineValue: 0,
        averageDealSize: 0,
        winRate: 0
      };

      deals.forEach(deal => {
        const amount = parseFloat(deal.properties.amount) || 0;
        const stage = deal.properties.dealstage;
        const isWon = stage === 'closedwon' || stage === 'closed-won';
        const isActive = stage !== 'closedwon' && stage !== 'closed-lost' && stage !== 'closedwon' && stage !== 'closed-lost';

        metrics.totalPipelineValue += amount;
        
        if (isWon) {
          metrics.wonDeals++;
          metrics.wonRevenue += amount;
        }
        
        if (isActive) {
          metrics.activeDeals++;
          metrics.activePipelineValue += amount;
        }
      });

      metrics.averageDealSize = metrics.totalDeals > 0 ? metrics.totalPipelineValue / metrics.totalDeals : 0;
      metrics.winRate = metrics.totalDeals > 0 ? (metrics.wonDeals / metrics.totalDeals) * 100 : 0;

      return metrics;
    } catch (error) {
      console.error('Error calculating pipeline metrics:', error);
      throw error;
    }
  }

  // Get revenue metrics
  async getRevenueMetrics() {
    try {
      const deals = await this.getDeals();
      const companies = await this.getCompanies();
      
      const currentDate = new Date();
      const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
      const currentYear = currentDate.getFullYear();
      
      const metrics = {
        currentQuarterRevenue: 0,
        previousQuarterRevenue: 0,
        yearToDateRevenue: 0,
        totalRevenue: 0,
        averageDealSize: 0,
        revenueGrowth: 0,
        totalCompanies: companies.length,
        activeDeals: 0
      };

      deals.forEach(deal => {
        const amount = parseFloat(deal.properties.amount) || 0;
        const closeDate = deal.properties.closedate;
        const stage = deal.properties.dealstage;
        const isWon = stage === 'closedwon' || stage === 'closed-won';
        
        if (isWon && closeDate) {
          const dealDate = new Date(closeDate);
          const dealQuarter = Math.ceil((dealDate.getMonth() + 1) / 3);
          const dealYear = dealDate.getFullYear();
          
          metrics.totalRevenue += amount;
          
          if (dealYear === currentYear) {
            metrics.yearToDateRevenue += amount;
            
            if (dealQuarter === currentQuarter) {
              metrics.currentQuarterRevenue += amount;
            } else if (dealQuarter === currentQuarter - 1) {
              metrics.previousQuarterRevenue += amount;
            }
          }
        }
        
        if (stage !== 'closedwon' && stage !== 'closed-lost') {
          metrics.activeDeals++;
        }
      });

      metrics.averageDealSize = metrics.totalRevenue > 0 ? metrics.totalRevenue / deals.length : 0;
      metrics.revenueGrowth = metrics.previousQuarterRevenue > 0 ? 
        ((metrics.currentQuarterRevenue - metrics.previousQuarterRevenue) / metrics.previousQuarterRevenue) * 100 : 0;

      return metrics;
    } catch (error) {
      console.error('Error calculating revenue metrics:', error);
      throw error;
    }
  }
}

module.exports = new HubSpotService();
