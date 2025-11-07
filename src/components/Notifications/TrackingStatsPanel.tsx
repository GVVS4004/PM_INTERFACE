import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Collapse,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import AppsIcon from '@mui/icons-material/Apps';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { API_URL } from '../../config/api';

interface User {
  userId: number;
  name: string;
  email: string;
  openedAt?: string;
  applicationName?: string;
}

interface ApplicationStats {
  applicationId: number;
  applicationName: string;
  totalSent: number;
  opened: number;
  openRate: number;
}

interface TrackingStats {
  notificationId: number;
  totalSent: number;
  totalOpened: number;
  openRate: number;
  openedUsers: User[];
  notOpenedUsers: User[];
  byApplication: ApplicationStats[];
  lastOpenedAt: string | null;
}

interface TrackingStatsPanelProps {
  notificationId: number;
}

export const TrackingStatsPanel: React.FC<TrackingStatsPanelProps> = ({
  notificationId,
}) => {
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOpenedUsers, setShowOpenedUsers] = useState(true);
  const [showNotOpenedUsers, setShowNotOpenedUsers] = useState(false);

  useEffect(() => {
    loadTrackingStats();
  }, [notificationId]);

  const loadTrackingStats = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/notifications/${notificationId}/tracking`,
        { withCredentials: true }
      );
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load tracking stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTrackingStats();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={30} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading tracking stats...
        </Typography>
      </Paper>
    );
  }

  if (!stats || stats.totalSent === 0) {
    return (
      <Alert severity="info">
        No tracking data available yet.
      </Alert>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <VisibilityIcon color="primary" />
          <Typography variant="h6">Tracking Stats</Typography>
        </Stack>
        <Button
          size="small"
          startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </Stack>

      {/* Overall Stats */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h3" color="primary.main">
            {stats.totalOpened}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            / {stats.totalSent}
          </Typography>
          <Chip
            label={`${stats.openRate}%`}
            color={stats.openRate > 50 ? 'success' : stats.openRate > 20 ? 'warning' : 'default'}
            sx={{ fontWeight: 700, fontSize: '1rem' }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Users opened this notification
        </Typography>

        <LinearProgress
          variant="determinate"
          value={stats.openRate}
          sx={{
            height: 8,
            borderRadius: 1,
            mt: 1,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 1,
              bgcolor: stats.openRate > 50 ? 'success.main' : stats.openRate > 20 ? 'warning.main' : 'grey.400',
            },
          }}
        />

        {stats.lastOpenedAt && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Last opened: {formatDateTime(stats.lastOpenedAt)}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* By Application Breakdown */}
      {stats.byApplication && stats.byApplication.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <AppsIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
            <Typography variant="subtitle2" fontWeight={600}>
              By Application
            </Typography>
          </Stack>
          <Stack spacing={1.5}>
            {stats.byApplication.map((appStat) => (
              <Box key={appStat.applicationId}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="body2">{appStat.applicationName}</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {appStat.opened}/{appStat.totalSent} ({appStat.openRate}%)
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={appStat.openRate}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 1,
                      bgcolor: 'secondary.main',
                    },
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Opened Users */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          variant="text"
          onClick={() => setShowOpenedUsers(!showOpenedUsers)}
          endIcon={showOpenedUsers ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ justifyContent: 'space-between', textTransform: 'none' }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <VisibilityIcon color="success" sx={{ fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={600}>
              Opened ({stats.openedUsers.length})
            </Typography>
          </Stack>
        </Button>
        <Collapse in={showOpenedUsers}>
          <List dense sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'success.lighter', borderRadius: 1, mt: 1 }}>
            {stats.openedUsers.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={<Typography variant="body2" color="text.secondary">No users have opened yet</Typography>}
                />
              </ListItem>
            ) : (
              stats.openedUsers.map((user) => (
                <ListItem key={user.userId}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>
                      <PersonIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {user.name}
                      </Typography>
                    }
                    secondary={
                      <Stack direction="row" spacing={1}>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                        {user.applicationName && (
                          <>
                            <Typography variant="caption">•</Typography>
                            <Typography variant="caption" color="secondary.main">
                              {user.applicationName}
                            </Typography>
                          </>
                        )}
                      </Stack>
                    }
                  />
                  {user.openedAt && (
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(user.openedAt)}
                    </Typography>
                  )}
                </ListItem>
              ))
            )}
          </List>
        </Collapse>
      </Box>

      {/* Not Opened Users */}
      {stats.notOpenedUsers.length > 0 && (
        <Box>
          <Button
            fullWidth
            variant="text"
            onClick={() => setShowNotOpenedUsers(!showNotOpenedUsers)}
            endIcon={showNotOpenedUsers ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ justifyContent: 'space-between', textTransform: 'none' }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <VisibilityOffIcon color="disabled" sx={{ fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={600}>
                Not Opened Yet ({stats.notOpenedUsers.length})
              </Typography>
            </Stack>
          </Button>
          <Collapse in={showNotOpenedUsers}>
            <List dense sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'grey.100', borderRadius: 1, mt: 1 }}>
              {stats.notOpenedUsers.map((user) => (
                <ListItem key={user.userId}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.400' }}>
                      <PersonIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {user.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      )}
    </Paper>
  );
};
