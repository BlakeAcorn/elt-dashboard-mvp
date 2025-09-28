import api from './api';

// HubSpot service for frontend
export const hubspotService = {
  // Get pipeline metrics
  getPipelineMetrics: async () => {
    return api.get('/hubspot/pipeline');
  },

  // Get revenue metrics
  getRevenueMetrics: async () => {
    return api.get('/hubspot/revenue');
  },

  // Get deals data
  getDeals: async () => {
    return api.get('/hubspot/deals');
  },

  // Get contacts data
  getContacts: async () => {
    return api.get('/hubspot/contacts');
  },

  // Get companies data
  getCompanies: async () => {
    return api.get('/hubspot/companies');
  },

  // Sync HubSpot data to local database
  syncData: async (dataType) => {
    return api.post('/hubspot/sync', { dataType });
  },

  // Get all HubSpot data
  getAllData: async () => {
    return api.get('/hubspot/all');
  }
};

export default hubspotService;
