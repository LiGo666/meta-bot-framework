import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip
} from '@mui/material';
import { 
  Send as SendIcon,
  AttachFile as AttachIcon,
  Save as SaveIcon,
  History as HistoryIcon
} from '@mui/icons-material';

const Tick1Panel = () => {
  const [inputText, setInputText] = useState('');
  const [inputType, setInputType] = useState('text');
  const [attachments, setAttachments] = useState([]);
  
  // Mock history data
  const inputHistory = [
    { id: 1, text: 'Enhance the tick viewer with summary view', timestamp: '2025-05-30T14:30:00Z' },
    { id: 2, text: 'Add comparison feature to tick viewer', timestamp: '2025-05-31T09:15:00Z' },
    { id: 3, text: 'Design web interface for Windsurf', timestamp: '2025-06-01T00:30:00Z' }
  ];
  
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };
  
  const handleTypeChange = (e) => {
    setInputType(e.target.value);
  };
  
  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };
  
  const handleRemoveAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };
  
  const handleSubmit = () => {
    console.log('Submitting human input:', {
      text: inputText,
      type: inputType,
      attachments: attachments.map(file => file.name)
    });
    // Would trigger API call to submit the input
    // Reset form after submission
    setInputText('');
    setAttachments([]);
  };
  
  const loadHistoryItem = (item) => {
    setInputText(item.text);
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Human Input
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Provide your instructions or task description to initiate a new tick cycle.
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Input Type</InputLabel>
            <Select
              value={inputType}
              label="Input Type"
              onChange={handleTypeChange}
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="yaml">YAML</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="markdown">Markdown</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            fullWidth
          >
            Load Previous Input
          </Button>
        </Grid>
      </Grid>
      
      <TextField
        label="Enter your instructions"
        multiline
        rows={10}
        value={inputText}
        onChange={handleInputChange}
        fullWidth
        variant="outlined"
        placeholder="Describe what you want the agents to accomplish..."
        sx={{ mb: 2, flexGrow: 1 }}
      />
      
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Attachments
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {attachments.length > 0 ? (
            attachments.map((file, index) => (
              <Chip
                key={index}
                label={file.name}
                onDelete={() => handleRemoveAttachment(index)}
                size="small"
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No attachments added
            </Typography>
          )}
        </Box>
        <Button
          component="label"
          variant="outlined"
          startIcon={<AttachIcon />}
          size="small"
        >
          Add Attachment
          <input
            type="file"
            hidden
            multiple
            onChange={handleAttachmentUpload}
          />
        </Button>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
        >
          Save Draft
        </Button>
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleSubmit}
          disabled={!inputText.trim()}
        >
          Submit Input
        </Button>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle2" gutterBottom>
        Recent Inputs
      </Typography>
      <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
        {inputHistory.map((item) => (
          <Paper
            key={item.id}
            variant="outlined"
            sx={{ 
              p: 1, 
              mb: 1, 
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' }
            }}
            onClick={() => loadHistoryItem(item)}
          >
            <Typography variant="body2" noWrap>
              {item.text}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(item.timestamp).toLocaleString()}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Tick1Panel;
