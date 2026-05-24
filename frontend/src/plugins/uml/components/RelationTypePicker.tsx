import React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

interface RelationType {
  id: string;
  name: string;
  plantuml_arrow: string;
}

interface RelationTypePickerProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSelect: (type: RelationType) => void;
  relationTypes: RelationType[];
}

const RelationTypePicker: React.FC<RelationTypePickerProps> = ({
  open,
  anchorEl,
  onClose,
  onSelect,
  relationTypes,
}) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <Box sx={{ p: 2, minWidth: 200 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Change Relation Type
        </Typography>
        <List dense>
          {relationTypes.map((type) => (
            <ListItem key={type.id} disablePadding>
              <ListItemButton onClick={() => onSelect(type)}>
                <ListItemText 
                  primary={type.name} 
                  secondary={<code>{type.plantuml_arrow}</code>} 
                  secondaryTypographyProps={{ style: { fontSize: '10px' } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Popover>
  );
};

export default RelationTypePicker;
