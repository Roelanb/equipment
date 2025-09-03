import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { useEquipment } from '../../contexts/EquipmentContext';
import PublicIcon from '@mui/icons-material/Public';
import FactoryIcon from '@mui/icons-material/Factory';
import DomainIcon from '@mui/icons-material/Domain';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

export const DetailsPanel: React.FC = () => {
  const { selectedItem, selectedType } = useEquipment();

  if (!selectedItem) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Select an item to view details
        </Typography>
      </Box>
    );
  }

  const getIcon = () => {
    switch (selectedType) {
      case 'region':
        return <PublicIcon />;
      case 'plant':
        return <FactoryIcon />;
      case 'area':
        return <DomainIcon />;
      case 'location':
        return <LocationOnIcon />;
      case 'equipment':
        return <PrecisionManufacturingIcon />;
      default:
        return null;
    }
  };

  const getTypeColor = () => {
    switch (selectedType) {
      case 'region':
        return 'primary';
      case 'plant':
        return 'secondary';
      case 'area':
        return 'info';
      case 'location':
        return 'warning';
      case 'equipment':
        return 'success';
      default:
        return 'default';
    }
  };

  const renderAttributes = () => {
    if (selectedType === 'equipment' && selectedItem.attributes) {
      return (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Attributes
          </Typography>
          <List dense>
            {selectedItem.attributes.map((attr: any, index: number) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {attr.definition.name}
                      </Typography>
                      <Chip
                        label={attr.definition.type}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {attr.value || attr.definition.defaultValue || 'N/A'}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      );
    }
    return null;
  };

  const renderChildrenInfo = () => {
    let childrenCount = 0;
    let childrenType = '';

    switch (selectedType) {
      case 'region':
        childrenCount = selectedItem.plants?.length || 0;
        childrenType = 'Plants';
        break;
      case 'plant':
        childrenCount = selectedItem.areas?.length || 0;
        childrenType = 'Areas';
        break;
      case 'area':
        childrenCount = selectedItem.locations?.length || 0;
        childrenType = 'Locations';
        break;
      case 'location':
        childrenCount = selectedItem.equipment?.length || 0;
        childrenType = 'Equipment';
        break;
      case 'equipment':
        childrenCount = selectedItem.childEquipment?.length || 0;
        childrenType = 'Child Equipment';
        break;
    }

    if (childrenCount > 0) {
      return (
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              {childrenType}
            </Typography>
            <Typography variant="h4" color="primary">
              {childrenCount}
            </Typography>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: 'background.default' }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          {getIcon()}
          <Typography variant="h6">
            {selectedItem.name}
          </Typography>
        </Stack>
        <Chip
          label={selectedType?.toUpperCase()}
          color={getTypeColor() as any}
          size="small"
        />
      </Paper>

      <Box sx={{ px: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Details
        </Typography>
        <List dense>
          <ListItem sx={{ pl: 0 }}>
            <ListItemText
              primary="ID"
              secondary={selectedItem.id}
            />
          </ListItem>
          {selectedType === 'region' && (
            <ListItem sx={{ pl: 0 }}>
              <ListItemText
                primary="Code"
                secondary={selectedItem.code}
              />
            </ListItem>
          )}
          {selectedType === 'equipment' && (
            <ListItem sx={{ pl: 0 }}>
              <ListItemText
                primary="Type"
                secondary={selectedItem.type || 'Standard'}
              />
            </ListItem>
          )}
        </List>

        {renderChildrenInfo()}
        {renderAttributes()}
      </Box>
    </Box>
  );
};