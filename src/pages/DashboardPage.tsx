import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import { Header } from '../components/Layout/Header';
import { PageContainer } from '../components/Layout/PageContainer';
import { NotificationSourceBadge } from '../components/Common/NotificationSourceBadge';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
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
  createdAt: string;
  updatedAt: string;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
    connectSSE();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        withCredentials: true
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectSSE = () => {
    const eventSource = new EventSource(`${API_URL}/events`, {
      withCredentials: true
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'connected') {
        console.log('SSE connected successfully');
      } else if (data.type === 'initial') {
        setNotifications(data.notifications);
      } else if (data.type === 'notification') {
        setNotifications(prev => [data.data, ...prev]);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  };

  const openNotification = (id: number) => {
    navigate(`/editor/${id}`);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return n.status === 'unread';
    if (filter === 'read') return n.status === 'read';
    return true;
  });

  const getStatusChipProps = (status: string) => {
    return status === 'unread'
      ? { color: 'primary' as const, label: 'Unread' }
      : { color: 'success' as const, label: 'Read' };
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Header title="PM Notification Dashboard" />

      <PageContainer>
        <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Welcome, {user?.name}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-notification')}
            >
              Create Notification
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<GroupIcon />}
              onClick={() => navigate('/recipients')}
            >
              Manage Recipients
            </Button>
          </Stack>
        </Stack>

        <Card sx={{ mb: 3 }}>
          <Tabs
            value={filter}
            onChange={(_, newValue) => setFilter(newValue)}
            variant="fullWidth"
          >
            <Tab
              label={`All (${notifications.length})`}
              value="all"
            />
            <Tab
              label={`Unread (${notifications.filter(n => n.status === 'unread').length})`}
              value="unread"
            />
            <Tab
              label={`Read (${notifications.filter(n => n.status === 'read').length})`}
              value="read"
            />
          </Tabs>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                No notifications found
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                onClick={() => openNotification(notification.id)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: notification.status === 'unread' ? 2 : 1,
                  borderColor: notification.status === 'unread' ? 'primary.main' : 'divider',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 1 }}>
                    <Typography variant="h6" component="h3">
                      {notification.title}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <NotificationSourceBadge
                        source={notification.source || 'external'}
                        createdBy={notification.createdBy}
                      />
                      <Chip
                        size="small"
                        {...getStatusChipProps(notification.status)}
                      />
                    </Stack>
                  </Stack>

                  {notification.jiraReleaseNotes && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={<DescriptionIcon />}
                        label={`Jira Issues: ${notification.jiraReleaseNotes}`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  )}

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mb: 1,
                    }}
                  >
                    {notification.content}
                  </Typography>

                  <Typography variant="caption" color="text.disabled">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </PageContainer>
    </Box>
  );
};

export default DashboardPage;
