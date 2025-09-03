import React, { useState, useCallback, useMemo } from 'react';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PublicIcon from '@mui/icons-material/Public';
import FactoryIcon from '@mui/icons-material/Factory';
import DomainIcon from '@mui/icons-material/Domain';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { useEquipment } from '../../contexts/EquipmentContext';
import { Box, Typography } from '@mui/material';

export const TreeView: React.FC = React.memo(() => {
  const { enterprise, setSelectedItem } = useEquipment();
  const [expanded, setExpanded] = useState<string[]>(['root']);
  const [selected, setSelected] = useState<string>('');

  const handleToggle = useCallback((_event: React.SyntheticEvent | null, itemIds: string[]) => {
    setExpanded(itemIds);
  }, []);

  const handleSelect = useCallback((_event: React.SyntheticEvent | null, itemId: string | null) => {
    setSelected(itemId || '');
    
    const parts = (itemId || '').split('-');
    const type = parts[0];
    const id = parts.slice(1).join('-');
    
    if (type === 'root' || !enterprise || !itemId) return;
    
    let item = null;
    
    if (type === 'region') {
      item = enterprise.regions.find(r => r.id === id);
      if (item) setSelectedItem(item, 'region');
    } else if (type === 'plant') {
      enterprise.regions.forEach(region => {
        const plant = region.plants?.find(p => p.id === id);
        if (plant) {
          item = plant;
          setSelectedItem(plant, 'plant');
        }
      });
    } else if (type === 'area') {
      enterprise.regions.forEach(region => {
        region.plants?.forEach(plant => {
          const area = plant.areas?.find(a => a.id === id);
          if (area) {
            item = area;
            setSelectedItem(area, 'area');
          }
        });
      });
    } else if (type === 'location') {
      enterprise.regions.forEach(region => {
        region.plants?.forEach(plant => {
          plant.areas?.forEach(area => {
            const location = area.locations?.find(l => l.id === id);
            if (location) {
              item = location;
              setSelectedItem(location, 'location');
            }
          });
        });
      });
    } else if (type === 'equipment') {
      enterprise.regions.forEach(region => {
        region.plants?.forEach(plant => {
          plant.areas?.forEach(area => {
            area.locations?.forEach(location => {
              const equipment = location.equipment?.find(e => e.id === id);
              if (equipment) {
                item = equipment;
                setSelectedItem(equipment, 'equipment');
              }
            });
          });
        });
      });
    }
  }, [enterprise, setSelectedItem]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'region':
        return <PublicIcon sx={{ mr: 1, fontSize: 18 }} />;
      case 'plant':
        return <FactoryIcon sx={{ mr: 1, fontSize: 18 }} />;
      case 'area':
        return <DomainIcon sx={{ mr: 1, fontSize: 18 }} />;
      case 'location':
        return <LocationOnIcon sx={{ mr: 1, fontSize: 18 }} />;
      case 'equipment':
        return <PrecisionManufacturingIcon sx={{ mr: 1, fontSize: 18 }} />;
      default:
        return null;
    }
  };

  if (!enterprise) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No enterprise data available
        </Typography>
      </Box>
    );
  }

  return (
    <SimpleTreeView
      slots={{
        collapseIcon: ExpandMoreIcon,
        expandIcon: ChevronRightIcon,
      }}
      expandedItems={expanded}
      selectedItems={selected}
      onExpandedItemsChange={handleToggle}
      onSelectedItemsChange={handleSelect}
      sx={{ flexGrow: 1, overflowY: 'auto' }}
    >
      <TreeItem itemId="root" label={enterprise.name}>
        {enterprise.regions?.map(region => (
          <TreeItem
            key={region.id}
            itemId={`region-${region.id}`}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getIcon('region')}
                {region.name} ({region.code})
              </Box>
            }
          >
            {region.plants?.map(plant => (
              <TreeItem
                key={plant.id}
                itemId={`plant-${plant.id}`}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getIcon('plant')}
                    {plant.name}
                  </Box>
                }
              >
                {plant.areas?.map(area => (
                  <TreeItem
                    key={area.id}
                    itemId={`area-${area.id}`}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getIcon('area')}
                        {area.name}
                      </Box>
                    }
                  >
                    {area.locations?.map(location => (
                      <TreeItem
                        key={location.id}
                        itemId={`location-${location.id}`}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getIcon('location')}
                            {location.name}
                          </Box>
                        }
                      >
                        {location.equipment?.map(equipment => (
                          <TreeItem
                            key={equipment.id}
                            itemId={`equipment-${equipment.id}`}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getIcon('equipment')}
                                {equipment.name}
                              </Box>
                            }
                          />
                        ))}
                      </TreeItem>
                    ))}
                  </TreeItem>
                ))}
              </TreeItem>
            ))}
          </TreeItem>
        ))}
      </TreeItem>
    </SimpleTreeView>
  );
});

TreeView.displayName = 'TreeView';