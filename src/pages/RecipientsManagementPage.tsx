import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { Header } from '../components/Layout/Header';
import { PageContainer } from '../components/Layout/PageContainer';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import PersonIcon from '@mui/icons-material/Person';
import { API_URL } from '../config/api';

interface Recipient {
  id: number;
  email: string;
  name: string;
  role: string;
  groupId?: number | null;
}

interface Group {
  id: number;
  name: string;
  description: string;
  color: string;
}

const RecipientsManagementPage = () => {
  const navigate = useNavigate();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const [recipientForm, setRecipientForm] = useState({
    name: '',
    email: '',
    role: '',
    groupId: null as number | null
  });

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    color: '#007bff'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recipientsRes, groupsRes] = await Promise.all([
        axios.get(`${API_URL}/recipients`, { withCredentials: true }),
        axios.get(`${API_URL}/groups`, { withCredentials: true })
      ]);
      setRecipients(recipientsRes.data);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipient = () => {
    setEditingRecipient(null);
    setRecipientForm({ name: '', email: '', role: '', groupId: null });
    setShowRecipientModal(true);
  };

  const handleEditRecipient = (recipient: Recipient) => {
    setEditingRecipient(recipient);
    setRecipientForm({
      name: recipient.name,
      email: recipient.email,
      role: recipient.role,
      groupId: recipient.groupId || null
    });
    setShowRecipientModal(true);
  };

  const handleSaveRecipient = async () => {
    try {
      if (editingRecipient) {
        const response = await axios.put(
          `${API_URL}/recipients/${editingRecipient.id}`,
          recipientForm,
          { withCredentials: true }
        );
        setRecipients(prev => prev.map(r => r.id === editingRecipient.id ? response.data : r));
      } else {
        const response = await axios.post(
          `${API_URL}/recipients`,
          recipientForm,
          { withCredentials: true }
        );
        setRecipients(prev => [...prev, response.data]);
      }
      setShowRecipientModal(false);
      alert('Recipient saved successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save recipient');
    }
  };

  const handleDeleteRecipient = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recipient?')) return;

    try {
      await axios.delete(`${API_URL}/recipients/${id}`, { withCredentials: true });
      setRecipients(prev => prev.filter(r => r.id !== id));
      alert('Recipient deleted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete recipient');
    }
  };

  const handleAddGroup = () => {
    setEditingGroup(null);
    setGroupForm({ name: '', description: '', color: '#007bff' });
    setShowGroupModal(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description,
      color: group.color
    });
    setShowGroupModal(true);
  };

  const handleSaveGroup = async () => {
    try {
      if (editingGroup) {
        const response = await axios.put(
          `${API_URL}/groups/${editingGroup.id}`,
          groupForm,
          { withCredentials: true }
        );
        setGroups(prev => prev.map(g => g.id === editingGroup.id ? response.data : g));
      } else {
        const response = await axios.post(
          `${API_URL}/groups`,
          groupForm,
          { withCredentials: true }
        );
        setGroups(prev => [...prev, response.data]);
      }
      setShowGroupModal(false);
      alert('Group saved successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save group');
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (!confirm('Are you sure you want to delete this group? Recipients will be ungrouped.')) return;

    try {
      await axios.delete(`${API_URL}/groups/${id}`, { withCredentials: true });
      setGroups(prev => prev.filter(g => g.id !== id));
      setRecipients(prev => prev.map(r => r.groupId === id ? { ...r, groupId: null } : r));
      alert('Group deleted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete group');
    }
  };

  const getGroupById = (groupId: number | null) => {
    return groups.find(g => g.id === groupId);
  };

  const getRecipientsByGroup = (groupId: number | null) => {
    return recipients.filter(r => r.groupId === groupId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Header title="Recipients Management" />

      <PageContainer>
        <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={handleAddGroup}
            >
              Add Group
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddRecipient}
            >
              Add Recipient
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <GroupWorkIcon color="primary" />
                  <Typography variant="h6">Groups ({groups.length})</Typography>
                </Stack>

                <Stack spacing={2}>
                  {groups.map(group => (
                    <Card key={group.id} variant="outlined" sx={{ borderLeft: `4px solid ${group.color}` }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="start">
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ color: group.color, fontWeight: 600 }}>
                              {group.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {group.description}
                            </Typography>
                            <Chip
                              size="small"
                              label={`${getRecipientsByGroup(group.id).length} recipients`}
                              variant="outlined"
                            />
                          </Box>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton size="small" color="warning" onClick={() => handleEditGroup(group)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteGroup(group.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <PersonIcon color="primary" />
              <Typography variant="h6">All Recipients ({recipients.length})</Typography>
            </Stack>

            {getRecipientsByGroup(null).length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Ungrouped
                </Typography>
                <Grid container spacing={2}>
                  {getRecipientsByGroup(null).map(recipient => (
                    <Grid item xs={12} sm={6} key={recipient.id}>
                      <Card>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="start">
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {recipient.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {recipient.email}
                              </Typography>
                              <Chip label={recipient.role} size="small" sx={{ mt: 1 }} />
                            </Box>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton size="small" color="warning" onClick={() => handleEditRecipient(recipient)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteRecipient(recipient.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {groups.map(group => {
              const groupRecipients = getRecipientsByGroup(group.id);
              if (groupRecipients.length === 0) return null;

              return (
                <Box key={group.id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: group.color, fontWeight: 600 }} gutterBottom>
                    {group.name}
                  </Typography>
                  <Grid container spacing={2}>
                    {groupRecipients.map(recipient => (
                      <Grid item xs={12} sm={6} key={recipient.id}>
                        <Card sx={{ borderLeft: `4px solid ${group.color}` }}>
                          <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="start">
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {recipient.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {recipient.email}
                                </Typography>
                                <Chip label={recipient.role} size="small" sx={{ mt: 1 }} />
                              </Box>
                              <Stack direction="row" spacing={0.5}>
                                <IconButton size="small" color="warning" onClick={() => handleEditRecipient(recipient)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeleteRecipient(recipient.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              );
            })}
          </Grid>
        </Grid>
      </PageContainer>

      <Dialog open={showRecipientModal} onClose={() => setShowRecipientModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRecipient ? 'Edit Recipient' : 'Add Recipient'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={recipientForm.name}
              onChange={(e) => setRecipientForm({ ...recipientForm, name: e.target.value })}
              placeholder="Development Team"
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={recipientForm.email}
              onChange={(e) => setRecipientForm({ ...recipientForm, email: e.target.value })}
              placeholder="dev-team@company.com"
              required
              fullWidth
            />
            <TextField
              label="Role"
              value={recipientForm.role}
              onChange={(e) => setRecipientForm({ ...recipientForm, role: e.target.value })}
              placeholder="Development"
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Group</InputLabel>
              <Select
                value={recipientForm.groupId || ''}
                onChange={(e) => setRecipientForm({ ...recipientForm, groupId: e.target.value ? Number(e.target.value) : null })}
                label="Group"
              >
                <MenuItem value="">No Group</MenuItem>
                {groups.map(group => (
                  <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRecipientModal(false)}>Cancel</Button>
          <Button onClick={handleSaveRecipient} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showGroupModal} onClose={() => setShowGroupModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGroup ? 'Edit Group' : 'Add Group'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Group Name"
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              placeholder="Engineering"
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={groupForm.description}
              onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              placeholder="Development and QA teams"
              multiline
              rows={3}
              fullWidth
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Color</Typography>
              <input
                type="color"
                value={groupForm.color}
                onChange={(e) => setGroupForm({ ...groupForm, color: e.target.value })}
                style={{ width: '100px', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGroupModal(false)}>Cancel</Button>
          <Button onClick={handleSaveGroup} variant="contained" color="success">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecipientsManagementPage;
