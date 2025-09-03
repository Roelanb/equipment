import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useEquipment } from '../../contexts/EquipmentContext';
import type { RegionCode } from '../../types/equipment';

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  itemType: 'region' | 'plant' | 'area' | 'location' | 'equipment';
  parentId?: string;
}

export const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onClose,
  itemType,
  parentId,
}) => {
  const { addRegion, addPlant, addArea, addLocation, addEquipment } = useEquipment();
  const [name, setName] = useState('');
  const [regionCode, setRegionCode] = useState<RegionCode>('AMER');
  const [equipmentType, setEquipmentType] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;

    const id = `${itemType}-${Date.now()}`;

    switch (itemType) {
      case 'region':
        addRegion({
          id,
          name,
          code: regionCode,
          plants: [],
        });
        break;
      case 'plant':
        if (parentId) {
          addPlant(parentId, {
            id,
            name,
            areas: [],
            regionId: parentId,
          });
        }
        break;
      case 'area':
        if (parentId) {
          addArea(parentId, {
            id,
            name,
            locations: [],
            plantId: parentId,
          });
        }
        break;
      case 'location':
        if (parentId) {
          addLocation(parentId, {
            id,
            name,
            equipment: [],
            areaId: parentId,
          });
        }
        break;
      case 'equipment':
        if (parentId) {
          addEquipment(parentId, {
            id,
            name,
            type: equipmentType || 'General',
            attributes: [],
          });
        }
        break;
    }

    // Reset form
    setName('');
    setEquipmentType('');
    onClose();
  };

  const handleRegionCodeChange = (event: SelectChangeEvent) => {
    setRegionCode(event.target.value as RegionCode);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New {itemType.charAt(0).toUpperCase() + itemType.slice(1)}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
        />
        
        {itemType === 'region' && (
          <FormControl fullWidth variant="outlined">
            <InputLabel>Region Code</InputLabel>
            <Select
              value={regionCode}
              onChange={handleRegionCodeChange}
              label="Region Code"
            >
              <MenuItem value="AMER">Americas (AMER)</MenuItem>
              <MenuItem value="EMEA">Europe, Middle East & Africa (EMEA)</MenuItem>
              <MenuItem value="APAC">Asia Pacific (APAC)</MenuItem>
            </Select>
          </FormControl>
        )}
        
        {itemType === 'equipment' && (
          <TextField
            margin="dense"
            label="Equipment Type"
            fullWidth
            variant="outlined"
            value={equipmentType}
            onChange={(e) => setEquipmentType(e.target.value)}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!name.trim()}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};