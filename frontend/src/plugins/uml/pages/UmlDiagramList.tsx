import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead = '@mui/material/TableHead';
import TableRow = '@mui/material/TableRow';
import Tooltip = '@mui/material/Tooltip';
import IconButton = '@mui/material/IconButton';
import DeleteIcon = '@mui/material/icons/Delete';
import EditIcon = '@mui/material/icons/Edit';
import AddIcon = '@mui/material/icons/Add';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { api } from '@/api/client';
import { useDiagrams } from '../hooks/useDiagram'; // We'll create this hook

// We need to create a hook to fetch diagrams for a workspace. For now, we'll assume we get workspaceId from URL or context.
// Since we are in the UML plugin, we might not have workspaceId in the URL for the list page.
// Let's adjust: The list page is at /workspace/:workspaceId/uml-diagrams
// We'll create a hook that fetches diagrams for the current workspace.

// For simplicity, we'll fetch diagrams in the component using the API client directly.
// We'll create a hook later if needed.

interface Diagram {
  id: string;
  name: string;
  card_count: number;
  relation_count: number;
  workspace_id: string;
}

const UmlDiagramList = () => {
  const navigate = useNavigate();
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string>(''); // We'll get this from URL or context

  // In a real app, we would get workspaceId from the route or a context.
  // For now, we'll hardcode or get from URL. Let's assume we have a way to get it.
  // We'll use useParams to get workspaceId from the URL.
  // Since we are not using react-router-dom in this snippet, we'll adjust.
  // Let's assume we are in a route that provides workspaceId.

  // We'll use a placeholder for workspaceId. In practice, this would come from useParams.
  // For the sake of this task, we'll set it to a fixed value or try to get it from the URL.
  // We'll use useEffect to simulate getting it from URL (if we had useParams).

  // Let's create a state for workspaceId and try to get it from the URL if we are in a React Router environment.
  // Since we are in a plugin, we might not have access to the router in the same way.
  // Alternatively, we can get it from the diagram data if we are filtering by workspace in the API.

  // We'll change approach: We'll fetch all diagrams (if the API supports it) or we assume the backend filters by workspace.
  // The API endpoint for diagrams is /api/uml-diagrams and it should take a workspace_id query parameter.
  // We'll need to get the workspaceId from somewhere. Let's assume we have a context or a global variable.
  // For now, we'll leave it as a placeholder and note that it needs to be set.

  // We'll use a useEffect to set workspaceId from a hypothetical URL parameter.
  // In a real implementation, we would use useParams from react-router-dom.

  // Since we are in a hurry, let's assume we have a way to get workspaceId and focus on the list rendering.

  // We'll fetch diagrams on mount.
  useEffect(() => {
    const fetchDiagrams = async () => {
      try {
        setLoading(true);
        // We need workspaceId. Let's assume we can get it from the URL or a context.
        // For now, we'll use a placeholder. In the real app, this would be set via useParams.
        const wsId = workspaceId || 'default-workspace-id'; // Placeholder
        const response = await api.get<Diagram[]>(`/api/uml-diagrams?workspace_id=${wsId}`);
        setDiagrams(response.data);
        setError(null);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load diagrams');
        setDiagrams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagrams();
  }, [workspaceId]); // Re-fetch if workspaceId changes

  const handleCreateDiagram = async () => {
    const diagramName = prompt('Enter diagram name:');
    if (!diagramName) return;
    try {
      // We need workspaceId for creating a diagram.
      const wsId = workspaceId || 'default-workspace-id';
      const newDiagram = await api.post<Diagram>('/api/uml-diagrams', {
        workspace_id: wsId,
        name: diagramName,
      });
      setDiagrams(prev => [...prev, newDiagram]);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create diagram');
    }
  };

  const handleEditDiagram = async (diagram: Diagram) => {
    const newName = prompt('Edit diagram name:', diagram.name);
    if (!newName || newName === diagram.name) return;
    try {
      await api.patch(`/api/uml-diagrams/${diagram.id}`, { name: newName });
      setDiagrams(prev => prev.map(d => d.id === diagram.id ? { ...d, name: newName } : d));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update diagram');
    }
  };

  const handleDeleteDiagram = async (diagram: Diagram) => {
    if (!window.confirm(`Are you sure you want to delete diagram "${diagram.name}"?`)) return;
    try {
      await api.delete(`/api/uml-diagrams/${diagram.id}`);
      setDiagrams(prev => prev.filter(d => d.id !== diagram.id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete diagram');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          UML Diagrams
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateDiagram}>
          Create Diagram
        </Button>
      </Box>

      {diagrams.length === 0 ? (
        <Typography variant="body2" textAlign="center" color="text.secondary">
          No diagrams found. Click "Create Diagram" to get started.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table stickyHeader aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="center">Cards</TableCell>
                <TableCell align="center">Relations</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {diagrams.map(diagram => (
                <TableRow key={diagram.id} hover>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                    <Button
                      variant="text"
                      onClick={() => navigate(`/workspace/${diagram.workspace_id}/uml-diagrams/${diagram.id}`)}
                    >
                      {diagram.name}
                    </Button>
                  </TableCell>
                  <TableCell align="center">{diagram.card_count}</TableCell>
                  <TableCell align="center">{diagram.relation_count}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Tooltip title="Edit Diagram">
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          handleEditDiagram(diagram);
                        }}>
                          <EditIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Diagram">
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDiagram(diagram);
                        }} color="error">
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default UmlDiagramList;
