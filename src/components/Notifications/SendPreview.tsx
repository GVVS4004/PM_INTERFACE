import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import AppsIcon from '@mui/icons-material/Apps';
import PeopleIcon from '@mui/icons-material/People';

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
}

interface Application {
  id: number;
  name: string;
  activeUsers: number;
  status: string;
}

interface SendPreviewProps {
  selectedGroups: Group[];
  selectedApplications: Application[];
  totalUsers: number;
}

export const SendPreview: React.FC<SendPreviewProps> = ({
  selectedGroups,
  selectedApplications,
  totalUsers,
}) => {
  if (selectedGroups.length === 0 && selectedApplications.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Select groups and applications to see the preview
      </Alert>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: 'info.lighter',
        border: '1px solid',
        borderColor: 'info.light',
        borderRadius: 2,
        mt: 2,
      }}
    >
      <Typography variant="subtitle2" color="info.dark" sx={{ mb: 2, fontWeight: 600 }}>
        📊 Send Preview
      </Typography>

      <Stack spacing={2}>
        {/* Total Users */}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <PeopleIcon sx={{ fontSize: 20, color: 'info.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Total Users:
            </Typography>
            <Chip
              label={totalUsers}
              size="small"
              color="info"
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </Box>

        <Divider />

        {/* Selected Groups */}
        {selectedGroups.length > 0 && (
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <GroupIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Groups ({selectedGroups.length}):
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {selectedGroups.map((group) => (
                <Chip
                  key={group.id}
                  label={`${group.name} (${group.userCount})`}
                  size="small"
                  sx={{
                    bgcolor: group.color,
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Selected Applications */}
        {selectedApplications.length > 0 && (
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <AppsIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Applications ({selectedApplications.length}):
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {selectedApplications.map((app) => (
                <Chip
                  key={app.id}
                  label={app.name}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        )}

        {selectedGroups.length === 0 && (
          <Alert severity="warning" sx={{ py: 0.5 }}>
            <Typography variant="caption">
              Please select at least one group
            </Typography>
          </Alert>
        )}

        {selectedApplications.length === 0 && (
          <Alert severity="warning" sx={{ py: 0.5 }}>
            <Typography variant="caption">
              Please select at least one application
            </Typography>
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};
