import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Paper,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Button,
  IconButton,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse
} from '@mui/material';
import { 
  Android as ActorAgentIcon,
  ExpandMore,
  ExpandLess,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  Code as CodeIcon,
  Description as FileIcon
} from '@mui/icons-material';
import { useAgent } from '../../contexts/AgentContext';

const Tick4Panel = () => {
  const { getActorAgents } = useAgent();
  const actorAgents = getActorAgents();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedAgents, setExpandedAgents] = useState({});
  const [expandedFiles, setExpandedFiles] = useState({});
  
  // Mock processing data
  const mockProcessing = {
    'actor_legal_counsel': {
      status: 'completed',
      progress: 100,
      startTime: '2025-06-01T00:40:00Z',
      endTime: '2025-06-01T00:43:00Z',
      output: `# Legal Counsel Report\n\nI've reviewed the web interface design and have the following recommendations:\n\n1. Ensure all user data is properly handled according to privacy regulations\n2. Add appropriate disclaimers for any AI-generated content\n3. Include terms of service and privacy policy links in the footer\n\nNo major legal concerns with the current implementation plan.`,
      files: [
        { name: 'legal_review.md', type: 'markdown', size: '2.4 KB' },
        { name: 'privacy_recommendations.json', type: 'json', size: '1.8 KB' }
      ]
    },
    'actor_case_manager': {
      status: 'in_progress',
      progress: 65,
      startTime: '2025-06-01T00:41:00Z',
      endTime: null,
      output: `# Case Manager Progress\n\nCurrently implementing the React component structure for the Windsurf web interface.\n\nCompleted:\n- Basic layout components\n- Context providers\n- Tick navigation\n\nIn progress:\n- Agent visualization\n- File preview functionality`,
      files: [
        { name: 'component_structure.js', type: 'javascript', size: '3.2 KB' },
        { name: 'implementation_status.md', type: 'markdown', size: '1.5 KB' }
      ]
    },
    'actor_policy_analyst': {
      status: 'pending',
      progress: 0,
      startTime: null,
      endTime: null,
      output: '',
      files: []
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
  
  const toggleFileExpanded = (fileId) => {
    setExpandedFiles({
      ...expandedFiles,
      [fileId]: !expandedFiles[fileId]
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
  
  const getFileIcon = (fileType) => {
    switch(fileType) {
      case 'javascript':
      case 'json':
        return <CodeIcon />;
      case 'markdown':
      case 'text':
        return <FileIcon />;
      default:
        return <FileIcon />;
    }
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return 'Not started';
    return new Date(timeString).toLocaleTimeString();
  };
  
  const formatDuration = (startTime, endTime) => {
    if (!startTime) return '0s';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end - start;
    const seconds = Math.floor(durationMs / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Actor Processing
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Monitor actor agents as they process their assigned tasks.
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Actors" />
          <Tab label="Active" />
          <Tab label="Completed" />
          <Tab label="Pending" />
        </Tabs>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<RefreshIcon />}
          size="small"
        >
          Refresh Status
        </Button>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Grid container spacing={2}>
          {actorAgents.map((agent) => {
            const processing = mockProcessing[agent.id] || { 
              status: 'pending', 
              progress: 0,
              startTime: null,
              endTime: null,
              output: '',
              files: []
            };
            const isExpanded = expandedAgents[agent.id] || false;
            
            // Skip based on selected tab
            if (selectedTab === 1 && processing.status !== 'in_progress') return null;
            if (selectedTab === 2 && processing.status !== 'completed') return null;
            if (selectedTab === 3 && processing.status !== 'pending') return null;
            
            return (
              <Grid item xs={12} key={agent.id}>
                <Card variant="outlined">
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: '#009688' }}>
                        <ActorAgentIcon />
                      </Avatar>
                    }
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ mr: 1 }}>
                          {agent.name}
                        </Typography>
                        <Chip 
                          label={processing.status} 
                          size="small" 
                          color={getStatusColor(processing.status)}
                        />
                      </Box>
                    }
                    subheader={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Started: {formatTime(processing.startTime)}
                        </Typography>
                        {processing.endTime && (
                          <Typography variant="body2" color="text.secondary">
                            Completed: {formatTime(processing.endTime)}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          Duration: {formatDuration(processing.startTime, processing.endTime)}
                        </Typography>
                      </Box>
                    }
                    action={
                      <IconButton 
                        onClick={() => toggleAgentExpanded(agent.id)}
                        sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                      >
                        <ExpandMore />
                      </IconButton>
                    }
                  />
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={processing.progress} 
                    color={getStatusColor(processing.status)}
                    sx={{ height: 4 }}
                  />
                  
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <CardContent>
                      {processing.output ? (
                        <>
                          <Typography variant="subtitle2" gutterBottom>
                            Output:
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
                            {processing.output}
                          </Paper>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          No output available yet.
                        </Typography>
                      )}
                      
                      {processing.files && processing.files.length > 0 && (
                        <>
                          <Typography variant="subtitle2" gutterBottom>
                            Generated Files:
                          </Typography>
                          <List>
                            {processing.files.map((file, index) => {
                              const fileId = `${agent.id}-${index}`;
                              const isFileExpanded = expandedFiles[fileId] || false;
                              
                              return (
                                <Paper 
                                  key={fileId} 
                                  variant="outlined" 
                                  sx={{ mb: 1 }}
                                >
                                  <ListItem 
                                    button 
                                    onClick={() => toggleFileExpanded(fileId)}
                                  >
                                    <ListItemIcon>
                                      {getFileIcon(file.type)}
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={file.name} 
                                      secondary={`${file.type} · ${file.size}`}
                                    />
                                    {isFileExpanded ? <ExpandLess /> : <ExpandMore />}
                                  </ListItem>
                                  
                                  <Collapse in={isFileExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                                      <Typography variant="caption" color="text.secondary">
                                        File preview not available in this demo.
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                                        <IconButton size="small" title="View file">
                                          <ViewIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" title="Copy content">
                                          <CopyIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" title="Download file">
                                          <DownloadIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  </Collapse>
                                </Paper>
                              );
                            })}
                          </List>
                        </>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      {processing.status === 'in_progress' && (
                        <Button size="small" color="warning">
                          Pause Processing
                        </Button>
                      )}
                      {processing.status === 'pending' && (
                        <Button size="small" color="primary">
                          Start Processing
                        </Button>
                      )}
                      <Button size="small" color="primary">
                        View Details
                      </Button>
                    </CardActions>
                  </Collapse>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default Tick4Panel;
