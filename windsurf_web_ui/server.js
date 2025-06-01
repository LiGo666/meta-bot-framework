const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Import custom routers
const errorHandler = require('./server-error-handler');
const agentLoader = require('./server-agent-loader');

// Middleware
app.use(cors());
app.use(express.json());

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Root directory for Windsurf data
const WINDSURF_ROOT = path.join(__dirname, '..');

// Helper function to read agent directories
const getAgents = () => {
  const agentsDir = path.join(WINDSURF_ROOT, 'agents');
  const agentDirs = fs.readdirSync(agentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  const agents = [];
  
  agentDirs.forEach(agentDir => {
    // Determine agent type based on directory name
    let type = 'actor';
    if (agentDir.startsWith('meta_')) {
      type = 'meta';
    } else if (agentDir === 'human') {
      type = 'human';
    }
    
    agents.push({
      id: agentDir,
      name: agentDir.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type,
      active: true
    });
  });
  
  return agents;
};

// Helper function to get the current global tick
const getCurrentTick = () => {
  try {
    // This is a simplified approach - in a real implementation,
    // we would need to determine the actual current tick from the system
    const metaAgentDir = path.join(WINDSURF_ROOT, 'agents', 'meta_agent_manager');
    const cyclesDir = path.join(metaAgentDir, 'cycles');
    
    if (fs.existsSync(cyclesDir)) {
      const cycles = fs.readdirSync(cyclesDir)
        .filter(file => file.endsWith('.json'))
        .map(file => parseInt(file.replace('.json', '')))
        .sort((a, b) => b - a);
      
      return cycles.length > 0 ? cycles[0] : 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting current tick:', error);
    return 0;
  }
};

// API Routes

// Register custom routers
app.use('/api/errors', errorHandler);
app.use('/api/agents', agentLoader);

// Get system state
app.get('/api/state', (req, res) => {
  const tick = getCurrentTick();
  res.json({ tick });
});

// Get all agents
app.get('/api/agents', (req, res) => {
  try {
    const agents = getAgents();
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get tick data
app.get('/api/ticks/:tickNumber', (req, res) => {
  const { tickNumber } = req.params;
  
  try {
    // In a real implementation, we would fetch actual tick data
    // This is a simplified mock response
    res.json({
      tickNumber: parseInt(tickNumber),
      timestamp: new Date().toISOString(),
      status: 'completed',
      agents: getAgents().map(agent => ({
        ...agent,
        status: Math.random() > 0.3 ? 'completed' : 'in_progress'
      }))
    });
  } catch (error) {
    console.error(`Error fetching tick ${tickNumber} data:`, error);
    res.status(500).json({ error: `Failed to fetch tick ${tickNumber} data` });
  }
});

// Get tick history
app.get('/api/ticks/history', (req, res) => {
  try {
    const currentTick = getCurrentTick();
    
    // Generate mock history data
    const history = [];
    for (let i = 1; i <= currentTick; i++) {
      history.push({
        cycleId: i,
        completedAt: new Date(Date.now() - (currentTick - i) * 3600000).toISOString()
      });
    }
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching tick history:', error);
    res.status(500).json({ error: 'Failed to fetch tick history' });
  }
});

// Process a tick
app.post('/api/ticks/:tickNumber/process', (req, res) => {
  const { tickNumber } = req.params;
  const data = req.body;
  
  // In a real implementation, this would trigger the tick processing
  // For now, just return a success response
  res.json({
    success: true,
    message: `Processing tick ${tickNumber}`,
    data
  });
});

// Submit human input for tick 1
app.post('/api/ticks/1/input', (req, res) => {
  const input = req.body;
  
  // In a real implementation, this would save the human input
  // For now, just return a success response
  res.json({
    success: true,
    message: 'Human input received',
    input
  });
});

// Get agent outputs for a specific tick
app.get('/api/ticks/:tickNumber/outputs', (req, res) => {
  const { tickNumber } = req.params;
  
  try {
    // In a real implementation, we would fetch actual agent outputs
    // This is a simplified mock response
    const outputs = {};
    getAgents().forEach(agent => {
      outputs[agent.id] = {
        content: `Mock output for ${agent.name} in tick ${tickNumber}`,
        files: ['file1.txt', 'file2.json'],
        timestamp: new Date().toISOString(),
        status: Math.random() > 0.3 ? 'completed' : 'in_progress'
      };
    });
    
    res.json(outputs);
  } catch (error) {
    console.error(`Error fetching outputs for tick ${tickNumber}:`, error);
    res.status(500).json({ error: `Failed to fetch outputs for tick ${tickNumber}` });
  }
});

// API endpoint for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Serve the demo HTML file
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'demo.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
