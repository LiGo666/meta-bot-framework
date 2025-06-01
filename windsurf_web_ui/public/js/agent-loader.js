/**
 * Windsurf Agent Loader
 * Loads all agents from the /agents directory and populates the UI
 */

(function() {
  // Configuration
  const AGENTS_ENDPOINT = '/api/agents';
  const META_AGENT_PREFIX = 'meta_';
  const HUMAN_AGENT_PREFIX = 'human';
  
  // Agent types
  const agentTypes = {
    META: 'meta',
    ACTOR: 'actor',
    HUMAN: 'human'
  };
  
  // Store loaded agents
  let allAgents = [];
  
  // Determine agent type from agent ID
  function getAgentType(agentId) {
    if (agentId.startsWith(META_AGENT_PREFIX)) {
      return agentTypes.META;
    } else if (agentId.startsWith(HUMAN_AGENT_PREFIX)) {
      return agentTypes.HUMAN;
    } else {
      return agentTypes.ACTOR;
    }
  }
  
  // Format agent name for display
  function formatAgentName(agentId) {
    // Remove prefix
    let name = agentId;
    if (agentId.startsWith(META_AGENT_PREFIX)) {
      name = agentId.substring(META_AGENT_PREFIX.length);
    } else if (agentId.startsWith('agent_')) {
      name = agentId.substring('agent_'.length);
    }
    
    // Convert snake_case to Title Case
    return name.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Create agent card element
  function createAgentCard(agent) {
    const agentType = getAgentType(agent.id);
    const isMetaAgent = agentType === agentTypes.META;
    const isHumanAgent = agentType === agentTypes.HUMAN;
    
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.dataset.agentId = agent.id;
    card.dataset.agentType = agentType;
    
    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'agent-checkbox';
    checkbox.checked = agent.active || false;
    checkbox.addEventListener('change', function() {
      toggleAgentActive(agent.id, this.checked);
    });
    
    // Create avatar
    const avatar = document.createElement('div');
    avatar.className = `agent-avatar ${isMetaAgent ? 'agent-meta' : (isHumanAgent ? 'agent-human' : 'agent-actor')}`;
    avatar.textContent = isMetaAgent ? 'M' : (isHumanAgent ? 'H' : 'A');
    
    // Create info container
    const info = document.createElement('div');
    
    // Create name
    const name = document.createElement('div');
    name.textContent = formatAgentName(agent.id);
    
    // Create description/status
    const description = document.createElement('div');
    description.style.fontSize = '12px';
    description.style.color = '#666';
    description.textContent = agent.description || (agent.active ? 'Active' : 'Inactive');
    
    // Add view system prompt button if agent has a system prompt
    if (agent.systemPrompt) {
      const viewPromptButton = document.createElement('button');
      viewPromptButton.className = 'button button-small';
      viewPromptButton.textContent = 'View Prompt';
      viewPromptButton.style.fontSize = '10px';
      viewPromptButton.style.padding = '2px 4px';
      viewPromptButton.style.marginTop = '4px';
      viewPromptButton.addEventListener('click', function() {
        showSystemPrompt(agent.id, agent.systemPrompt);
      });
      description.appendChild(document.createElement('br'));
      description.appendChild(viewPromptButton);
    }
    
    // Assemble card
    info.appendChild(name);
    info.appendChild(description);
    card.appendChild(checkbox);
    card.appendChild(avatar);
    card.appendChild(info);
    
    return card;
  }
  
  // Show system prompt modal
  function showSystemPrompt(agentId, systemPrompt) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.zIndex = '1000';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.borderRadius = '4px';
    modalContent.style.padding = '20px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '800px';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflow = 'auto';
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    modalHeader.style.marginBottom = '10px';
    
    // Create modal title
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = `System Prompt: ${formatAgentName(agentId)}`;
    modalTitle.style.margin = '0';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', function() {
      document.body.removeChild(modal);
    });
    
    // Create modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    // Create system prompt pre
    const systemPromptPre = document.createElement('pre');
    systemPromptPre.style.whiteSpace = 'pre-wrap';
    systemPromptPre.style.fontFamily = 'monospace';
    systemPromptPre.style.fontSize = '14px';
    systemPromptPre.style.backgroundColor = '#f5f5f5';
    systemPromptPre.style.padding = '10px';
    systemPromptPre.style.borderRadius = '4px';
    systemPromptPre.style.overflow = 'auto';
    systemPromptPre.style.maxHeight = '60vh';
    systemPromptPre.textContent = systemPrompt;
    
    // Assemble modal
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    modalBody.appendChild(systemPromptPre);
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listener to close modal when clicking outside
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }
  
  // Toggle agent active state
  async function toggleAgentActive(agentId, active) {
    try {
      const response = await fetch(`${AGENTS_ENDPOINT}/${agentId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to toggle agent: ${response.statusText}`);
      }
      
      // Update local state
      const agent = allAgents.find(a => a.id === agentId);
      if (agent) {
        agent.active = active;
      }
      
      console.log(`[Agent Loader] Agent ${agentId} ${active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('[Agent Loader] Error toggling agent:', error);
      window.WindsurfErrorHandler?.reportError(error, { context: 'toggleAgentActive', agentId });
    }
  }
  
  // Load all agents from the backend
  async function loadAgents() {
    try {
      const response = await fetch(AGENTS_ENDPOINT);
      
      if (!response.ok) {
        throw new Error(`Failed to load agents: ${response.statusText}`);
      }
      
      const agents = await response.json();
      allAgents = agents;
      
      // Populate UI
      populateAgentColumns(agents);
      
      console.log(`[Agent Loader] Loaded ${agents.length} agents`);
      return agents;
    } catch (error) {
      console.error('[Agent Loader] Error loading agents:', error);
      window.WindsurfErrorHandler?.reportError(error, { context: 'loadAgents' });
      return [];
    }
  }
  
  // Populate agent columns in the UI
  function populateAgentColumns(agents) {
    // Get containers
    const metaAgentsContainer = document.querySelector('.column:nth-child(2) .agent-cards-container');
    const allAgentsContainer = document.querySelector('.column:nth-child(3) .agent-cards-container');
    
    if (!metaAgentsContainer || !allAgentsContainer) {
      console.error('[Agent Loader] Agent containers not found in the DOM');
      return;
    }
    
    // Clear containers
    metaAgentsContainer.innerHTML = '';
    
    // Meta agents section (Column 2)
    const metaAgents = agents.filter(agent => getAgentType(agent.id) === agentTypes.META);
    metaAgents.forEach(agent => {
      metaAgentsContainer.appendChild(createAgentCard(agent));
    });
    
    // All agents section (Column 3)
    // First meta agents
    const metaAgentsSection = document.createElement('div');
    metaAgentsSection.className = 'agent-section';
    metaAgentsSection.innerHTML = '<h4 style="margin-top: 0;">Meta Agents</h4>';
    allAgentsContainer.appendChild(metaAgentsSection);
    
    metaAgents.forEach(agent => {
      metaAgentsSection.appendChild(createAgentCard(agent));
    });
    
    // Then actor agents
    const actorAgentsSection = document.createElement('div');
    actorAgentsSection.className = 'agent-section';
    actorAgentsSection.innerHTML = '<h4 style="margin-top: 24px;">Actor Agents</h4>';
    allAgentsContainer.appendChild(actorAgentsSection);
    
    const actorAgents = agents.filter(agent => getAgentType(agent.id) === agentTypes.ACTOR);
    actorAgents.forEach(agent => {
      actorAgentsSection.appendChild(createAgentCard(agent));
    });
    
    // Human agents if any
    const humanAgents = agents.filter(agent => getAgentType(agent.id) === agentTypes.HUMAN);
    if (humanAgents.length > 0) {
      const humanAgentsSection = document.createElement('div');
      humanAgentsSection.className = 'agent-section';
      humanAgentsSection.innerHTML = '<h4 style="margin-top: 24px;">Human Agents</h4>';
      allAgentsContainer.appendChild(humanAgentsSection);
      
      humanAgents.forEach(agent => {
        humanAgentsSection.appendChild(createAgentCard(agent));
      });
    }
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Add agent containers if they don't exist
    const metaAgentsColumn = document.querySelector('.column:nth-child(2)');
    const metaAgentsContent = metaAgentsColumn?.querySelector('.column-content');
    
    if (metaAgentsColumn && metaAgentsContent) {
      // Move the submit button to the top of column 2
      const columnHeader = metaAgentsColumn.querySelector('.column-header');
      if (columnHeader) {
        // Create submit button for column 2
        const submitButton = document.createElement('button');
        submitButton.className = 'button button-primary';
        submitButton.textContent = 'Submit';
        submitButton.style.marginLeft = '10px';
        
        // Add click event to process human input with selected agents
        submitButton.addEventListener('click', function() {
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
              window.WindsurfLLM?.callLLM(agentId, prompt);
            } catch (error) {
              window.addVerboseLog(`Failed to start LLM call for agent ${agentId}: ${error.message}`, 'error');
            }
          }
        });
        
        // Add the submit button to the column header
        columnHeader.appendChild(submitButton);
        
        // Remove the original submit button from column 1 if it exists
        const originalSubmitButton = document.querySelector('.column:first-child button');
        if (originalSubmitButton) {
          originalSubmitButton.remove();
        }
      }
      
      // Create agent cards container
      const agentCardsContainer = document.createElement('div');
      agentCardsContainer.className = 'agent-cards-container';
      metaAgentsContent.appendChild(agentCardsContainer);
    }
    
    const allAgentsColumn = document.querySelector('.column:nth-child(3) .column-content');
    if (allAgentsColumn) {
      const agentCardsContainer = document.createElement('div');
      agentCardsContainer.className = 'agent-cards-container';
      allAgentsColumn.appendChild(agentCardsContainer);
    }
    
    // Load agents
    loadAgents();
    
    // Add refresh button
    const refreshButton = document.createElement('button');
    refreshButton.className = 'button button-secondary';
    refreshButton.textContent = 'Refresh Agents';
    refreshButton.addEventListener('click', loadAgents);
    
    const headerActions = document.querySelector('.header > div:last-child');
    if (headerActions) {
      headerActions.prepend(refreshButton);
    }
  });
  
  // Expose API
  window.WindsurfAgentLoader = {
    loadAgents,
    getAgentType,
    formatAgentName,
    toggleAgentActive
  };
  
  console.log('[Agent Loader] Initialized');
})();
