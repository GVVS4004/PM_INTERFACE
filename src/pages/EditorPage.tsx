import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
} from '@mui/material';
import { NotificationSourceBadge } from '../components/Common/NotificationSourceBadge';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import GroupIcon from '@mui/icons-material/Group';
import { AIAssistant } from '../components/AI/AIAssistant';
import { API_URL } from '../config/api';

interface Notification {
  id: number;
  targetEmail: string;
  title: string;
  content: string;
  jiraReleaseNotes: string;
  metadata: any;
  status: string;
  source?: 'external' | 'pm_created';
  createdBy?: string;
  action?: string;
  actionDate?: string;
  sentTo?: Recipient[];
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Recipient {
  id: number;
  email: string;
  name: string;
  role: string;
}

const EditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [showRecipients, setShowRecipients] = useState(false);
  const [sendingRelease, setSendingRelease] = useState(false);

  useEffect(() => {
    loadNotification();
    loadRecipients();
  }, [id]);

  const loadRecipients = async () => {
    try {
      const response = await axios.get(`${API_URL}/recipients`, {
        withCredentials: true
      });
      setRecipients(response.data);
    } catch (error: any) {
      console.error('Failed to load recipients:', error);
    }
  };

  const loadNotification = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications/${id}`, {
        withCredentials: true
      });
      setNotification(response.data);
      setContent(response.data.content);

      if (response.data.status === 'unread') {
        await axios.put(
          `${API_URL}/notifications/${id}`,
          { status: 'read' },
          { withCredentials: true }
        );
      }
    } catch (error) {
      console.error('Failed to load notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/notifications/${id}`,
        { content, status: 'read' },
        { withCredentials: true }
      );
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/notifications/${id}`,
        { action: 'accepted' },
        { withCredentials: true }
      );
      setNotification(response.data);
      alert('Release notes accepted!');
      setShowRecipients(true);
    } catch (error) {
      console.error('Failed to accept:', error);
      alert('Failed to accept release');
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await axios.put(
        `${API_URL}/notifications/${id}`,
        { action: 'rejected', status: 'rejected' },
        { withCredentials: true }
      );
      setNotification(response.data);
      alert('Release notes rejected. Reason: ' + reason);
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Failed to reject release');
    }
  };

  const handleSendToRecipients = async () => {
    if (selectedRecipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    setSendingRelease(true);
    try {
      const response = await axios.post(
        `${API_URL}/notifications/${id}/send`,
        { recipientIds: selectedRecipients },
        { withCredentials: true }
      );

      setNotification(prev => prev ? { ...prev, status: 'sent', sentTo: response.data.sentRelease.recipients } : null);
      alert(response.data.message);
      setShowRecipients(false);
    } catch (error: any) {
      console.error('Failed to send release:', error);
      alert(error.response?.data?.error || 'Failed to send release notes');
    } finally {
      setSendingRelease(false);
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
    setContent(suggestion);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!notification) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Notification not found</Typography>
      </Box>
    );
  }

  const isAccepted = notification.action === 'accepted';
  const isRejected = notification.action === 'rejected';
  const isSent = notification.status === 'sent';
  const isPMCreated = notification.source === 'pm_created';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', px: 3, py: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <IconButton onClick={() => navigate('/dashboard')} color="primary">
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5">{notification.title}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <NotificationSourceBadge
                  source={notification.source || 'external'}
                  createdBy={notification.createdBy}
                />
                {isAccepted && <Chip icon={<CheckCircleIcon />} label="Accepted" color="success" size="small" />}
                {isRejected && <Chip icon={<CancelIcon />} label="Rejected" color="error" size="small" />}
                {isSent && <Chip icon={<SendIcon />} label={`Sent to ${notification.sentTo?.length} recipients`} color="info" size="small" />}
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            {!isPMCreated && !isAccepted && !isRejected && (
              <>
                <Button variant="contained" color="error" onClick={handleReject} startIcon={<CancelIcon />}>
                  Reject
                </Button>
                <Button variant="contained" color="success" onClick={handleAccept} startIcon={<CheckCircleIcon />}>
                  Accept
                </Button>
              </>
            )}
            {(isPMCreated || isAccepted || isSent) && (
              <Button
                variant="contained"
                color={showRecipients ? 'inherit' : 'secondary'}
                onClick={() => setShowRecipients(!showRecipients)}
                startIcon={<GroupIcon />}
              >
                {showRecipients ? 'Hide Recipients' : 'Send to Recipients'}
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', p: 3, gap: 3, height: 'calc(100vh - 120px)' }}>
        <Box sx={{ flex: showRecipients ? '0 0 50%' : 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="info" icon={false}>
            <strong>Jira Issues:</strong> {notification.jiraReleaseNotes || 'N/A'}
          </Alert>

          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>Release Notes Editor</Typography>
              <TextField
                multiline
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isRejected}
                placeholder="Edit release notes here..."
                sx={{
                  flex: 1,
                  '& .MuiInputBase-root': {
                    height: '100%',
                    alignItems: 'flex-start',
                    fontFamily: 'monospace',
                  },
                }}
              />
            </CardContent>
          </Card>
        </Box>

        <Drawer
          anchor="right"
          open={showRecipients}
          onClose={() => setShowRecipients(false)}
          variant="persistent"
          sx={{
            width: 400,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 400,
              position: 'relative',
              height: '100%',
            },
          }}
        >
          <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Select Recipients</Typography>

            {isSent && notification.sentTo && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <strong>Already sent to:</strong>
                <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                  {notification.sentTo.map(r => (
                    <li key={r.id}>{r.name} ({r.email})</li>
                  ))}
                </Box>
              </Alert>
            )}

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
              color="success"
              fullWidth
              onClick={handleSendToRecipients}
              disabled={sendingRelease || selectedRecipients.length === 0}
              startIcon={sendingRelease ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {sendingRelease ? 'Sending...' : `Send to ${selectedRecipients.length} Recipients`}
            </Button>
          </Box>
        </Drawer>

        {!showRecipients && (
          <Paper sx={{ width: 400, p: 3, display: 'flex', flexDirection: 'column' }} elevation={2}>
            <AIAssistant
              content={content}
              onApplySuggestion={handleApplyAISuggestion}
              disabled={isRejected}
            />
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default EditorPage;
