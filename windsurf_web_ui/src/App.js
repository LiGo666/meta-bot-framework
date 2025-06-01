import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import Footer from './components/layout/Footer';
import { TickProvider } from './contexts/TickContext';
import { AgentProvider } from './contexts/AgentContext';
import { SettingsProvider } from './contexts/SettingsContext';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      tickColors: {
        tick1: '#4caf50', // Green
        tick2: '#2196f3', // Blue
        tick3: '#ff9800', // Orange
        tick4: '#9c27b0', // Purple
        tick5: '#f44336', // Red
      },
      agentColors: {
        meta: '#3f51b5', // Indigo
        actor: '#009688', // Teal
        human: '#607d8b', // Blue Grey
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SettingsProvider>
        <TickProvider>
          <AgentProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
              <Header toggleDarkMode={() => setDarkMode(!darkMode)} />
              <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                <Sidebar />
                <MainContent />
              </Box>
              <Footer />
            </Box>
          </AgentProvider>
        </TickProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
