import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Button,
  IconButton,
  Collapse
} from '@mui/material';
import { 
  SmartToy as AgentIcon,
  ExpandMore,
  ExpandLess,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useAgent } from '../../contexts/AgentContext';

const Tick2Panel = () => {
  const { getMetaAgents } = useAgent();
  const metaAgents = getMetaAgents();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedAgents, setExpandedAgents] = useState({});
  
  // Mock response data
  const mockResponses = {
    'meta_agent_manager': {
      content: `# Agent Manager Response\n\nI've analyzed the human input and determined the following actions:\n\n1. Assign UI design tasks to relevant agents\n2. Coordinate implementation of web interface\n3. Monitor progress and provide updates\n\nI'll be coordinating with the Documenter and Tool Orchestrator for this task.`,
      files: ['agent_assignments.json', 'coordination_plan.md'],
      timestamp: '2025-06-01T00:35:00Z',
      status: 'completed'
    },
    'meta_documenter': {
      content: `# Documenter Response\n\nI'll be responsible for:\n\n- Creating documentation for the web interface\n- Ensuring code is properly commented\n- Preparing user guides for the interface\n\nI'll work with the Agent Manager to ensure all documentation is comprehensive.`,
      files: ['documentation_plan.md'],
      timestamp: '2025-06-01T00:36:00Z',
      status: 'completed'
    },
    'meta_planner': {
      content: `# Planner Response\n\nHere's my proposed implementation plan:\n\n1. Set up React project structure\n2. Create core components\n3. Implement agent visualization\n4. Add tick navigation\n5. Connect to backend API\n\nEstimated completion time: 3 hours`,
      files: ['implementation_plan.json', 'component_structure.md'],
      timestamp: '2025-06-01T00:37:00Z',
      status: 'completed'
    },
    'meta_protocol_dev': {
      content: `# Protocol Developer Response\n\nI'll define the API protocols for:\n\n- Fetching tick data\n- Agent communication\n- File operations\n- User interactions\n\nAll APIs will follow RESTful design principles.`,
      files: ['api_specs.json'],
      timestamp: '2025-06-01T00:38:00Z',
      status: 'in_progress'
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  
  const toggleAgentExpanded = (agentId) => {
    setExpandedAgents({
      ...expandedAgents,
      [agentId]: !expandedAgents[agentId]
    });
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'default';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Meta Agent Responses
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        View responses from all meta agents to the human input.
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Agents" />
          <Tab label="By Status" />
          <Tab label="By Time" />
        </Tabs>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<RefreshIcon />}
          size="small"
        >
          Refresh
        </Button>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {metaAgents.map((agent) => {
            const response = mockResponses[agent.id];
            const isExpanded = expandedAgents[agent.id] || false;
            
            return (
              <Paper 
                key={agent.id} 
                variant="outlined" 
                sx={{ mb: 2 }}
              >
                <ListItem 
                  button 
                  onClick={() => toggleAgentExpanded(agent.id)}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: '#3f51b5' }}>
                      <AgentIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={agent.name} 
                    secondary={
                      response ? 
                        `Updated ${new Date(response.timestamp).toLocaleTimeString()}` : 
                        'No response yet'
                    }
                  />
                  {response && (
                    <Chip 
                      label={response.status || 'pending'} 
                      size="small" 
                      color={getStatusColor(response.status)}
                      sx={{ mr: 1 }}
                    />
                  )}
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                
                {response && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Response Content:
                      </Typography>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          mb: 2, 
                          maxHeight: 200, 
                          overflow: 'auto',
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'monospace',
                          fontSize: '0.875rem'
                        }}
                      >
                        {response.content}
                      </Paper>
                      
                      {response.files && response.files.length > 0 && (
                        <>
                          <Typography variant="subtitle2" gutterBottom>
                            Generated Files:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {response.files.map((file, index) => (
                              <Chip
                                key={index}
                                label={file}
                                size="small"
                                onClick={() => console.log('View file:', file)}
                              />
                            ))}
                          </Box>
                        </>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton size="small" title="Copy response">
                          <CopyIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" title="Download response">
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Collapse>
                )}
              </Paper>
            );
          })}
        </List>
      </Box>
    </Box>
  );
};

export default Tick2Panel;
