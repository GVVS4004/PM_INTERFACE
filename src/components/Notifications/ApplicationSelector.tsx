import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Chip,
  Stack,
  Button,
  Divider,
  Paper,
} from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import CircleIcon from '@mui/icons-material/Circle';

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

interface ApplicationSelectorProps {
  applications: Application[];
  selectedApplicationIds: number[];
  onToggleApplication: (appId: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const ApplicationSelector: React.FC<ApplicationSelectorProps> = ({
  applications,
  selectedApplicationIds,
  onToggleApplication,
  onSelectAll,
  onClearAll,
}) => {
  return (
    <Paper elevation={0} sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <AppsIcon color="secondary" />
        <Typography variant="h6" sx={{ flex: 1 }}>
          Select Applications
        </Typography>
        <Chip
          label={`${selectedApplicationIds.length} / ${applications.length}`}
          size="small"
          color="secondary"
          variant="outlined"
        />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={onSelectAll}
        >
          Select All
        </Button>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={onClearAll}
        >
          Clear All
        </Button>
      </Stack>

      <List sx={{ maxHeight: 300, overflow: 'auto' }}>
        {applications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No applications available
            </Typography>
          </Box>
        ) : (
          applications.map((app, index) => (
            <Box key={app.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => onToggleApplication(app.id)}
                  selected={selectedApplicationIds.includes(app.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'secondary.light',
                      '&:hover': {
                        bgcolor: 'secondary.light',
                      }
                    }
                  }}
                >
                  <Checkbox
                    checked={selectedApplicationIds.includes(app.id)}
                    edge="start"
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2">{app.name}</Typography>
                        <Chip
                          icon={
                            <CircleIcon
                              sx={{
                                fontSize: 8,
                                color: app.status === 'active' ? 'success.main' : 'error.main'
                              }}
                            />
                          }
                          label={`${app.activeUsers} active`}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Stack>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {app.description}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                          {app.baseUrl}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
              {index < applications.length - 1 && <Divider sx={{ my: 0.5 }} />}
            </Box>
          ))
        )}
      </List>
    </Paper>
  );
};
