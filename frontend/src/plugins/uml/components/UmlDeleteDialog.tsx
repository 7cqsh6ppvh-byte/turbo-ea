import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import MaterialSymbol from '@/components/MaterialSymbol';

interface UmlDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onRemoveFromDiagram: () => void;
  onDeleteFromRepository: () => void;
  itemName: string;
}

const UmlDeleteDialog: React.FC<UmlDeleteDialogProps> = ({
  open,
  onClose,
  onRemoveFromDiagram,
  onDeleteFromRepository,
  itemName,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MaterialSymbol icon="delete" size={24} color="#d32f2f" />
        Remove or Delete "{itemName}"?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          How would you like to handle this item?
          <br /><br />
          <strong>Remove from Diagram:</strong> Removes the card from this view only. The card remains in the repository and other diagrams.
          <br /><br />
          <strong>Delete from Repository:</strong> Permanently deletes the card and its metadata from the entire system. This cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions style={{ padding: '16px', justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            onClick={onRemoveFromDiagram} 
            variant="outlined" 
            color="primary"
          >
            Remove from Diagram
          </Button>
          <Button 
            onClick={onDeleteFromRepository} 
            variant="contained" 
            color="error"
          >
            Delete from Repository
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default UmlDeleteDialog;
