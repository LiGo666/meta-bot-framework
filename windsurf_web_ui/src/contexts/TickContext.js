import React, { createContext, useState, useContext, useEffect } from 'react';

const TickContext = createContext();

export const TICK_STAGES = {
  TICK1: {
    id: 1,
    name: 'Human Input',
    description: 'Initial human input to start the cycle',
    color: '#4caf50' // Green
  },
  TICK2: {
    id: 2,
    name: 'Meta Agent Response',
    description: 'All meta agents respond to the human input',
    color: '#2196f3' // Blue
  },
  TICK3: {
    id: 3,
    name: 'Planning & Assignment',
    description: 'Human input + meta agent responses to plan agent assignments',
    color: '#ff9800' // Orange
  },
  TICK4: {
    id: 4,
    name: 'Actor Processing',
    description: 'Actor agents process their assigned tasks',
    color: '#9c27b0' // Purple
  },
  TICK5: {
    id: 5,
    name: 'Meta Review',
    description: 'Meta agents review actor outputs for human supervision',
    color: '#f44336' // Red
  }
};

export const TickProvider = ({ children }) => {
  const [currentTick, setCurrentTick] = useState(1);
  const [tickHistory, setTickHistory] = useState([]);
  const [tickData, setTickData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalTickNumber, setGlobalTickNumber] = useState(0);

  // Load initial tick data
  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchTickData = async () => {
      try {
        // Mock data - would be replaced with actual API call
        const response = await fetch('/api/state');
        const data = await response.json();
        setGlobalTickNumber(data.tick || 0);
        
        // Load tick data for the current tick
        const tickResponse = await fetch(`/api/ticks/${currentTick}`);
        const tickData = await tickResponse.json();
        setTickData(tickData);
        
        // Load tick history
        const historyResponse = await fetch('/api/ticks/history');
        const historyData = await historyResponse.json();
        setTickHistory(historyData);
      } catch (error) {
        console.error('Error fetching tick data:', error);
        // Use mock data for demonstration
        setGlobalTickNumber(7);
        setTickData({});
        setTickHistory([
          { cycleId: 1, completedAt: '2025-05-31T22:30:00Z' },
          { cycleId: 2, completedAt: '2025-05-31T23:00:00Z' },
          { cycleId: 3, completedAt: '2025-05-31T23:30:00Z' },
          { cycleId: 4, completedAt: '2025-06-01T00:00:00Z' },
          { cycleId: 5, completedAt: '2025-06-01T00:30:00Z' }
        ]);
      }
    };

    fetchTickData();
  }, [currentTick]);

  const advanceToNextTick = () => {
    if (currentTick < 5) {
      setCurrentTick(currentTick + 1);
    } else {
      // Start a new cycle
      setTickHistory([...tickHistory, { 
        cycleId: tickHistory.length + 1, 
        completedAt: new Date().toISOString() 
      }]);
      setCurrentTick(1);
    }
  };

  const goToPreviousTick = () => {
    if (currentTick > 1) {
      setCurrentTick(currentTick - 1);
    }
  };

  const startTickProcessing = async () => {
    setIsProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      // Would trigger an actual API call to process the tick
    }, 3000);
  };

  return (
    <TickContext.Provider
      value={{
        currentTick,
        setCurrentTick,
        tickStages: TICK_STAGES,
        tickHistory,
        tickData,
        isProcessing,
        globalTickNumber,
        advanceToNextTick,
        goToPreviousTick,
        startTickProcessing
      }}
    >
      {children}
    </TickContext.Provider>
  );
};

export const useTick = () => useContext(TickContext);
