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
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import { NotificationSourceBadge } from '../components/Common/NotificationSourceBadge';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { AIAssistant } from '../components/AI/AIAssistant';
import { GroupSelector } from '../components/Notifications/GroupSelector';
import { ApplicationSelector } from '../components/Notifications/ApplicationSelector';
import { SendPreview } from '../components/Notifications/SendPreview';
import { TrackingStatsPanel } from '../components/Notifications/TrackingStatsPanel';
import { API_URL } from '../config/api';

interface User {
  userId: number;
  name: string;
  email: string;
}

interface Group {
  id: number;
  name: string;
  description: string;
  color: string;
  users?: User[];
  userCount: number;
  applications?: { id: number; name: string }[];
  applicationIds?: number[];
}

interface Application {
  id: number;
  name: string;
  baseUrl: string;
  notificationEndpoint: string;
  apiKey: string;
  status: string;
  activeUsers: number;
  description: string;
}

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
  sentTo?: User[];
  sentAt?: string;
  sentVia?: {
    groups: { id: number; name: string }[];
    applications: { id: number; name: string }[];
  };
  tracking?: {
    totalSent: number;
    opened: number;
    openRate: number;
    openedUsers: User[];
    lastOpenedAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

const EditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Groups and Applications
  const [groups, setGroups] = useState<Group[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<number[]>([]);

  const [showBulkSend, setShowBulkSend] = useState(false);
  const [sendingBulk, setSendingBulk] = useState(false);

  useEffect(() => {
    loadNotification();
    loadGroups();
    loadApplications();
  }, [id]);

  const loadGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/groups`, {
        withCredentials: true
      });
      setGroups(response.data);
    } catch (error: any) {
      console.error('Failed to load groups:', error);
    }
  };

  const loadApplications = async () => {
    try {
      const response = await axios.get(`${API_URL}/applications`, {
        withCredentials: true
      });
      setApplications(response.data);
    } catch (error: any) {
      console.error('Failed to load applications:', error);
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
      setShowBulkSend(true);
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

  const handleBulkSend = async () => {
    if (selectedGroupIds.length === 0) {
      alert('Please select at least one group');
      return;
    }

    if (selectedApplicationIds.length === 0) {
      alert('Please select at least one application');
      return;
    }

    setSendingBulk(true);
    try {
      const response = await axios.post(
        `${API_URL}/notifications/${id}/send-bulk`,
        {
          groupIds: selectedGroupIds,
          applicationIds: selectedApplicationIds
        },
        { withCredentials: true }
      );

      setNotification(prev => prev ? {
        ...prev,
        status: 'sent',
        sentTo: response.data.sentRelease.users,
        sentVia: {
          groups: response.data.summary.groups,
          applications: response.data.summary.applications
        }
      } : null);

      alert(`✅ ${response.data.message}\n\n` +
        `📊 Summary:\n` +
        `• Total Users: ${response.data.summary.totalUsers}\n` +
        `• Applications: ${response.data.summary.successfulApplications}/${response.data.summary.totalApplications} successful\n` +
        `• Groups: ${response.data.summary.groups.map((g: any) => g.name).join(', ')}`
      );

      setShowBulkSend(false);
      setSelectedGroupIds([]);
      setSelectedApplicationIds([]);
    } catch (error: any) {
      console.error('Failed to send bulk notification:', error);
      alert(error.response?.data?.error || 'Failed to send bulk notification');
    } finally {
      setSendingBulk(false);
    }
  };

  const toggleGroup = (groupId: number) => {
    setSelectedGroupIds(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleApplication = (appId: number) => {
    setSelectedApplicationIds(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleApplyAISuggestion = (suggestion: string) => {
    setContent(suggestion);
  };

  // Calculate total users (deduplicated)
  const getTotalUsers = () => {
    const selectedGroups = groups.filter(g => selectedGroupIds.includes(g.id));
    const usersMap = new Map();
    selectedGroups.forEach(group => {
      group.users?.forEach(user => {
        usersMap.set(user.userId, user);
      });
    });
    return usersMap.size;
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

  const selectedGroups = groups.filter(g => selectedGroupIds.includes(g.id));
  const selectedApps = applications.filter(a => selectedApplicationIds.includes(a.id));
  const totalUsers = getTotalUsers();

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
                {isSent && <Chip icon={<SendIcon />} label={`Sent to ${notification.sentTo?.length} users`} color="info" size="small" />}
                {isSent && notification.tracking && (
                  <Chip
                    icon={<VisibilityIcon />}
                    label={`${notification.tracking.opened}/${notification.tracking.totalSent} opened (${notification.tracking.openRate}%)`}
                    color={notification.tracking.openRate > 50 ? 'success' : notification.tracking.openRate > 0 ? 'warning' : 'default'}
                    size="small"
                  />
                )}
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
                color={showBulkSend ? 'inherit' : 'secondary'}
                onClick={() => setShowBulkSend(!showBulkSend)}
                startIcon={<GroupIcon />}
              >
                {showBulkSend ? 'Hide Send Panel' : 'Send to Groups & Apps'}
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
        <Box sx={{ flex: showBulkSend ? '0 0 50%' : 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="info" icon={false}>
            <strong>Jira Issues:</strong> {notification.jiraReleaseNotes || 'N/A'}
          </Alert>

          {isSent && notification.sentVia && (
            <>
              <Alert severity="success">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  ✅ Already Sent
                </Typography>
                <Typography variant="body2">
                  <strong>Groups:</strong> {notification.sentVia.groups.map(g => g.name).join(', ')}
                </Typography>
                <Typography variant="body2">
                  <strong>Applications:</strong> {notification.sentVia.applications.map(a => a.name).join(', ')}
                </Typography>
                <Typography variant="body2">
                  <strong>Total Users:</strong> {notification.sentTo?.length}
                </Typography>
              </Alert>

              <TrackingStatsPanel notificationId={notification.id} />
            </>
          )}

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
          open={showBulkSend}
          onClose={() => setShowBulkSend(false)}
          variant="persistent"
          sx={{
            width: 450,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 450,
              position: 'relative',
              height: '100%',
            },
          }}
        >
          <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Send to Groups & Applications
            </Typography>

            <Stack spacing={3} sx={{ flex: 1, overflow: 'auto' }}>
              <GroupSelector
                groups={groups}
                selectedGroupIds={selectedGroupIds}
                onToggleGroup={toggleGroup}
                onSelectAll={() => setSelectedGroupIds(groups.map(g => g.id))}
                onClearAll={() => setSelectedGroupIds([])}
              />

              <ApplicationSelector
                applications={applications}
                selectedApplicationIds={selectedApplicationIds}
                onToggleApplication={toggleApplication}
                onSelectAll={() => setSelectedApplicationIds(applications.map(a => a.id))}
                onClearAll={() => setSelectedApplicationIds([])}
              />

              <SendPreview
                selectedGroups={selectedGroups}
                selectedApplications={selectedApps}
                totalUsers={totalUsers}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              onClick={handleBulkSend}
              disabled={sendingBulk || selectedGroupIds.length === 0 || selectedApplicationIds.length === 0}
              startIcon={sendingBulk ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {sendingBulk
                ? 'Sending...'
                : `Send to ${totalUsers} Users in ${selectedApps.length} App(s)`
              }
            </Button>
          </Box>
        </Drawer>

        {!showBulkSend && (
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
