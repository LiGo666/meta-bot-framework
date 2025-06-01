import React, { createContext, useState, useContext, useEffect } from 'react';

const AgentContext = createContext();

export const AGENT_TYPES = {
  META: 'meta',
  ACTOR: 'actor',
  HUMAN: 'human'
};

export const AgentProvider = ({ children }) => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentOutputs, setAgentOutputs] = useState({});
  const [agentAssignments, setAgentAssignments] = useState({});

  // Load agent data
  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchAgentData = async () => {
      try {
        // Mock data - would be replaced with actual API call
        const mockAgents = [
          { id: 'meta_agent_manager', name: 'Agent Manager', type: AGENT_TYPES.META, active: true },
          { id: 'meta_documenter', name: 'Documenter', type: AGENT_TYPES.META, active: true },
          { id: 'meta_planner', name: 'Planner', type: AGENT_TYPES.META, active: true },
          { id: 'meta_protocol_dev', name: 'Protocol Developer', type: AGENT_TYPES.META, active: true },
          { id: 'meta_security', name: 'Security', type: AGENT_TYPES.META, active: true },
          { id: 'meta_simulator', name: 'Simulator', type: AGENT_TYPES.META, active: true },
          { id: 'meta_supervisor', name: 'Supervisor', type: AGENT_TYPES.META, active: true },
          { id: 'meta_tool_orchestrator', name: 'Tool Orchestrator', type: AGENT_TYPES.META, active: true },
          { id: 'meta_topology', name: 'Topology', type: AGENT_TYPES.META, active: true },
          { id: 'meta_windsurf_ops', name: 'Windsurf Ops', type: AGENT_TYPES.META, active: true },
          { id: 'actor_legal_counsel', name: 'Legal Counsel', type: AGENT_TYPES.ACTOR, active: true },
          { id: 'actor_case_manager', name: 'Case Manager', type: AGENT_TYPES.ACTOR, active: true },
          { id: 'actor_policy_analyst', name: 'Policy Analyst', type: AGENT_TYPES.ACTOR, active: true },
          { id: 'human', name: 'Human', type: AGENT_TYPES.HUMAN, active: true }
        ];
        
        setAgents(mockAgents);
      } catch (error) {
        console.error('Error fetching agent data:', error);
      }
    };

    fetchAgentData();
  }, []);

  const toggleAgentActive = (agentId) => {
    setAgents(agents.map(agent => 
      agent.id === agentId ? { ...agent, active: !agent.active } : agent
    ));
  };

  const getAgentsByType = (type) => {
    return agents.filter(agent => agent.type === type);
  };

  const getMetaAgents = () => getAgentsByType(AGENT_TYPES.META);
  const getActorAgents = () => getAgentsByType(AGENT_TYPES.ACTOR);

  const updateAgentAssignments = (assignments) => {
    setAgentAssignments(assignments);
  };

  const loadAgentOutputs = async (tick, agentId = null) => {
    try {
      // This would be replaced with an actual API call
      // Mock data for now
      const mockOutputs = {
        'meta_agent_manager': { content: 'Agent Manager output for tick ' + tick },
        'meta_documenter': { content: 'Documenter output for tick ' + tick },
        // ... other agents
      };
      
      setAgentOutputs(mockOutputs);
    } catch (error) {
      console.error('Error loading agent outputs:', error);
    }
  };

  return (
    <AgentContext.Provider
      value={{
        agents,
        selectedAgent,
        setSelectedAgent,
        agentOutputs,
        agentAssignments,
        toggleAgentActive,
        getMetaAgents,
        getActorAgents,
        updateAgentAssignments,
        loadAgentOutputs
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => useContext(AgentContext);
