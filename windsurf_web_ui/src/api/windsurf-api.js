import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Tick-related API calls
export const tickApi = {
  // Get current global tick number
  getCurrentTick: async () => {
    try {
      const response = await api.get('/state');
      return response.data;
    } catch (error) {
      console.error('Error fetching current tick:', error);
      throw error;
    }
  },
  
  // Get data for a specific tick
  getTickData: async (tickNumber) => {
    try {
      const response = await api.get(`/ticks/${tickNumber}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tick ${tickNumber} data:`, error);
      throw error;
    }
  },
  
  // Get tick history
  getTickHistory: async () => {
    try {
      const response = await api.get('/ticks/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching tick history:', error);
      throw error;
    }
  },
  
  // Process a tick
  processTick: async (tickNumber, data) => {
    try {
      const response = await api.post(`/ticks/${tickNumber}/process`, data);
      return response.data;
    } catch (error) {
      console.error(`Error processing tick ${tickNumber}:`, error);
      throw error;
    }
  },
  
  // Submit human input for tick 1
  submitHumanInput: async (input) => {
    try {
      const response = await api.post('/ticks/1/input', input);
      return response.data;
    } catch (error) {
      console.error('Error submitting human input:', error);
      throw error;
    }
  },
  
  // Submit human feedback for tick 5
  submitHumanFeedback: async (feedback) => {
    try {
      const response = await api.post('/ticks/5/feedback', feedback);
      return response.data;
    } catch (error) {
      console.error('Error submitting human feedback:', error);
      throw error;
    }
  }
};

// Agent-related API calls
export const agentApi = {
  // Get all agents
  getAllAgents: async () => {
    try {
      const response = await api.get('/agents');
      return response.data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  },
  
  // Get agent by ID
  getAgentById: async (agentId) => {
    try {
      const response = await api.get(`/agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching agent ${agentId}:`, error);
      throw error;
    }
  },
  
  // Get agent outputs for a specific tick
  getAgentOutputs: async (tickNumber, agentId = null) => {
    try {
      const url = agentId 
        ? `/ticks/${tickNumber}/agents/${agentId}/outputs` 
        : `/ticks/${tickNumber}/outputs`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching outputs for tick ${tickNumber}:`, error);
      throw error;
    }
  },
  
  // Update agent status (active/inactive)
  updateAgentStatus: async (agentId, status) => {
    try {
      const response = await api.patch(`/agents/${agentId}`, { active: status });
      return response.data;
    } catch (error) {
      console.error(`Error updating agent ${agentId} status:`, error);
      throw error;
    }
  },
  
  // Update agent assignments
  updateAgentAssignments: async (assignments) => {
    try {
      const response = await api.post('/agents/assignments', { assignments });
      return response.data;
    } catch (error) {
      console.error('Error updating agent assignments:', error);
      throw error;
    }
  }
};

// File-related API calls
export const fileApi = {
  // Get file content
  getFileContent: async (filePath) => {
    try {
      const response = await api.get('/files', { params: { path: filePath } });
      return response.data;
    } catch (error) {
      console.error(`Error fetching file ${filePath}:`, error);
      throw error;
    }
  },
  
  // Compare files
  compareFiles: async (file1Path, file2Path) => {
    try {
      const response = await api.get('/files/compare', { 
        params: { 
          path1: file1Path,
          path2: file2Path
        } 
      });
      return response.data;
    } catch (error) {
      console.error(`Error comparing files:`, error);
      throw error;
    }
  },
  
  // Get files for a specific tick and agent
  getAgentFiles: async (tickNumber, agentId) => {
    try {
      const response = await api.get(`/ticks/${tickNumber}/agents/${agentId}/files`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching files for agent ${agentId} in tick ${tickNumber}:`, error);
      throw error;
    }
  }
};

// System settings API calls
export const settingsApi = {
  // Get system settings
  getSettings: async () => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },
  
  // Update system settings
  updateSettings: async (settings) => {
    try {
      const response = await api.patch('/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
};

export default {
  tick: tickApi,
  agent: agentApi,
  file: fileApi,
  settings: settingsApi
};
