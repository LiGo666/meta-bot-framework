import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { useTick } from '../../contexts/TickContext';

const Footer = () => {
  const { isProcessing, currentTick } = useTick();

  return (
    <Box 
      component="footer" 
      sx={{ 
        p: 1, 
        borderTop: '1px solid', 
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      {isProcessing && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            left: 0, 
            right: 0, 
            bottom: '100%', 
            height: 3 
          }} 
        />
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {isProcessing 
            ? `Processing Tick ${currentTick}...` 
            : 'Ready'
          }
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Project Windsurf © {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
