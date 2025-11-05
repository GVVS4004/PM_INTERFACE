import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  IconButton,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Divider,
  CircularProgress,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import GroupIcon from '@mui/icons-material/Group';
import { RichTextEditor } from '../components/Editor/RichTextEditor';
import { AIAssistant } from '../components/AI/AIAssistant';
import { API_URL } from '../config/api';

interface Recipient {
  id: number;
  email: string;
  name: string;
  role: string;
}

const CreateNotificationPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [jiraReference, setJiraReference] = useState('');
  const [content, setContent] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [showRecipients, setShowRecipients] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  // Load recipients on component mount
  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    try {
      const response = await axios.get(`${API_URL}/recipients`, {
        withCredentials: true
      });
      setRecipients(response.data);
    } catch (error) {
      console.error('Failed to load recipients:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!content.trim() || content === '<p><br></p>') {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAsDraft = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const response = await axios.post(
        `${API_URL}/notifications/create`,
        {
          title,
          content,
          jiraReleaseNotes: jiraReference,
          source: 'pm_created',
          isDraft: true
        },
        { withCredentials: true }
      );

      alert('Notification saved as draft!');
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAndSend = async () => {
    if (!validateForm()) return;

    if (selectedRecipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/notifications/create`,
        {
          title,
          content,
          jiraReleaseNotes: jiraReference,
          source: 'pm_created',
          recipientIds: selectedRecipients,
          isDraft: false
        },
        { withCredentials: true }
      );

      alert('Notification created and sent successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create notification');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecipient = (recipientId: number) => {
    setSelectedRecipients(prev =>
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const handleApplyAISuggestion = (suggestion: string) => {
    // Extract images from current content
    const imgRegex = /<img[^>]+>/g;
    const currentImages = content.match(imgRegex) || [];

    // Remove any images from AI suggestion to avoid duplication
    let cleanSuggestion = suggestion.replace(imgRegex, '').trim();

    // Append existing images to the suggestion
    const newContent = cleanSuggestion + (currentImages.length > 0 ? '\n' + currentImages.join('\n') : '');
    setContent(newContent);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', px: 3, py: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={() => navigate('/dashboard')} color="primary">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5">Create New Notification</Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={handleSaveAsDraft}
              disabled={saving || loading}
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              Save as Draft
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setShowRecipients(true)}
              startIcon={<GroupIcon />}
            >
              Select Recipients ({selectedRecipients.length})
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleCreateAndSend}
              disabled={loading || saving}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              Create & Send
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', p: 3, gap: 3, height: 'calc(100vh - 120px)' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
          <Alert severity="info">
            Create a new notification to send to your team. You can add rich text, images, and format the content as needed.
          </Alert>

          <Card>
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  label="Notification Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Release v2.0.3 Update"
                  required
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title}
                />

                <TextField
                  label="Jira Reference (Optional)"
                  value={jiraReference}
                  onChange={(e) => setJiraReference(e.target.value)}
                  placeholder="e.g., JIRA-1234, JIRA-5678"
                  fullWidth
                />

                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Content *
                  </Typography>
                  {errors.content && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.content}
                    </Alert>
                  )}
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write your notification content here. You can format text, add images, and more..."
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Tip: You can paste images directly into the editor or click the image icon to upload.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* AI Assistant Panel - Always Visible */}
        <Paper sx={{ width: 400, p: 3, display: 'flex', flexDirection: 'column' }} elevation={2}>
          <AIAssistant
            content={content}
            onApplySuggestion={handleApplyAISuggestion}
            disabled={false}
          />
        </Paper>
      </Box>

      <Drawer
        anchor="right"
        open={showRecipients}
        onClose={() => setShowRecipients(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
          },
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Select Recipients
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => setSelectedRecipients(recipients.map(r => r.id))}
            >
              Select All
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => setSelectedRecipients([])}
            >
              Clear All
            </Button>
          </Stack>

          <List sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.50', borderRadius: 1 }}>
            {recipients.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No recipients available</Typography>
              </Box>
            ) : (
              recipients.map((recipient) => (
                <ListItem key={recipient.id} disablePadding>
                  <ListItemButton
                    onClick={() => toggleRecipient(recipient.id)}
                    selected={selectedRecipients.includes(recipient.id)}
                  >
                    <Checkbox
                      checked={selectedRecipients.includes(recipient.id)}
                      edge="start"
                    />
                    <ListItemText
                      primary={recipient.name}
                      secondary={
                        <>
                          {recipient.email}
                          <br />
                          <Typography variant="caption" color="text.disabled">
                            {recipient.role}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>

          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Selected: {selectedRecipients.length} / {recipients.length}
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setShowRecipients(false)}
          >
            Done
          </Button>
        </Box>
      </Drawer>

    </Box>
  );
};

export default CreateNotificationPage;
