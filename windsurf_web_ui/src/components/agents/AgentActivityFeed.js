import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import {
  SmartToy as MetaAgentIcon,
  Android as ActorAgentIcon,
  Person as HumanIcon
} from '@mui/icons-material';
import { useAgent } from '../../contexts/AgentContext';

const AgentActivityFeed = () => {
  // Mock activity data for demonstration
  const activityData = [
    {
      id: 1,
      agentId: 'meta_agent_manager',
      agentName: 'Agent Manager',
      type: 'meta',
      action: 'Assigned tasks to actor agents',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      status: 'completed'
    },
    {
      id: 2,
      agentId: 'actor_legal_counsel',
      agentName: 'Legal Counsel',
      type: 'actor',
      action: 'Analyzed compliance requirements',
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      status: 'completed'
    },
    {
      id: 3,
      agentId: 'meta_documenter',
      agentName: 'Documenter',
      type: 'meta',
      action: 'Generated documentation',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      status: 'in_progress'
    },
    {
      id: 4,
      agentId: 'human',
      agentName: 'Human',
      type: 'human',
      action: 'Provided input for next cycle',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      status: 'completed'
    }
  ];

  const getAgentIcon = (type) => {
    switch(type) {
      case 'meta':
        return <MetaAgentIcon />;
      case 'actor':
        return <ActorAgentIcon />;
      case 'human':
        return <HumanIcon />;
      default:
        return <MetaAgentIcon />;
    }
  };

  const getAgentColor = (type) => {
    switch(type) {
      case 'meta':
        return '#3f51b5'; // Indigo
      case 'actor':
        return '#009688'; // Teal
      case 'human':
        return '#607d8b'; // Blue Grey
      default:
        return '#3f51b5';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <Box>
      <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
        {activityData.map((activity, index) => (
          <React.Fragment key={activity.id}>
            {index > 0 && <Divider variant="inset" component="li" />}
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getAgentColor(activity.type) }}>
                  {getAgentIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2">
                      {activity.agentName}
                    </Typography>
                    <Chip 
                      label={activity.status} 
                      size="small" 
                      color={getStatusColor(activity.status)}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      sx={{ display: 'block' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {activity.action}
                    </Typography>
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                    >
                      {formatTimestamp(activity.timestamp)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default AgentActivityFeed;
