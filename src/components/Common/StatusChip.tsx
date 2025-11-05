import { Chip } from '@mui/material';

interface StatusChipProps {
  status: 'accepted' | 'rejected' | 'sent' | 'unread' | 'read' | string;
}

export const StatusChip = ({ status }: StatusChipProps) => {
  const getChipProps = () => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return { color: 'primary' as const, label: 'Accepted' };
      case 'rejected':
        return { color: 'error' as const, label: 'Rejected' };
      case 'sent':
        return { color: 'success' as const, label: 'Sent' };
      case 'unread':
        return { color: 'warning' as const, label: 'Unread' };
      case 'read':
        return { color: 'default' as const, label: 'Read' };
      default:
        return { color: 'default' as const, label: status };
    }
  };

  const { color, label } = getChipProps();

  return <Chip size="small" color={color} label={label} />;
};
