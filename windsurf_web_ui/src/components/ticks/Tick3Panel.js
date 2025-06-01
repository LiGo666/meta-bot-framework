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
  Avatar,
  Chip,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  SmartToy as MetaAgentIcon,
  Android as ActorAgentIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  ArrowForward as AssignIcon
} from '@mui/icons-material';
import { useAgent } from '../../contexts/AgentContext';

const Tick3Panel = () => {
  const { agents } = useAgent();
  const [editMode, setEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  
  // Mock data for planning and assignments
  const mockTasks = [
    {
      id: 1,
      title: 'Create React component structure',
      description: 'Set up the basic component hierarchy for the Windsurf web interface',
      priority: 'high',
      assignedTo: 'actor_case_manager',
      status: 'assigned'
    },
    {
      id: 2,
      title: 'Implement tick navigation',
      description: 'Create controls for navigating between different ticks in the cycle',
      priority: 'medium',
      assignedTo: 'actor_policy_analyst',
      status: 'assigned'
    },
    {
      id: 3,
      title: 'Design agent visualization',
      description: 'Create visual representations of agent interactions and data flow',
      priority: 'medium',
      assignedTo: null,
      status: 'unassigned'
    },
    {
      id: 4,
      title: 'Set up API connections',
      description: 'Implement API calls to fetch tick and agent data from the backend',
      priority: 'high',
      assignedTo: null,
      status: 'unassigned'
    }
  ];
  
  const actorAgents = agents.filter(agent => agent.type === 'actor' && agent.active);
  
  const handleEditAssignment = (task) => {
    setSelectedTask(task);
    setSelectedAgent(task.assignedTo || '');
    setEditMode(true);
  };
  
  const handleSaveAssignment = () => {
    // Would trigger API call to update assignment
    console.log('Assigning task', selectedTask.id, 'to agent', selectedAgent);
    setEditMode(false);
    setSelectedTask(null);
  };
  
  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedTask(null);
  };
  
  const handleAgentChange = (event) => {
    setSelectedAgent(event.target.value);
  };
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'assigned':
        return 'success';
      case 'unassigned':
        return 'warning';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };
  
  const getAgentName = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : 'Unassigned';
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Planning & Assignment
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review task assignments and planning for actor agents.
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1">
          Task Assignments
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<ApproveIcon />}
            sx={{ mr: 1 }}
          >
            Approve All
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<EditIcon />}
          >
            Edit Plan
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Grid container spacing={2}>
          {mockTasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <Card variant="outlined">
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: task.assignedTo ? '#009688' : '#bdbdbd' }}>
                      {task.assignedTo ? <ActorAgentIcon /> : <MetaAgentIcon />}
                    </Avatar>
                  }
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ mr: 1 }}>
                        {task.title}
                      </Typography>
                      <Chip 
                        label={task.priority} 
                        size="small" 
                        color={getPriorityColor(task.priority)}
                      />
                    </Box>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        {task.assignedTo ? `Assigned to: ${getAgentName(task.assignedTo)}` : 'Unassigned'}
                      </Typography>
                      <Chip 
                        label={task.status} 
                        size="small" 
                        color={getStatusColor(task.status)}
                      />
                    </Box>
                  }
                  action={
                    <Box>
                      {editMode && selectedTask && selectedTask.id === task.id ? (
                        <>
                          <IconButton size="small" onClick={handleSaveAssignment} title="Save">
                            <SaveIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={handleCancelEdit} title="Cancel">
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <IconButton size="small" onClick={() => handleEditAssignment(task)} title="Edit assignment">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  }
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {task.description}
                  </Typography>
                  
                  {editMode && selectedTask && selectedTask.id === task.id && (
                    <Box sx={{ mt: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Assign To</InputLabel>
                        <Select
                          value={selectedAgent}
                          label="Assign To"
                          onChange={handleAgentChange}
                        >
                          <MenuItem value="">
                            <em>Unassigned</em>
                          </MenuItem>
                          {actorAgents.map((agent) => (
                            <MenuItem key={agent.id} value={agent.id}>
                              {agent.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Planning Summary
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2">
            Total Tasks: {mockTasks.length}
          </Typography>
          <Typography variant="body2">
            Assigned: {mockTasks.filter(t => t.assignedTo).length}
          </Typography>
          <Typography variant="body2">
            Unassigned: {mockTasks.filter(t => !t.assignedTo).length}
          </Typography>
          <Typography variant="body2">
            High Priority: {mockTasks.filter(t => t.priority === 'high').length}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Tick3Panel;
