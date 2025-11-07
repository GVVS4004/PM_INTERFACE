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
import GroupIcon from '@mui/icons-material/Group';

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

interface GroupSelectorProps {
  groups: Group[];
  selectedGroupIds: number[];
  onToggleGroup: (groupId: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  groups,
  selectedGroupIds,
  onToggleGroup,
  onSelectAll,
  onClearAll,
}) => {
  return (
    <Paper elevation={0} sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <GroupIcon color="primary" />
        <Typography variant="h6" sx={{ flex: 1 }}>
          Select Groups
        </Typography>
        <Chip
          label={`${selectedGroupIds.length} / ${groups.length}`}
          size="small"
          color="primary"
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
        {groups.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No groups available</Typography>
          </Box>
        ) : (
          groups.map((group, index) => (
            <Box key={group.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => onToggleGroup(group.id)}
                  selected={selectedGroupIds.includes(group.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      '&:hover': {
                        bgcolor: 'primary.light',
                      }
                    }
                  }}
                >
                  <Checkbox
                    checked={selectedGroupIds.includes(group.id)}
                    edge="start"
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: group.color,
                          }}
                        />
                        <Typography variant="subtitle2">{group.name}</Typography>
                        <Chip
                          label={`${group.userCount} users`}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {group.description}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
              {index < groups.length - 1 && <Divider sx={{ my: 0.5 }} />}
            </Box>
          ))
        )}
      </List>
    </Paper>
  );
};
