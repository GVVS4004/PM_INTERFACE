import { Chip } from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import PersonIcon from '@mui/icons-material/Person';

interface NotificationSourceBadgeProps {
  source: 'external' | 'pm_created';
  createdBy?: string;
}

export const NotificationSourceBadge = ({ source, createdBy }: NotificationSourceBadgeProps) => {
  if (source === 'pm_created') {
    return (
      <Chip
        icon={<PersonIcon />}
        label={createdBy ? `Created by ${createdBy}` : 'Created by You'}
        color="primary"
        size="small"
      />
    );
  }

  return (
    <Chip
      icon={<CloudIcon />}
      label="External"
      color="info"
      size="small"
    />
  );
};
