import React from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as PreviousIcon,
  ArrowForward as NextIcon,
  Refresh as RestartIcon,
  SkipNext as SkipIcon,
  PlayArrow as StartIcon
} from '@mui/icons-material';
import { useTick } from '../../contexts/TickContext';

const TickControlBar = () => {
  const { 
    currentTick, 
    isProcessing, 
    advanceToNextTick, 
    goToPreviousTick,
    startTickProcessing
  } = useTick();
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
      <Tooltip title="Previous Tick">
        <span>
          <IconButton 
            onClick={goToPreviousTick}
            disabled={currentTick === 1 || isProcessing}
          >
            <PreviousIcon />
          </IconButton>
        </span>
      </Tooltip>
      
      <Tooltip title="Restart Tick">
        <IconButton disabled={isProcessing}>
          <RestartIcon />
        </IconButton>
      </Tooltip>
      
      {isProcessing ? (
        <Button
          variant="contained"
          color="primary"
          startIcon={<CircularProgress size={20} color="inherit" />}
          sx={{ mx: 1 }}
          disabled
        >
          Processing...
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          startIcon={<StartIcon />}
          onClick={startTickProcessing}
          sx={{ mx: 1 }}
        >
          Process Tick
        </Button>
      )}
      
      <Tooltip title="Skip Tick">
        <IconButton disabled={isProcessing}>
          <SkipIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Next Tick">
        <span>
          <IconButton 
            onClick={advanceToNextTick}
            disabled={currentTick === 5 || isProcessing}
          >
            <NextIcon />
          </IconButton>
        </span>
      </Tooltip>
      
      <Box sx={{ ml: 'auto' }}>
        <Button 
          variant="outlined" 
          color="secondary"
          disabled={isProcessing}
        >
          Save State
        </Button>
      </Box>
    </Box>
  );
};

export default TickControlBar;
