import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Button, 
  Box, 
  Chip,
  Tooltip
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  Refresh as ResetIcon,
  Save as ExportIcon
} from '@mui/icons-material';
import { useTick } from '../../contexts/TickContext';

const Header = ({ toggleDarkMode, darkMode }) => {
  const { 
    currentTick, 
    tickStages, 
    isProcessing, 
    globalTickNumber,
    startTickProcessing
  } = useTick();

  const currentTickData = Object.values(tickStages).find(tick => tick.id === currentTick);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 2 }}>
          Project Windsurf
        </Typography>
        
        <Chip 
          label={`Global Tick: ${globalTickNumber}`}
          color="secondary"
          size="small"
          sx={{ mr: 2 }}
        />
        
        <Chip 
          label={`Current Cycle: Tick ${currentTick} - ${currentTickData.name}`}
          color="primary"
          sx={{ 
            mr: 2, 
            bgcolor: currentTickData.color,
            color: 'white'
          }}
        />
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Start/Resume Processing">
            <IconButton 
              color="inherit" 
              onClick={startTickProcessing}
              disabled={isProcessing}
            >
              <StartIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Pause Processing">
            <IconButton 
              color="inherit"
              disabled={!isProcessing}
            >
              <PauseIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Reset System">
            <IconButton color="inherit">
              <ResetIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export Results">
            <IconButton color="inherit">
              <ExportIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Toggle Dark Mode">
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
