/**
 * Windsurf LLM Simulator
 * Simulates LLM calls and updates the UI with progress
 */

(function() {
  // Configuration
  const LLM_ENDPOINT = '/api/llm';
  const SIMULATION_ENABLED = true; // Set to false to use real LLM calls
  
  // LLM models
  const llmModels = {
    GPT4: 'gpt-4',
    GPT35: 'gpt-3.5-turbo',
    CLAUDE: 'claude-3-opus',
    LLAMA: 'llama-3-70b'
  };
  
  // LLM call states
  const llmStates = {
    IDLE: 'idle',
    PREPARING: 'preparing',
    SENDING: 'sending',
    PROCESSING: 'processing',
    RECEIVING: 'receiving',
    COMPLETE: 'complete',
    ERROR: 'error'
  };
  
  // Active LLM calls
  const activeCalls = new Map();
  
  // Generate a unique call ID
  function generateCallId() {
    return `llm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  
  // Update progress bar
  function updateProgressBar(agentId, progress) {
    const agentCard = document.querySelector(`.agent-card[data-agent-id="${agentId}"]`);
    if (!agentCard) return;
    
    let progressBar = agentCard.querySelector('.progress-bar-container');
    
    if (!progressBar) {
      // Create progress bar if it doesn't exist
      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress-bar-container';
      progressContainer.style.marginTop = '8px';
      
      const progressBarEl = document.createElement('div');
      progressBarEl.className = 'progress-bar';
      progressBarEl.style.width = `${progress}%`;
      
      progressContainer.appendChild(progressBarEl);
      agentCard.appendChild(progressContainer);
    } else {
      // Update existing progress bar
      const progressBarEl = progressBar.querySelector('.progress-bar');
      progressBarEl.style.width = `${progress}%`;
    }
  }
  
  // Update agent status
  function updateAgentStatus(agentId, status) {
    const agentCard = document.querySelector(`.agent-card[data-agent-id="${agentId}"]`);
    if (!agentCard) return;
    
    const statusEl = agentCard.querySelector('div > div:nth-child(2)');
    if (statusEl) {
      statusEl.textContent = status;
    }
  }
  
  // Simulate LLM call
  async function simulateLlmCall(agentId, prompt, model = llmModels.GPT4) {
    const callId = generateCallId();
    
    // Create call object
    const call = {
      id: callId,
      agentId,
      prompt,
      model,
      state: llmStates.IDLE,
      progress: 0,
      startTime: Date.now(),
      endTime: null,
      result: null,
      error: null
    };
    
    // Add to active calls
    activeCalls.set(callId, call);
    
    // Log to verbose window
    window.addVerboseLog(`Starting LLM call for agent ${agentId} with model ${model}`, 'info');
    window.addVerboseLog(`Prompt: ${prompt.substring(0, 100)}...`, 'debug');
    
    try {
      // Update state to preparing
      call.state = llmStates.PREPARING;
      call.progress = 5;
      updateProgressBar(agentId, call.progress);
      updateAgentStatus(agentId, 'Preparing request...');
      window.addVerboseLog(`Agent ${agentId}: Preparing request`, 'debug');
      await sleep(500);
      
      // Update state to sending
      call.state = llmStates.SENDING;
      call.progress = 15;
      updateProgressBar(agentId, call.progress);
      updateAgentStatus(agentId, 'Sending request...');
      window.addVerboseLog(`Agent ${agentId}: Sending request to ${model}`, 'debug');
      await sleep(800);
      
      // Update state to processing
      call.state = llmStates.PROCESSING;
      call.progress = 30;
      updateProgressBar(agentId, call.progress);
      updateAgentStatus(agentId, 'Processing...');
      window.addVerboseLog(`Agent ${agentId}: Request received by LLM, processing`, 'info');
      
      // Simulate processing time based on model and prompt length
      const processingTime = calculateProcessingTime(model, prompt.length);
      const steps = 10;
      const stepTime = processingTime / steps;
      
      for (let i = 0; i < steps; i++) {
        await sleep(stepTime);
        call.progress = 30 + (i + 1) * (60 / steps);
        updateProgressBar(agentId, call.progress);
        
        if (i === Math.floor(steps / 2)) {
          window.addVerboseLog(`Agent ${agentId}: LLM processing at 50%`, 'debug');
        }
      }
      
      // Update state to receiving
      call.state = llmStates.RECEIVING;
      call.progress = 90;
      updateProgressBar(agentId, call.progress);
      updateAgentStatus(agentId, 'Receiving response...');
      window.addVerboseLog(`Agent ${agentId}: Receiving response from LLM`, 'info');
      await sleep(500);
      
      // Generate response
      const response = await generateResponse(agentId, prompt, model);
      
      // Update state to complete
      call.state = llmStates.COMPLETE;
      call.progress = 100;
      call.result = response;
      call.endTime = Date.now();
      updateProgressBar(agentId, call.progress);
      updateAgentStatus(agentId, 'Complete');
      
      // Add response to the UI
      const agentOutputContainer = document.querySelector('.column:nth-child(4) .column-content');
      if (agentOutputContainer) {
        const outputCard = document.createElement('div');
        outputCard.className = 'output-card';
        outputCard.innerHTML = `
          <div class="output-header">
            <strong>${window.WindsurfAgentLoader?.formatAgentName(agentId) || agentId}</strong>
            <span class="timestamp">${new Date().toLocaleTimeString()}</span>
          </div>
          <div class="output-content">
            <pre>${response}</pre>
          </div>
        `;
        agentOutputContainer.appendChild(outputCard);
        
        // Scroll to bottom
        agentOutputContainer.scrollTop = agentOutputContainer.scrollHeight;
      }
      
      return call;
    } catch (error) {
      // Update state to error
      call.state = llmStates.ERROR;
      call.error = error;
      call.endTime = Date.now();
      updateProgressBar(agentId, 0);
      updateAgentStatus(agentId, 'Error');
      
      window.addVerboseLog(`Agent ${agentId}: LLM call failed - ${error.message}`, 'error');
      
      throw error;
    }
  }
  
  // Calculate processing time based on model and prompt length
  function calculateProcessingTime(model, promptLength) {
    // Base time in ms
    let baseTime = 1000;
    
    // Adjust based on model
    switch (model) {
      case llmModels.GPT4:
        baseTime = 2000;
        break;
      case llmModels.GPT35:
        baseTime = 1000;
        break;
      case llmModels.CLAUDE:
        baseTime = 2500;
        break;
      case llmModels.LLAMA:
        baseTime = 3000;
        break;
    }
    
    // Adjust based on prompt length
    const lengthFactor = Math.min(1 + (promptLength / 5000), 3);
    
    // Add some randomness
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    
    return baseTime * lengthFactor * randomFactor;
  }
  
  // Generate a simulated response
  async function generateResponse(agentId, prompt, model) {
    try {
      // Fetch the agent's system prompt from the API
      const response = await fetch(`/api/agents/${agentId}/system-prompt`);
      window.addVerboseLog(`Retrieved system prompt for agent ${agentId}`, 'info');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch system prompt for agent ${agentId}`);
      }
      
      const systemPrompt = await response.text();
      
      // Generate a response based on agent type
      const agentType = window.WindsurfAgentLoader?.getAgentType(agentId) || 'meta';
      
      // Take the first sentence from the system prompt to make it more realistic
      const firstSentence = systemPrompt.split('.')[0] + '.';
      
      let responseText = `${firstSentence} Based on your request, here are my suggestions:\n\n`;
      
      // Generate suggestions based on the agent type
      const suggestions = [];
      
      if (agentType === 'meta') {
        suggestions.push('Analyze the requirements and break them down into manageable tasks');
        suggestions.push('Consider the architectural implications of your approach');
        suggestions.push('Ensure proper error handling and edge case coverage');
        suggestions.push('Document your implementation thoroughly');
      } else if (agentType === 'actor') {
        suggestions.push('Implement the core functionality with proper testing');
        suggestions.push('Optimize for performance and maintainability');
        suggestions.push('Follow best practices for code organization');
        suggestions.push('Ensure compatibility with existing systems');
      } else {
        suggestions.push('Process your request according to standard protocols');
        suggestions.push('Coordinate with other agents as needed');
        suggestions.push('Provide comprehensive documentation of actions taken');
      }
      
      // Add suggestions to response
      for (let i = 0; i < suggestions.length; i++) {
        responseText += `${i + 1}. ${suggestions[i]}\n`;
      }
      
      // Add a conclusion
      responseText += `\nI hope these suggestions are helpful. Let me know if you need more specific guidance on any of these points.`;
      
      return responseText;
    } catch (error) {
      console.error(`Error generating response for agent ${agentId}:`, error);
      throw error;
    }
  }
  
  // Random content generators
  const taskDescriptions = [
    'implementing a new UI component for the dashboard',
    'optimizing database queries for better performance',
    'designing a user authentication system',
    'creating documentation for the API endpoints',
    'refactoring the codebase to improve maintainability'
  ];
  
  const considerations = [
    'ensuring backward compatibility with existing systems',
    'optimizing for performance across different devices',
    'implementing proper error handling and logging',
    'following security best practices to prevent vulnerabilities',
    'making the solution scalable for future growth',
    'adding comprehensive unit and integration tests'
  ];
  
  const implementationSteps = [
    'Set up the development environment and required dependencies',
    'Create the basic structure and interfaces',
    'Implement the core functionality with proper error handling',
    'Write comprehensive tests to ensure reliability',
    'Document the code and API endpoints',
    'Optimize for performance and scalability',
    'Deploy and monitor the solution'
  ];
  
  const recommendations = [
    'start with a proof of concept to validate the approach',
    'use a modular architecture to allow for future extensions',
    'implement comprehensive logging for better debugging',
    'add unit and integration tests to ensure reliability',
    'document the API and code thoroughly',
    'implement a modular design that allows for easy extension and maintenance',
    'use an iterative approach with regular checkpoints to ensure alignment with requirements'
  ];
  
  const topics = [
    'system architecture optimization',
    'frontend performance improvements',
    'security vulnerability assessment',
    'API design and documentation',
    'database schema optimization',
    'user experience enhancement'
  ];
  
  // Helper function to get a random item from an array
  function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // Helper function to sleep for a specified duration
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Make a real LLM call
  async function realLlmCall(agentId, prompt, model = llmModels.GPT4) {
    try {
      window.addVerboseLog(`Making real LLM call for agent ${agentId} with model ${model}`, 'info');
      
      const response = await fetch(LLM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId,
          prompt,
          model
        })
      });
      
      if (!response.ok) {
        throw new Error(`LLM call failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      window.addVerboseLog(`LLM call for agent ${agentId} successful`, 'info');
      
      return result.response;
    } catch (error) {
      window.addVerboseLog(`LLM call for agent ${agentId} failed: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Public API
  window.WindsurfLLM = {
    // Make an LLM call (simulated or real)
    callLLM: async function(agentId, prompt, model = llmModels.GPT4) {
      if (SIMULATION_ENABLED) {
        return simulateLlmCall(agentId, prompt, model);
      } else {
        return realLlmCall(agentId, prompt, model);
      }
    },
    
    // Get all active LLM calls
    getActiveCalls: function() {
      return Array.from(activeCalls.values());
    },
    
    // Get LLM call by ID
    getCall: function(callId) {
      return activeCalls.get(callId);
    },
    
    // Cancel an LLM call
    cancelCall: function(callId) {
      const call = activeCalls.get(callId);
      if (!call) return false;
      
      call.state = llmStates.ERROR;
      call.endTime = Date.now();
      call.error = new Error('Call cancelled by user');
      
      window.addVerboseLog(`LLM call ${callId} cancelled by user`, 'warning');
      
      return true;
    },
    
    // Available LLM models
    models: llmModels,
    
    // LLM call states
    states: llmStates
  };
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    window.addVerboseLog('LLM simulator initialized', 'info');
    window.addVerboseLog(`Simulation mode: ${SIMULATION_ENABLED ? 'ENABLED' : 'DISABLED'}`, 'info');
    
    // Add event listener to the submit button in column 2
    const submitButton = document.querySelector('.column:nth-child(2) .column-header button');
    if (submitButton) {
      submitButton.addEventListener('click', async function() {
        const textarea = document.querySelector('.column:first-child textarea');
        if (!textarea) return;
        
        const prompt = textarea.value.trim();
        if (!prompt) {
          window.addVerboseLog('Cannot submit empty prompt', 'warning');
          return;
        }
        
        window.addVerboseLog(`User submitted prompt: ${prompt.substring(0, 50)}...`, 'info');
        
        // Get all checked meta agents
        const metaAgentCards = document.querySelectorAll('.column:nth-child(2) .agent-card');
        const checkedMetaAgents = Array.from(metaAgentCards)
          .filter(card => card.querySelector('.agent-checkbox').checked)
          .map(card => card.dataset.agentId);
        
        window.addVerboseLog(`Selected meta agents: ${checkedMetaAgents.join(', ')}`, 'info');
        
        // Make LLM calls for each checked meta agent
        for (const agentId of checkedMetaAgents) {
          try {
            window.WindsurfLLM.callLLM(agentId, prompt);
          } catch (error) {
            window.addVerboseLog(`Failed to start LLM call for agent ${agentId}: ${error.message}`, 'error');
          }
        }
      });
    }
  });
})();
