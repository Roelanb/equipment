import React from 'react';
import type { VisualizationNode } from '../../types/equipment';

interface EquipmentNodeProps {
  node: VisualizationNode;
  onClick: (node: VisualizationNode) => void;
}

// This component is no longer used as we've moved to direct PIXI rendering
// Keeping it for potential future use
export const EquipmentNode: React.FC<EquipmentNodeProps> = () => {
  return null;
};