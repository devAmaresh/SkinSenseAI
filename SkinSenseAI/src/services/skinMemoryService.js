import api from './api';

export const skinMemoryService = {
  // Allergens
  getAllergens: async () => {
    const response = await api.get('/skin-memory/allergens');
    return response.data;
  },

  addAllergen: async (allergenData) => {
    const response = await api.post('/skin-memory/allergens', allergenData);
    return response.data;
  },

  updateAllergen: async (allergenId, updateData) => {
    const response = await api.put(`/skin-memory/allergens/${allergenId}`, updateData);
    return response.data;
  },

  deleteAllergen: async (allergenId) => {
    const response = await api.delete(`/skin-memory/allergens/${allergenId}`);
    return response.data;
  },

  // Skin Issues
  getSkinIssues: async () => {
    const response = await api.get('/skin-memory/issues');
    return response.data;
  },

  addSkinIssue: async (issueData) => {
    const response = await api.post('/skin-memory/issues', issueData);
    return response.data;
  },

  updateSkinIssue: async (issueId, updateData) => {
    const response = await api.put(`/skin-memory/issues/${issueId}`, updateData);
    return response.data;
  },

  deleteSkinIssue: async (issueId) => {
    const response = await api.delete(`/skin-memory/issues/${issueId}`);
    return response.data;
  },

  // Memory & Summary
  getSummary: async () => {
    const response = await api.get('/skin-memory/summary');
    return response.data;
  },

  getMemories: async (entryType = null, limit = 50) => {
    const params = { limit };
    if (entryType) params.entry_type = entryType;
    
    const response = await api.get('/skin-memory/memories', { params });
    return response.data;
  },

  // Reports
  reportReaction: async (reactionData) => {
    const response = await api.post('/skin-memory/report/reaction', reactionData);
    return response.data;
  },

  reportIssue: async (issueData) => {
    const response = await api.post('/skin-memory/report/issue', issueData);
    return response.data;
  },
};