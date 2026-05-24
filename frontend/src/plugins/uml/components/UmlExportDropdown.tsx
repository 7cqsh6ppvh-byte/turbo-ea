import React, { useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import MaterialSymbol from '@/components/MaterialSymbol';
import { useExport } from '../hooks/useDiagram';

interface UmlExportDropdownProps {
  diagramId: string;
}

const UmlExportDropdown: React.FC<UmlExportDropdownProps> = ({ diagramId }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const { exportAs } = useExport(diagramId);

  const open = Boolean(anchorEl);
  const id = open ? 'export-dropdown' : undefined;

  const handleExport = async (format: 'plantuml' | 'svg' | 'png') => {
    setExporting(true);
    try {
      await exportAs(format);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Tooltip title="Export Diagram" arrow>
      <Button
        variant="outlined"
        size="small"
        startIcon={<MaterialSymbol icon="file_download" />}
        aria-describedby={id}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        Export
      </Button>
      <Menu
        id={id}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{
          'data-testid': 'export-menu',
        }}
      >
        <MenuList>
          <MenuItem
            onClick={() => handleExport('plantuml')}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <CircularProgress size={18} /> Exporting...
              </>
            ) : (
              <>.puml (PlantUML Text)</>
            )}
          </MenuItem>
          <MenuItem
            onClick={() => handleExport('svg')}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <CircularProgress size={18} /> Exporting...
              </>
            ) : (
              <>.svg (Vector Image)</>
            )}
          </MenuItem>
          <MenuItem
            onClick={() => handleExport('png')}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <CircularProgress size={18} /> Exporting...
              </>
            ) : (
              <>.png (Raster Image)</>
            )}
          </MenuItem>
        </MenuList>
      </Menu>
    </Tooltip>
  );
};

export default UmlExportDropdown;
