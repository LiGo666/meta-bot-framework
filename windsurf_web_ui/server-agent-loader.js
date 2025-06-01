/**
 * Windsurf Agent Loader Server
 * Provides API endpoints to list and manage agents from the /agents directory
 * Integrates with the existing Python Windsurf framework
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

// Constants from the Python code
const AGENT_ACTOR_NAMES = [
  "agent_congress",
  "agent_doj_eoir",
  "agent_dhs_ops",
  "agent_bar",
  "agent_ngos",
  "agent_judiciary",
  "agent_media",
  "agent_civsoc",
  "agent_un",
  "agent_bigtech",
  "agent_academia",
  "agent_children"
];

const AGENT_META_NAMES = [
  "meta_supervisor",
  "meta_planner",
  "meta_tool_orchestrator",
  "meta_topology",
  "meta_protocol_dev",
  "meta_agent_manager",
  "meta_windsurf_ops",
  "meta_documenter",
  "meta_security",
  "meta_simulator"
];

// Path to windsurf directory
const WINDSURF_ROOT = path.join(__dirname, '..');
const AGENTS_DIR = path.join(WINDSURF_ROOT, 'agents');

// Ensure agents directory exists
if (!fs.existsSync(AGENTS_DIR)) {
  console.warn(`Agents directory not found at ${AGENTS_DIR}. Run windsurf_bootstrap.py first.`);
}

// Cache for agent data
let agentCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute

/**
 * Helper to format agent name for display
 * @param {string} agentId - The agent ID to format
 * @returns {string} Formatted agent name
 */
function formatAgentName(agentId) {
  // Remove prefix
  let name = agentId;
  if (agentId.startsWith('meta_')) {
    name = agentId.substring('meta_'.length);
  } else if (agentId.startsWith('agent_')) {
    name = agentId.substring('agent_'.length);
  }
  
  // Convert snake_case to Title Case
  return name.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Helper to determine agent type from agent ID
 * @param {string} agentId - The agent ID to check
 * @returns {string} Agent type (meta, human, or actor)
 */
function getAgentType(agentId) {
  if (AGENT_META_NAMES.includes(agentId)) {
    return 'meta';
  } else if (agentId === 'human') {
    return 'human';
  } else if (AGENT_ACTOR_NAMES.includes(agentId)) {
    return 'actor';
  } else {
    // Default to actor if unknown
    return 'actor';
  }
}

/**
 * Helper to get agent system prompt
 * @param {string} agentDir - Path to the agent directory
 * @returns {string} The agent's system prompt or empty string if not found
 */
function getAgentSystemPrompt(agentDir) {
  try {
    // Check common locations for system prompts
    const possibleLocations = [
      path.join(agentDir, 'system_prompt.md'),
      path.join(agentDir, 'system-prompt.md'),
      path.join(agentDir, 'system-prompt.txt'),
      path.join(agentDir, 'prompt.txt'),
      path.join(agentDir, 'outbox', 'tik1', 'initial-system-prompts.txt'),
      path.join(agentDir, 'outbox', 'tik1', 'system-prompt.txt')
    ];
    
    for (const location of possibleLocations) {
      if (fs.existsSync(location)) {
        console.log(`Found system prompt at ${location} for agent in ${agentDir}`);
        return fs.readFileSync(location, 'utf8');
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error reading system prompt:', error);
    return '';
  }
}

/**
 * Get agent details from directory
 * @param {string} agentId - The agent ID
 * @param {string} agentPath - Path to the agent directory
 * @returns {Object} Agent details
 */
function getAgentDetails(agentId, agentPath) {
  try {
    // Check if agent has a metadata.json file
    const metadataPath = path.join(agentPath, 'metadata.json');
    let metadata = {};
    
    if (fs.existsSync(metadataPath)) {
      try {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      } catch (err) {
        console.error(`Error parsing metadata for agent ${agentId}:`, err);
      }
    }
    
    // Determine agent type
    const type = getAgentType(agentId);
    
    // Check if system prompt exists
    const systemPrompt = getAgentSystemPrompt(agentPath);
    const hasSystemPrompt = systemPrompt.length > 0;
    
    return {
      id: agentId,
      name: metadata.displayName || formatAgentName(agentId),
      type,
      description: metadata.description || '',
      avatar: metadata.avatar || `/img/avatars/${type}-default.png`,
      active: metadata.active !== undefined ? metadata.active : true,
      hasSystemPrompt,
      systemPrompt
    };
  } catch (error) {
    console.error(`Error getting details for agent ${agentId}:`, error);
    return {
      id: agentId,
      name: formatAgentName(agentId),
      description: 'Error loading agent details',
      type: getAgentType(agentId),
      active: false,
      hasSystemPrompt: false,
      systemPrompt: ''
    };
  }
}

/**
 * Get all agents from the agents directory
 * @returns {Array} Array of agent objects with name, type, and other metadata
 */
async function getAllAgents() {
  // Check cache first
  const now = Date.now();
  if (agentCache && now - lastCacheTime < CACHE_DURATION) {
    return agentCache;
  }

  try {
    const agents = [];
    
    // Check if agents directory exists
    if (!fs.existsSync(AGENTS_DIR)) {
      console.warn('Agents directory not found. Please run windsurf_bootstrap.py first.');
      return [];
    }
    
    // Get all agent directories
    const agentDirs = fs.readdirSync(AGENTS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const agentDir of agentDirs) {
      const agentPath = path.join(AGENTS_DIR, agentDir);
      const agentDetails = getAgentDetails(agentDir, agentPath);
      agents.push(agentDetails);
    }

    // Update cache
    agentCache = agents;
    lastCacheTime = now;

    return agents;
  } catch (err) {
    console.error('Error getting agents:', err);
    return [];
  }
}

// Get all agents
router.get('/', async (req, res) => {
  try {
    const agents = await getAllAgents();
    res.json(agents);
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({ error: 'Failed to load agents' });
  }
});

// Get specific agent by ID
router.get('/:agentId', (req, res) => {
  const { agentId } = req.params;
  const agentPath = path.join(AGENTS_DIR, agentId);
  
  if (!fs.existsSync(agentPath)) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  const agentDetails = getAgentDetails(agentId, agentPath);
  res.json(agentDetails);
});

// Toggle agent active state
router.post('/:agentId/toggle', (req, res) => {
  const { agentId } = req.params;
  const { active } = req.body;
  
  const agentPath = path.join(AGENTS_DIR, agentId);
  if (!fs.existsSync(agentPath)) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  try {
    // Update agent metadata
    const metadataPath = path.join(agentPath, 'metadata.json');
    let metadata = {};
    
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    }
    
    metadata.active = active;
    
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Invalidate cache
    agentCache = null;
    
    res.json({ success: true, agentId, active });
  } catch (error) {
    console.error(`Error toggling agent ${agentId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get agent system prompt
router.get('/:agentId/system-prompt', (req, res) => {
  const { agentId } = req.params;
  const agentPath = path.join(AGENTS_DIR, agentId);
  
  if (!fs.existsSync(agentPath)) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  const systemPrompt = getAgentSystemPrompt(agentPath);
  res.json({ agentId, systemPrompt });
});

module.exports = router;
