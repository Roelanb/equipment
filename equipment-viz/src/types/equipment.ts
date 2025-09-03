export type AttributeType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'datetime' 
  | 'time' 
  | 'enum' 
  | 'object' 
  | 'array';

export interface AttributeDefinition {
  name: string;
  type: AttributeType;
  required: boolean;
  defaultValue?: any;
  enumValues?: string[];
}

export interface Attribute {
  definition: AttributeDefinition;
  value: any;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  attributes: Attribute[];
  childEquipment?: Equipment[];
  parentId?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface Location {
  id: string;
  name: string;
  equipment: Equipment[];
  areaId: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface Area {
  id: string;
  name: string;
  locations: Location[];
  plantId: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface Plant {
  id: string;
  name: string;
  areas: Area[];
  regionId: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export type RegionCode = 'AMER' | 'EMEA' | 'APAC';

export interface Region {
  id: string;
  code: RegionCode;
  name: string;
  plants: Plant[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface Enterprise {
  id: string;
  name: string;
  regions: Region[];
}

export interface VisualizationNode {
  id: string;
  name: string;
  type: 'region' | 'plant' | 'area' | 'location' | 'equipment';
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  children?: VisualizationNode[];
  data: Region | Plant | Area | Location | Equipment;
}