import React from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  LinearProgress, 
  Chip,
  Grid
} from '@mui/material';
import { useTick } from '../../contexts/TickContext';
import { useAgent } from '../../contexts/AgentContext';

const TickSummaryCard = () => {
  const { currentTick, isProcessing, globalTickNumber } = useTick();
  const { agents } = useAgent();
  
  // Calculate statistics
  const metaAgentCount = agents.filter(a => a.type === 'meta' && a.active).length;
  const actorAgentCount = agents.filter(a => a.type === 'actor' && a.active).length;
  const totalActiveAgents = metaAgentCount + actorAgentCount;
  
  // Mock data for demonstration
  const fileCount = 12;
  const completedTasks = 8;
  const totalTasks = 15;
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);
  
  return (
    <Box>
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Global Tick:
          </Typography>
          <Typography variant="h6">
            {globalTickNumber}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Current Tick:
          </Typography>
          <Typography variant="h6">
            {currentTick}
          </Typography>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 1 }} />
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Active Agents:
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip 
          label={`Meta: ${metaAgentCount}`} 
          size="small" 
          color="primary" 
          variant="outlined" 
        />
        <Chip 
          label={`Actor: ${actorAgentCount}`} 
          size="small" 
          color="secondary" 
          variant="outlined" 
        />
        <Chip 
          label={`Total: ${totalActiveAgents}`} 
          size="small" 
          variant="outlined" 
        />
      </Box>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Files Generated:
      </Typography>
      <Typography variant="h6" gutterBottom>
        {fileCount}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Task Completion:
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={completionPercentage} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">
            {`${completionPercentage}%`}
          </Typography>
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {completedTasks} of {totalTasks} tasks completed
      </Typography>
      
      {isProcessing && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
            Processing Tick {currentTick}...
          </Typography>
          <LinearProgress sx={{ mt: 1 }} />
        </>
      )}
    </Box>
  );
};

export default TickSummaryCard;
