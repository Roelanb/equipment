import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEquipment } from '../../contexts/EquipmentContext';
import { AddItemDialog } from './AddItemDialog';

export const EquipmentToolbar: React.FC = () => {
  const {
    selectedItem,
    selectedType,
    removeRegion,
    removePlant,
    removeArea,
    removeLocation,
    removeEquipment,
  } = useEquipment();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addItemType, setAddItemType] = useState<'region' | 'plant' | 'area' | 'location' | 'equipment'>('region');
  const [parentId, setParentId] = useState<string | undefined>();

  const handleAdd = () => {
    // Determine what type of item to add based on selection
    if (!selectedType) {
      // No selection, add a region
      setAddItemType('region');
      setParentId(undefined);
    } else if (selectedType === 'region') {
      // Region selected, add a plant
      setAddItemType('plant');
      setParentId(selectedItem?.id);
    } else if (selectedType === 'plant') {
      // Plant selected, add an area
      setAddItemType('area');
      setParentId(selectedItem?.id);
    } else if (selectedType === 'area') {
      // Area selected, add a location
      setAddItemType('location');
      setParentId(selectedItem?.id);
    } else if (selectedType === 'location') {
      // Location selected, add equipment
      setAddItemType('equipment');
      setParentId(selectedItem?.id);
    }
    setAddDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedItem && selectedType) {
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (!selectedItem || !selectedType) return;

    switch (selectedType) {
      case 'region':
        removeRegion(selectedItem.id);
        break;
      case 'plant':
        removePlant(selectedItem.id);
        break;
      case 'area':
        removeArea(selectedItem.id);
        break;
      case 'location':
        removeLocation(selectedItem.id);
        break;
      case 'equipment':
        removeEquipment(selectedItem.id);
        break;
    }
    setDeleteDialogOpen(false);
  };

  const getAddButtonText = () => {
    if (!selectedType) return 'Add Region';
    switch (selectedType) {
      case 'region':
        return 'Add Plant';
      case 'plant':
        return 'Add Area';
      case 'area':
        return 'Add Location';
      case 'location':
        return 'Add Equipment';
      default:
        return 'Add';
    }
  };

  const canAddChild = selectedType !== 'equipment';

  return (
    <>
      <Toolbar variant="dense" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Equipment Manager
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canAddChild && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              size="small"
            >
              {getAddButtonText()}
            </Button>
          )}
          <IconButton
            color="error"
            onClick={handleDelete}
            disabled={!selectedItem}
            size="small"
            title="Delete selected item"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Toolbar>

      <AddItemDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        itemType={addItemType}
        parentId={parentId}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedItem?.name}"? 
            {selectedType === 'region' && ' This will also delete all plants, areas, locations, and equipment within this region.'}
            {selectedType === 'plant' && ' This will also delete all areas, locations, and equipment within this plant.'}
            {selectedType === 'area' && ' This will also delete all locations and equipment within this area.'}
            {selectedType === 'location' && ' This will also delete all equipment within this location.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};