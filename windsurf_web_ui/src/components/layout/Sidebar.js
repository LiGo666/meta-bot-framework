import React, { useState } from 'react';
import { 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Divider,
  Typography,
  Box,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  ExpandLess,
  ExpandMore,
  People as AgentsIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Person as HumanIcon,
  SmartToy as MetaAgentIcon,
  Android as ActorAgentIcon
} from '@mui/icons-material';
import { useTick, TICK_STAGES } from '../../contexts/TickContext';
import { useAgent, AGENT_TYPES } from '../../contexts/AgentContext';
import { useSettings } from '../../contexts/SettingsContext';

const DRAWER_WIDTH = 280;

const Sidebar = () => {
  const { currentTick, setCurrentTick, tickHistory } = useTick();
  const { agents, toggleAgentActive, setSelectedAgent } = useAgent();
  const { settings, updateSetting } = useSettings();
  
  const [openAgents, setOpenAgents] = useState(true);
  const [openMetaAgents, setOpenMetaAgents] = useState(true);
  const [openActorAgents, setOpenActorAgents] = useState(true);
  const [openHistory, setOpenHistory] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  
  const handleTickClick = (tickId) => {
    setCurrentTick(tickId);
  };
  
  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
  };
  
  const metaAgents = agents.filter(agent => agent.type === AGENT_TYPES.META);
  const actorAgents = agents.filter(agent => agent.type === AGENT_TYPES.ACTOR);
  const humanAgents = agents.filter(agent => agent.type === AGENT_TYPES.HUMAN);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Tick Navigator */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Tick Navigator
          </Typography>
          <List>
            {Object.values(TICK_STAGES).map((tick) => (
              <ListItem 
                key={tick.id} 
                disablePadding
                sx={{ 
                  mb: 1,
                  bgcolor: currentTick === tick.id ? `${tick.color}20` : 'transparent',
                  borderLeft: currentTick === tick.id ? `4px solid ${tick.color}` : '4px solid transparent',
                }}
              >
                <ListItemButton 
                  onClick={() => handleTickClick(tick.id)}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemIcon>
                    <TimelineIcon sx={{ color: tick.color }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Tick ${tick.id}: ${tick.name}`} 
                    secondary={tick.description}
                    primaryTypographyProps={{
                      fontWeight: currentTick === tick.id ? 'bold' : 'normal',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        
        <Divider />
        
        {/* Agent Directory */}
        <Box sx={{ p: 2 }}>
          <ListItemButton onClick={() => setOpenAgents(!openAgents)}>
            <ListItemIcon>
              <AgentsIcon />
            </ListItemIcon>
            <ListItemText primary="Agent Directory" />
            {openAgents ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          
          <Collapse in={openAgents} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Human Agents */}
              {humanAgents.length > 0 && (
                <>
                  <ListItem sx={{ pl: 4 }}>
                    <ListItemIcon>
                      <HumanIcon />
                    </ListItemIcon>
                    <ListItemText primary="Human" />
                  </ListItem>
                  
                  {humanAgents.map(agent => (
                    <ListItem 
                      key={agent.id} 
                      sx={{ pl: 6 }}
                      secondaryAction={
                        <Switch
                          edge="end"
                          checked={agent.active}
                          onChange={() => toggleAgentActive(agent.id)}
                        />
                      }
                    >
                      <ListItemButton onClick={() => handleAgentClick(agent)}>
                        <ListItemText primary={agent.name} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </>
              )}
              
              {/* Meta Agents */}
              <ListItemButton onClick={() => setOpenMetaAgents(!openMetaAgents)} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <MetaAgentIcon />
                </ListItemIcon>
                <ListItemText primary="Meta Agents" />
                {openMetaAgents ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <Collapse in={openMetaAgents} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {metaAgents.map(agent => (
                    <ListItem 
                      key={agent.id} 
                      sx={{ pl: 6 }}
                      secondaryAction={
                        <Switch
                          edge="end"
                          checked={agent.active}
                          onChange={() => toggleAgentActive(agent.id)}
                        />
                      }
                    >
                      <ListItemButton onClick={() => handleAgentClick(agent)}>
                        <ListItemText primary={agent.name} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
              
              {/* Actor Agents */}
              <ListItemButton onClick={() => setOpenActorAgents(!openActorAgents)} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <ActorAgentIcon />
                </ListItemIcon>
                <ListItemText primary="Actor Agents" />
                {openActorAgents ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <Collapse in={openActorAgents} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {actorAgents.map(agent => (
                    <ListItem 
                      key={agent.id} 
                      sx={{ pl: 6 }}
                      secondaryAction={
                        <Switch
                          edge="end"
                          checked={agent.active}
                          onChange={() => toggleAgentActive(agent.id)}
                        />
                      }
                    >
                      <ListItemButton onClick={() => handleAgentClick(agent)}>
                        <ListItemText primary={agent.name} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </List>
          </Collapse>
        </Box>
        
        <Divider />
        
        {/* Tick History */}
        <Box sx={{ p: 2 }}>
          <ListItemButton onClick={() => setOpenHistory(!openHistory)}>
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary="Tick History" />
            {openHistory ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          
          <Collapse in={openHistory} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {tickHistory.map((cycle, index) => (
                <ListItem key={index} sx={{ pl: 4 }}>
                  <ListItemText 
                    primary={`Cycle ${cycle.cycleId}`} 
                    secondary={new Date(cycle.completedAt).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
        
        <Divider />
        
        {/* Settings */}
        <Box sx={{ p: 2 }}>
          <ListItemButton onClick={() => setOpenSettings(!openSettings)}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
            {openSettings ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          
          <Collapse in={openSettings} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem sx={{ pl: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoAdvance}
                      onChange={(e) => updateSetting('autoAdvance', e.target.checked)}
                    />
                  }
                  label="Auto-Advance Ticks"
                />
              </ListItem>
              
              <ListItem sx={{ pl: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.showAgentCommunication}
                      onChange={(e) => updateSetting('showAgentCommunication', e.target.checked)}
                    />
                  }
                  label="Show Agent Communication"
                />
              </ListItem>
            </List>
          </Collapse>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Status */}
        <Box sx={{ p: 2 }}>
          <Chip 
            label={`Global Tick: ${useTick().globalTickNumber}`}
            color="primary"
            size="small"
            sx={{ mb: 1, width: '100%' }}
          />
          <Typography variant="caption" color="text.secondary">
            Windsurf Web UI v0.1.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
