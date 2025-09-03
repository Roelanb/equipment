import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Enterprise, Region, Plant, Area, Location, Equipment } from '../types/equipment';
import { DataService } from '../services/dataService';

interface EquipmentContextType {
  enterprise: Enterprise | null;
  selectedItem: any | null;
  selectedType: 'region' | 'plant' | 'area' | 'location' | 'equipment' | null;
  setEnterprise: (enterprise: Enterprise) => void;
  setSelectedItem: (item: any, type: 'region' | 'plant' | 'area' | 'location' | 'equipment') => void;
  clearSelection: () => void;
  // CRUD operations
  addRegion: (region: Region) => void;
  addPlant: (regionId: string, plant: Plant) => void;
  addArea: (plantId: string, area: Area) => void;
  addLocation: (areaId: string, location: Location) => void;
  addEquipment: (locationId: string, equipment: Equipment) => void;
  removeRegion: (regionId: string) => void;
  removePlant: (plantId: string) => void;
  removeArea: (areaId: string) => void;
  removeLocation: (locationId: string) => void;
  removeEquipment: (equipmentId: string) => void;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const useEquipment = () => {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error('useEquipment must be used within EquipmentProvider');
  }
  return context;
};

interface EquipmentProviderProps {
  children: ReactNode;
}

export const EquipmentProvider: React.FC<EquipmentProviderProps> = ({ children }) => {
  const [enterprise, setEnterpriseState] = useState<Enterprise | null>(null);
  const [selectedItem, setSelectedItemState] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<'region' | 'plant' | 'area' | 'location' | 'equipment' | null>(null);

  // Auto-save enterprise data with debouncing to prevent infinite loops
  useEffect(() => {
    if (!enterprise) return;
    
    console.log('Enterprise data updated:', enterprise);
    const timeoutId = setTimeout(() => {
      DataService.saveToLocalStorage(enterprise);
    }, 500); // Debounce for 500ms
    
    return () => clearTimeout(timeoutId);
  }, [enterprise]);

  const setEnterprise = useCallback((enterprise: Enterprise) => {
    setEnterpriseState(enterprise);
  }, []);

  const setSelectedItem = (item: any, type: 'region' | 'plant' | 'area' | 'location' | 'equipment') => {
    setSelectedItemState(item);
    setSelectedType(type);
  };

  const clearSelection = () => {
    setSelectedItemState(null);
    setSelectedType(null);
  };

  // CRUD Operations
  const addRegion = (region: Region) => {
    if (!enterprise) return;
    const updatedEnterprise = {
      ...enterprise,
      regions: [...enterprise.regions, region]
    };
    setEnterpriseState(updatedEnterprise);
  };

  const addPlant = (regionId: string, plant: Plant) => {
    if (!enterprise) return;
    const updatedEnterprise = {
      ...enterprise,
      regions: enterprise.regions.map(region => 
        region.id === regionId 
          ? { ...region, plants: [...region.plants, plant] }
          : region
      )
    };
    setEnterpriseState(updatedEnterprise);
  };

  const addArea = (plantId: string, area: Area) => {
    if (!enterprise) return;
    const updatedEnterprise = {
      ...enterprise,
      regions: enterprise.regions.map(region => ({
        ...region,
        plants: region.plants.map(plant => 
          plant.id === plantId 
            ? { ...plant, areas: [...plant.areas, area] }
            : plant
        )
      }))
    };
    setEnterpriseState(updatedEnterprise);
  };

  const addLocation = (areaId: string, location: Location) => {
    if (!enterprise) return;
    const updatedEnterprise = {
      ...enterprise,
      regions: enterprise.regions.map(region => ({
        ...region,
        plants: region.plants.map(plant => ({
          ...plant,
          areas: plant.areas.map(area => 
            area.id === areaId 
              ? { ...area, locations: [...area.locations, location] }
              : area
          )
        }))
      }))
    };
    setEnterpriseState(updatedEnterprise);
  };

  const addEquipment = (locationId: string, equipment: Equipment) => {
    if (!enterprise) return;
    const updatedEnterprise = {
      ...enterprise,
      regions: enterprise.regions.map(region => ({
        ...region,
        plants: region.plants.map(plant => ({
          ...plant,
          areas: plant.areas.map(area => ({
            ...area,
            locations: area.locations.map(loc => 
              loc.id === locationId 
                ? { ...loc, equipment: [...loc.equipment, equipment] }
                : loc
            )
          }))
        }))
      }))
    };
    setEnterpriseState(updatedEnterprise);
  };

  const removeRegion = (regionId: string) => {
    if (!enterprise) return;
    const updatedEnterprise = {
      ...enterprise,
      regions: enterprise.regions.filter(region => region.id !== regionId)
    };
    setEnterpriseState(updatedEnterprise);
    if (selectedItem?.id === regionId) {
      clearSelection();
    }
  };

  const removePlant = (plantId: string) => {
    if (!enterprise) return;
    const updatedEnterprise = {
      ...enterprise,
      regions: enterprise.regions.map(region => ({
        ...region,
        plants: region.plants.filter(plant => plant.id !== plantId)
      }))
    };
    setEnterpriseState(updatedEnterprise);
    if (selectedItem?.id === plantId) {
      clearSelection();
    }
  };

  const removeArea = (areaId: string) => {
    if (!enterprise) return;
    const updatedEnterprise = {
      ...enterprise,
      regions: enterprise.regions.map(region => ({
        ...region,
        plants: region.plants.map(plant => ({
          ...plant,
          areas: plant.areas.filter(area => area.id !== areaId)
        }))
      }))
    };
    setEnterpriseState(updatedEnterprise);
    if (selectedItem?.id === areaId) {
      clearSelection();
    }
  };

  const removeLocation = (locationId: string) => {
    if (!enterprise) return;
    const updatedEnterprise = {
      ...enterprise,
      regions: enterprise.regions.map(region => ({
        ...region,
        plants: region.plants.map(plant => ({
          ...plant,
          areas: plant.areas.map(area => ({
            ...area,
            locations: area.locations.filter(loc => loc.id !== locationId)
          }))
        }))
      }))
    };
    setEnterpriseState(updatedEnterprise);
    if (selectedItem?.id === locationId) {
      clearSelection();
    }
  };

  const removeEquipment = (equipmentId: string) => {
    if (!enterprise) return;
    const updatedEnterprise = {
      ...enterprise,
      regions: enterprise.regions.map(region => ({
        ...region,
        plants: region.plants.map(plant => ({
          ...plant,
          areas: plant.areas.map(area => ({
            ...area,
            locations: area.locations.map(loc => ({
              ...loc,
              equipment: loc.equipment.filter(eq => eq.id !== equipmentId)
            }))
          }))
        }))
      }))
    };
    setEnterpriseState(updatedEnterprise);
    if (selectedItem?.id === equipmentId) {
      clearSelection();
    }
  };

  return (
    <EquipmentContext.Provider
      value={{
        enterprise,
        selectedItem,
        selectedType,
        setEnterprise,
        setSelectedItem,
        clearSelection,
        addRegion,
        addPlant,
        addArea,
        addLocation,
        addEquipment,
        removeRegion,
        removePlant,
        removeArea,
        removeLocation,
        removeEquipment,
      }}
    >
      {children}
    </EquipmentContext.Provider>
  );
};