import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface AIAssistantProps {
  content: string;
  onApplySuggestion: (suggestion: string) => void;
  disabled?: boolean;
}

export const AIAssistant = ({ content, onApplySuggestion, disabled }: AIAssistantProps) => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  const handleAIChat = async () => {
    if (!chatMessage.trim()) return;

    setChatLoading(true);
    setAiSuggestion('');

    try {
      const response = await axios.post(
        `${API_URL}/ai/suggest`,
        { content, prompt: chatMessage },
        { withCredentials: true }
      );
      setAiSuggestion(response.data.suggestion);
    } catch (error: any) {
      console.error('AI request failed:', error);
      alert(error.response?.data?.error || 'Failed to get AI suggestion');
    } finally {
      setChatLoading(false);
    }
  };

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      onApplySuggestion(aiSuggestion);
      setAiSuggestion('');
      setChatMessage('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <SmartToyIcon color="primary" />
        <Typography variant="h6">AI Assistant</Typography>
      </Stack>

      <Box sx={{ flex: 1, overflow: 'auto', mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        {!aiSuggestion ? (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Ask the AI to help improve your content:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mt: 1 }}>
              <li>Make it more professional</li>
              <li>Add more technical details</li>
              <li>Simplify the language</li>
              <li>Fix grammar and spelling</li>
              <li>Improve clarity and structure</li>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              AI Suggestion:
            </Typography>
            <Paper sx={{ p: 2, mb: 2, whiteSpace: 'pre-wrap' }} variant="outlined">
              <Typography variant="body2">{aiSuggestion}</Typography>
            </Paper>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={applyAISuggestion}
            >
              Apply This Suggestion
            </Button>
          </Box>
        )}
      </Box>

      <TextField
        multiline
        rows={3}
        value={chatMessage}
        onChange={(e) => setChatMessage(e.target.value)}
        placeholder="Type your request to AI..."
        disabled={disabled || chatLoading}
        sx={{ mb: 1 }}
      />
      <Button
        variant="contained"
        onClick={handleAIChat}
        disabled={chatLoading || !chatMessage.trim() || disabled}
        startIcon={chatLoading ? <CircularProgress size={20} /> : <SmartToyIcon />}
        fullWidth
      >
        {chatLoading ? 'Getting AI Suggestion...' : 'Ask AI'}
      </Button>

      <Alert severity="warning" sx={{ mt: 2 }}>
        <Typography variant="caption">
          Note: Set OPENAI_API_KEY in backend .env
        </Typography>
      </Alert>
    </Box>
  );
};
