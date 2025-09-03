import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useEquipment } from '../../contexts/EquipmentContext';
import type { VisualizationNode } from '../../types/equipment';
import { Box, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const CanvasContainer: React.FC = () => {
  const { enterprise, setSelectedItem } = useEquipment();
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [nodes, setNodes] = useState<VisualizationNode[]>([]);
  const [scale, setScale] = useState(1);
  const [position] = useState({ x: 0, y: 0 });
  const [zoomedRegion, setZoomedRegion] = useState<VisualizationNode | null>(null);
  const [zoomedPlant, setZoomedPlant] = useState<VisualizationNode | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'region' | 'plant'>('overview');

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        const newHeight = containerRef.current.offsetHeight;
        setDimensions({
          width: newWidth,
          height: newHeight,
        });
        
        // Resize the PIXI app if it exists
        if (appRef.current) {
          appRef.current.renderer.resize(newWidth, newHeight);
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    console.log('Canvas: enterprise changed', { enterprise: !!enterprise, viewMode });
    if (enterprise) {
      if (viewMode === 'overview') {
        const visualizationNodes = generateVisualizationNodes(enterprise);
        console.log('Canvas: Generated visualization nodes', visualizationNodes);
        setNodes(visualizationNodes);
      } else if (viewMode === 'region' && zoomedRegion) {
        const plantNodes = generatePlantNodes(zoomedRegion);
        console.log('Canvas: Generated plant nodes', plantNodes);
        setNodes(plantNodes);
      } else if (viewMode === 'plant' && zoomedPlant) {
        const areaNodes = generateAreaNodes(zoomedPlant);
        console.log('Canvas: Generated area nodes', areaNodes);
        setNodes(areaNodes);
      }
    }
  }, [enterprise, viewMode, zoomedRegion, zoomedPlant]);

  const generateVisualizationNodes = (enterprise: any): VisualizationNode[] => {
    const nodes: VisualizationNode[] = [];
    const regionColors = {
      AMER: 0x4caf50,
      EMEA: 0x2196f3,
      APAC: 0xff9800,
    };

    enterprise.regions?.forEach((region: any, regionIndex: number) => {
      const regionNode: VisualizationNode = {
        id: region.id,
        name: region.name,
        type: 'region',
        x: 50 + regionIndex * 400,
        y: 50,
        width: 350,
        height: 500,
        color: regionColors[region.code as keyof typeof regionColors] || 0x808080,
        data: region,
        children: [],
      };

      region.plants?.forEach((plant: any, plantIndex: number) => {
        const plantNode: VisualizationNode = {
          id: plant.id,
          name: plant.name,
          type: 'plant',
          x: 20,  // Relative to parent region
          y: 50 + plantIndex * 120,  // Relative to parent region
          width: 310,
          height: 100,
          color: 0x9e9e9e,
          data: plant,
          children: [],
        };

        plant.areas?.forEach((area: any, areaIndex: number) => {
          const areaNode: VisualizationNode = {
            id: area.id,
            name: area.name,
            type: 'area',
            x: 10 + areaIndex * 100,  // Relative to parent plant
            y: 40,  // Relative to parent plant
            width: 90,
            height: 50,
            color: 0xbdbdbd,
            data: area,
            children: [],
          };
          plantNode.children?.push(areaNode);
        });

        regionNode.children?.push(plantNode);
      });

      nodes.push(regionNode);
    });

    return nodes;
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prevScale => Math.max(0.1, Math.min(3, prevScale * scaleFactor)));
  };

  const handleNodeClick = (node: VisualizationNode) => {
    if (viewMode === 'overview' && node.type === 'region') {
      // Zoom into the region
      setZoomedRegion(node);
      setViewMode('region');
      setSelectedItem(node.data, node.type);
    } else if (viewMode === 'region' && node.type === 'plant') {
      // Zoom into the plant
      setZoomedPlant(node);
      setViewMode('plant');
      setSelectedItem(node.data, node.type);
    } else {
      // Regular selection
      setSelectedItem(node.data, node.type);
    }
  };

  const handleNodeDoubleClick = (node: VisualizationNode) => {
    if (node.type === 'plant') {
      // Find the parent region if we're in overview
      if (viewMode === 'overview') {
        // Find the region that contains this plant
        const region = nodes.find(n => 
          n.type === 'region' && 
          n.children?.some(child => child.id === node.id)
        );
        if (region) {
          setZoomedRegion(region);
        }
      }
      // Zoom directly into the plant
      setZoomedPlant(node);
      setViewMode('plant');
      setSelectedItem(node.data, node.type);
    } else if (node.type === 'area') {
      // For areas, we need to set up the zoom hierarchy
      if (viewMode === 'overview') {
        // Find the parent region and plant
        let parentRegion: VisualizationNode | undefined;
        let parentPlant: VisualizationNode | undefined;
        
        nodes.forEach(region => {
          if (region.type === 'region') {
            region.children?.forEach(plant => {
              if (plant.type === 'plant' && plant.children?.some(area => area.id === node.id)) {
                parentRegion = region;
                parentPlant = plant;
              }
            });
          }
        });
        
        if (parentRegion && parentPlant) {
          setZoomedRegion(parentRegion);
          setZoomedPlant(parentPlant);
          setViewMode('plant');
          setSelectedItem(node.data, node.type);
        }
      } else if (viewMode === 'region') {
        // Find the parent plant
        const parentPlant = nodes.find(plant => 
          plant.type === 'plant' && 
          plant.children?.some(area => area.id === node.id)
        );
        if (parentPlant) {
          setZoomedPlant(parentPlant);
          setViewMode('plant');
          setSelectedItem(node.data, node.type);
        }
      }
    }
  };

  const handleBackClick = () => {
    if (viewMode === 'plant') {
      // Go back to region view
      setViewMode('region');
      setZoomedPlant(null);
    } else if (viewMode === 'region') {
      // Go back to overview
      setViewMode('overview');
      setZoomedRegion(null);
    }
  };

  const generatePlantNodes = (regionNode: VisualizationNode): VisualizationNode[] => {
    const plantNodes: VisualizationNode[] = [];
    const region = regionNode.data;
    
    if (!region.plants) return plantNodes;

    const cols = Math.ceil(Math.sqrt(region.plants.length));
    const rows = Math.ceil(region.plants.length / cols);
    const cardWidth = Math.min(300, (dimensions.width - 100) / cols - 20);
    const cardHeight = Math.min(200, (dimensions.height - 150) / rows - 20);
    const spacing = 20;

    region.plants.forEach((plant: any, index: number) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const plantNode: VisualizationNode = {
        id: plant.id,
        name: plant.name,
        type: 'plant',
        x: 50 + col * (cardWidth + spacing),
        y: 100 + row * (cardHeight + spacing),
        width: cardWidth,
        height: cardHeight,
        color: 0x9e9e9e,
        data: plant,
        children: [],
      };

      // Add areas as smaller nodes within the plant
      plant.areas?.forEach((area: any, areaIndex: number) => {
        const areaNode: VisualizationNode = {
          id: area.id,
          name: area.name,
          type: 'area',
          x: 10 + (areaIndex % 3) * (cardWidth / 3 - 15),
          y: cardHeight / 2 + Math.floor(areaIndex / 3) * 40,
          width: cardWidth / 3 - 20,
          height: 35,
          color: 0xbdbdbd,
          data: area,
          children: [],
        };
        plantNode.children?.push(areaNode);
      });

      plantNodes.push(plantNode);
    });

    return plantNodes;
  };

  const generateAreaNodes = (plantNode: VisualizationNode): VisualizationNode[] => {
    const areaNodes: VisualizationNode[] = [];
    const plant = plantNode.data;
    
    if (!plant.areas || plant.areas.length === 0) return areaNodes;

    const cols = Math.ceil(Math.sqrt(plant.areas.length));
    const rows = Math.ceil(plant.areas.length / cols);
    const cardWidth = Math.min(250, (dimensions.width - 100) / cols - 20);
    const cardHeight = Math.min(150, (dimensions.height - 150) / rows - 20);
    const spacing = 20;

    plant.areas.forEach((area: any, index: number) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const areaNode: VisualizationNode = {
        id: area.id,
        name: area.name,
        type: 'area',
        x: 50 + col * (cardWidth + spacing),
        y: 100 + row * (cardHeight + spacing),
        width: cardWidth,
        height: cardHeight,
        color: 0xbdbdbd,
        data: area,
        children: [],
      };

      // Add locations as smaller nodes within the area if they exist
      area.locations?.forEach((location: any, locationIndex: number) => {
        const locationNode: VisualizationNode = {
          id: location.id,
          name: location.name,
          type: 'location',
          x: 10 + (locationIndex % 2) * (cardWidth / 2 - 15),
          y: cardHeight / 2 + Math.floor(locationIndex / 2) * 30,
          width: cardWidth / 2 - 20,
          height: 25,
          color: 0xe0e0e0,
          data: location,
          children: [],
        };
        areaNode.children?.push(locationNode);
      });

      areaNodes.push(areaNode);
    });

    return areaNodes;
  };

  const createNodeGraphics = (node: VisualizationNode, onNodeClick: (node: VisualizationNode) => void, onNodeDoubleClick: (node: VisualizationNode) => void, isChild: boolean = false): PIXI.Container => {
    const container = new PIXI.Container();
    const graphics = new PIXI.Graphics();
    
    // Use PIXI v8 Graphics API - shape first, then styling
    if (node.type === 'region') {
      graphics.roundRect(0, 0, node.width, node.height, 15);
    } else if (node.type === 'plant') {
      graphics.roundRect(0, 0, node.width, node.height, 10);
    } else if (node.type === 'area') {
      graphics.roundRect(0, 0, node.width, node.height, 8);
    } else {
      graphics.rect(0, 0, node.width, node.height);
    }
    
    // Apply fill and stroke using v8 API
    graphics.fill({ color: node.color, alpha: 0.7 });
    graphics.stroke({ width: 2, color: 0x333333, alpha: 1 });
    
    graphics.interactive = true;
    graphics.cursor = 'pointer';
    
    // Handle single and double clicks
    let clickTimeout: NodeJS.Timeout | null = null;
    let clickCount = 0;
    
    graphics.on('pointerdown', () => {
      clickCount++;
      
      if (clickCount === 1) {
        clickTimeout = setTimeout(() => {
          // Single click
          onNodeClick(node);
          clickCount = 0;
        }, 250);
      } else if (clickCount === 2) {
        // Double click
        if (clickTimeout) {
          clearTimeout(clickTimeout);
        }
        onNodeDoubleClick(node);
        clickCount = 0;
      }
    });
    
    // Add hover effect
    graphics.on('pointerover', () => {
      graphics.alpha = 0.9;
      graphics.tint = 0xffffff;
    });
    
    graphics.on('pointerout', () => {
      graphics.alpha = 1;
      graphics.tint = 0xffffff;
    });
    
    // Add text using PIXI v8 API
    const fontSize = node.type === 'region' ? 18 : node.type === 'plant' ? 16 : node.type === 'area' ? 14 : 11;
    const text = new PIXI.Text({
      text: node.name,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: fontSize,
        fill: node.type === 'region' || node.type === 'plant' ? 0xffffff : 0x333333,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: node.width - 10,
      }
    });
    
    text.anchor.set(0.5, 0.5);
    text.x = node.width / 2;
    // Position text at top for regions, plants, areas, and locations
    if (node.type === 'region') {
      text.y = 25;
    } else if (node.type === 'plant') {
      text.y = 20;
    } else if (node.type === 'area') {
      text.y = 20;
    } else if (node.type === 'location') {
      text.y = 12;  // Closer to top for smaller location nodes
    } else {
      text.y = node.height / 2;  // Center for any other types
    }
    
    container.addChild(graphics);
    container.addChild(text);
    
    // Position container - use absolute positioning for root nodes, relative for children
    container.position.set(node.x, node.y);
    
    // Add child nodes as children of this container
    node.children?.forEach(child => {
      const childContainer = createNodeGraphics(child, onNodeClick, onNodeDoubleClick, true);
      container.addChild(childContainer);
    });
    
    return container;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let app: PIXI.Application | null = null;
    let isDestroyed = false;

    // Create new PIXI application using the new v8 API
    const initApp = async () => {
      console.log('PIXI: Starting app initialization', { width: dimensions.width, height: dimensions.height, nodesCount: nodes.length });
      
      // Clean up any existing app before creating new one
      if (appRef.current) {
        try {
          // Remove canvas from DOM first
          if (appRef.current.canvas && appRef.current.canvas.parentNode) {
            appRef.current.canvas.parentNode.removeChild(appRef.current.canvas);
          }
          // Destroy the app
          appRef.current.destroy(false);
          console.log('PIXI: Previous app destroyed');
        } catch (e) {
          console.warn('Error destroying previous PIXI app:', e);
        }
        appRef.current = null;
      }

      if (isDestroyed) return;

      try {
        app = new PIXI.Application();
        console.log('PIXI: Application instance created');
        
        await app.init({
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: 0xf5f5f5,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });
        console.log('PIXI: Application initialized successfully');

        if (isDestroyed || !app) return;

        // Store the app reference
        appRef.current = app;

        // Add canvas to container
        if (containerRef.current && app.canvas) {
          containerRef.current.appendChild(app.canvas);
          console.log('PIXI: Canvas added to DOM');
        } else {
          console.warn('PIXI: Cannot add canvas to DOM', { containerRef: !!containerRef.current, canvas: !!app.canvas });
        }
      } catch (error) {
        console.error('PIXI: Error during initialization:', error);
        return;
      }

      // Create main container for scaling and positioning
      const mainContainer = new PIXI.Container();
      mainContainer.scale.set(scale, scale);
      mainContainer.position.set(position.x, position.y);

      // Add nodes to the container
      console.log('PIXI: Rendering', nodes.length, 'nodes');
      if (nodes.length > 0) {
        nodes.forEach((node) => {
          const nodeContainer = createNodeGraphics(node, handleNodeClick, handleNodeDoubleClick, false);
          mainContainer.addChild(nodeContainer);
        });
      } else {
        // Show empty state message
        const emptyText = new PIXI.Text({
          text: 'No equipment data available.\nAdd regions to get started.',
          style: {
            fontFamily: 'Arial, sans-serif',
            fontSize: 18,
            fill: 0x666666,
            align: 'center',
          }
        });
        emptyText.anchor.set(0.5);
        emptyText.x = dimensions.width / 2;
        emptyText.y = dimensions.height / 2;
        mainContainer.addChild(emptyText);
      }

      app.stage.addChild(mainContainer);
      console.log('PIXI: Render complete!');
    };

    initApp();

    // Cleanup on unmount
    return () => {
      isDestroyed = true;
      if (appRef.current) {
        try {
          // Remove canvas from DOM first
          if (appRef.current.canvas && appRef.current.canvas.parentNode) {
            appRef.current.canvas.parentNode.removeChild(appRef.current.canvas);
          }
          // Destroy the app with minimal options to avoid errors
          appRef.current.destroy(false);
        } catch (e) {
          console.warn('Error during cleanup:', e);
        }
        appRef.current = null;
      }
    };
  }, [nodes, dimensions, scale, position]);

  return (
    <Box
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative'
      }}
    >
      {(viewMode === 'region' || viewMode === 'plant') && (
        <IconButton
          onClick={handleBackClick}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 1000,
            backgroundColor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          aria-label="Back to overview"
        >
          <ArrowBackIcon />
        </IconButton>
      )}
      <Box
        ref={containerRef}
        sx={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative',
          overflow: 'hidden'
        }}
        onWheel={handleWheel as any}
      />
    </Box>
  );
};