import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Paper,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Button,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  TextField,
  Rating
} from '@mui/material';
import { 
  SmartToy as MetaAgentIcon,
  ExpandMore,
  ExpandLess,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Compare as CompareIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAgent } from '../../contexts/AgentContext';

const Tick5Panel = () => {
  const { getMetaAgents } = useAgent();
  const metaAgents = getMetaAgents();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [humanFeedback, setHumanFeedback] = useState('');
  const [humanRating, setHumanRating] = useState(0);
  
  // Mock review data
  const mockReviews = {
    'meta_agent_manager': {
      status: 'completed',
      rating: 4,
      summary: 'The implementation meets most requirements with minor issues.',
      details: `# Agent Manager Review\n\nOverall, the web interface implementation is satisfactory. The component structure is well-organized and follows best practices.\n\n## Strengths\n- Clear separation of concerns\n- Responsive design\n- Comprehensive agent management\n\n## Areas for Improvement\n- Some API endpoints are not fully implemented\n- Error handling could be more robust\n- Performance optimizations needed for large datasets\n\n## Recommendation\nApprove with minor revisions.`,
      recommendation: 'approve_with_changes'
    },
    'meta_documenter': {
      status: 'completed',
      rating: 5,
      summary: 'Documentation is comprehensive and well-structured.',
      details: `# Documenter Review\n\nThe documentation for the web interface is excellent. All components are well-documented with clear explanations of their purpose and usage.\n\n## Strengths\n- Comprehensive API documentation\n- Clear component usage examples\n- Well-structured README\n\n## Areas for Improvement\n- Add more inline comments in complex functions\n\n## Recommendation\nApprove as is.`,
      recommendation: 'approve'
    },
    'meta_protocol_dev': {
      status: 'in_progress',
      rating: null,
      summary: 'Currently reviewing API implementation...',
      details: '',
      recommendation: null
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };
  
  const toggleReviewExpanded = (agentId) => {
    setExpandedReviews({
      ...expandedReviews,
      [agentId]: !expandedReviews[agentId]
    });
  };
  
  const handleFeedbackChange = (event) => {
    setHumanFeedback(event.target.value);
  };
  
  const handleSubmitFeedback = () => {
    console.log('Submitting feedback:', {
      rating: humanRating,
      feedback: humanFeedback
    });
    // Would trigger API call to submit feedback
    // Reset form after submission
    setHumanFeedback('');
    setHumanRating(0);
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };
  
  const getRecommendationColor = (recommendation) => {
    switch(recommendation) {
      case 'approve':
        return 'success';
      case 'approve_with_changes':
        return 'warning';
      case 'reject':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getRecommendationLabel = (recommendation) => {
    switch(recommendation) {
      case 'approve':
        return 'Approve';
      case 'approve_with_changes':
        return 'Approve with Changes';
      case 'reject':
        return 'Reject';
      default:
        return 'Pending';
    }
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Meta Review
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review meta agent assessments of actor outputs and provide human feedback.
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Reviews" />
          <Tab label="Approvals" />
          <Tab label="Changes Needed" />
          <Tab label="Rejections" />
        </Tabs>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Grid container spacing={2}>
          {metaAgents.map((agent) => {
            const review = mockReviews[agent.id];
            if (!review) return null;
            
            const isExpanded = expandedReviews[agent.id] || false;
            
            // Skip based on selected tab
            if (selectedTab === 1 && review.recommendation !== 'approve') return null;
            if (selectedTab === 2 && review.recommendation !== 'approve_with_changes') return null;
            if (selectedTab === 3 && review.recommendation !== 'reject') return null;
            
            return (
              <Grid item xs={12} key={agent.id}>
                <Card variant="outlined">
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: '#3f51b5' }}>
                        <MetaAgentIcon />
                      </Avatar>
                    }
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ mr: 1 }}>
                          {agent.name} Review
                        </Typography>
                        <Chip 
                          label={review.status} 
                          size="small" 
                          color={getStatusColor(review.status)}
                        />
                      </Box>
                    }
                    subheader={
                      <Box sx={{ mt: 0.5 }}>
                        {review.rating && (
                          <Rating 
                            value={review.rating} 
                            readOnly 
                            size="small" 
                            sx={{ mb: 0.5 }}
                          />
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {review.summary || 'No summary available'}
                        </Typography>
                      </Box>
                    }
                    action={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {review.recommendation && (
                          <Chip 
                            label={getRecommendationLabel(review.recommendation)} 
                            size="small" 
                            color={getRecommendationColor(review.recommendation)}
                            sx={{ mr: 1 }}
                          />
                        )}
                        <IconButton 
                          onClick={() => toggleReviewExpanded(agent.id)}
                          sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                        >
                          <ExpandMore />
                        </IconButton>
                      </Box>
                    }
                  />
                  
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <CardContent>
                      {review.details ? (
                        <>
                          <Typography variant="subtitle2" gutterBottom>
                            Detailed Review:
                          </Typography>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              mb: 2, 
                              maxHeight: 200, 
                              overflow: 'auto',
                              whiteSpace: 'pre-wrap',
                              fontFamily: 'monospace',
                              fontSize: '0.875rem'
                            }}
                          >
                            {review.details}
                          </Paper>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          No detailed review available yet.
                        </Typography>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <Button 
                        size="small" 
                        startIcon={<ViewIcon />}
                      >
                        View Outputs
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<CompareIcon />}
                      >
                        Compare Versions
                      </Button>
                      <Button 
                        size="small" 
                        color="primary" 
                        startIcon={<EditIcon />}
                      >
                        Add Comment
                      </Button>
                    </CardActions>
                  </Collapse>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Human Supervision
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Your Rating:
          </Typography>
          <Rating
            value={humanRating}
            onChange={(event, newValue) => {
              setHumanRating(newValue);
            }}
          />
        </Box>
        <TextField
          label="Your Feedback"
          multiline
          rows={3}
          value={humanFeedback}
          onChange={handleFeedbackChange}
          fullWidth
          variant="outlined"
          placeholder="Provide your assessment of the current implementation..."
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Button
              variant="outlined"
              color="success"
              startIcon={<ApproveIcon />}
              sx={{ mr: 1 }}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<RejectIcon />}
            >
              Reject
            </Button>
          </Box>
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={handleSubmitFeedback}
            disabled={!humanFeedback.trim()}
          >
            Submit Feedback
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Tick5Panel;
