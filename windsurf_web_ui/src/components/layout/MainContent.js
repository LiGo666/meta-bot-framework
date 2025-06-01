import React from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import { useTick } from '../../contexts/TickContext';
import TickControlBar from '../controls/TickControlBar';
import TickSummaryCard from '../controls/TickSummaryCard';
import AgentActivityFeed from '../agents/AgentActivityFeed';

// Import tick-specific panels
import Tick1Panel from '../ticks/Tick1Panel';
import Tick2Panel from '../ticks/Tick2Panel';
import Tick3Panel from '../ticks/Tick3Panel';
import Tick4Panel from '../ticks/Tick4Panel';
import Tick5Panel from '../ticks/Tick5Panel';

const MainContent = () => {
  const { currentTick, tickStages } = useTick();
  
  // Determine which tick panel to show based on currentTick
  const renderTickPanel = () => {
    switch(currentTick) {
      case 1:
        return <Tick1Panel />;
      case 2:
        return <Tick2Panel />;
      case 3:
        return <Tick3Panel />;
      case 4:
        return <Tick4Panel />;
      case 5:
        return <Tick5Panel />;
      default:
        return <Typography>Invalid tick state</Typography>;
    }
  };
  
  const currentTickData = Object.values(tickStages).find(tick => tick.id === currentTick);

  return (
    <Box 
      component="main" 
      sx={{ 
        flexGrow: 1, 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto'
      }}
    >
      {/* Tick Status Header */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2, 
          borderLeft: `6px solid ${currentTickData.color}` 
        }}
      >
        <Typography variant="h5" gutterBottom>
          {currentTickData.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {currentTickData.description}
        </Typography>
        <TickControlBar />
      </Paper>
      
      {/* Main Content Area - Tick-specific Panel */}
      <Box sx={{ display: 'flex', flexGrow: 1, mb: 2 }}>
        <Box sx={{ flexGrow: 1, mr: 2, overflow: 'auto' }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {renderTickPanel()}
          </Paper>
        </Box>
        
        {/* Right Sidebar */}
        <Box sx={{ width: 300 }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              mb: 2,
              height: 'calc(40% - 8px)'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Tick Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TickSummaryCard />
          </Paper>
          
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2,
              height: '60%',
              overflow: 'auto'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Agent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <AgentActivityFeed />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default MainContent;
