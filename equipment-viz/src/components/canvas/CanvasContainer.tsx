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
  const [appReady, setAppReady] = useState(false);

  // Interaction constants
  const GRID_SIZE = 10;
  const MIN_CARD_WIDTH = 120;
  const MIN_CARD_HEIGHT = 60;

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

  const handleWheel = (e: React.WheelEvent) => {
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
    
    // Narrow union type: only Regions have 'plants'
    if (!('plants' in region)) return plantNodes;

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
    
    // Narrow union type: only Plants have 'areas'
    if (!('areas' in plant) || !plant.areas || plant.areas.length === 0) return areaNodes;

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

  // Helper: update a node by id in a nested tree
  const updateNodeTree = (list: VisualizationNode[], id: string, patch: Partial<VisualizationNode>): VisualizationNode[] => {
    return list.map((n) => {
      if (n.id === id) return { ...n, ...patch };
      if (n.children && n.children.length > 0) {
        return { ...n, children: updateNodeTree(n.children, id, patch) };
      }
      return n;
    });
  };

  const createNodeGraphics = (
    node: VisualizationNode,
    onNodeClick: (node: VisualizationNode) => void,
    onNodeDoubleClick: (node: VisualizationNode) => void,
    isChild: boolean = false,
    app?: PIXI.Application,
    currentScale: number = 1,
    commitNodeUpdate?: (id: string, patch: Partial<VisualizationNode>) => void,
  ): PIXI.Container => {
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
    
    graphics.eventMode = 'static';
    graphics.cursor = 'pointer';
    
    // Handle single and double clicks
    let clickTimeout: ReturnType<typeof setTimeout> | null = null;
    let clickCount = 0;
    let suppressClick = false; // set by handle interactions to ignore node clicks
    
    graphics.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
      // Ignore clicks coming from handles or other children
      let fromHandle = false;
      let t: any = e.target as any;
      while (t) {
        if ((t as any).__isHandle) { fromHandle = true; break; }
        t = t.parent;
      }
      if (fromHandle || e.target !== graphics || suppressClick) {
        suppressClick = false;
        return;
      }
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
    });
    
    graphics.on('pointerout', () => {
      graphics.alpha = 1;
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
      const childContainer = createNodeGraphics(child, onNodeClick, onNodeDoubleClick, true, app, currentScale, commitNodeUpdate);
      container.addChild(childContainer);
    });

    // Move/Resize handles (require app and commit callback)
    if (app && commitNodeUpdate) {
      let currentW = node.width;
      let currentH = node.height;
      // Move handle (top-right)
      const moveHandle = new PIXI.Graphics();
      (moveHandle as any).__isHandle = true;
      moveHandle.eventMode = 'static';
      moveHandle.cursor = 'grab';
      const drawMoveHandle = () => {
        moveHandle.clear();
        moveHandle.fill({ color: 0x1976d2, alpha: 1 });
        moveHandle.roundRect(currentW - 18, 4, 14, 14, 3);
        moveHandle.stroke({ width: 1, color: 0xffffff, alpha: 0.9 });
      };
      drawMoveHandle();

      let dragging = false;
      let startGlobal = { x: 0, y: 0 };
      let startPos = { x: node.x, y: node.y };
      const onMovePointerMove = (e: PIXI.FederatedPointerEvent) => {
        if (!dragging) return;
        const g = e.global;
        const dx = (g.x - startGlobal.x) / (currentScale || 1);
        const dy = (g.y - startGlobal.y) / (currentScale || 1);
        const nx = Math.round((startPos.x + dx) / GRID_SIZE) * GRID_SIZE;
        const ny = Math.round((startPos.y + dy) / GRID_SIZE) * GRID_SIZE;
        container.position.set(nx, ny);
      };
      const onMovePointerUp = () => {
        if (!dragging) return;
        dragging = false;
        moveHandle.cursor = 'grab';
        app.stage.off('pointermove', onMovePointerMove);
        app.stage.off('pointerup', onMovePointerUp);
        app.stage.off('pointerupoutside', onMovePointerUp);
        const nx = container.position.x;
        const ny = container.position.y;
        commitNodeUpdate(node.id, { x: nx, y: ny });
        suppressClick = true;
        if (clickTimeout) { clearTimeout(clickTimeout); clickTimeout = null; }
        clickCount = 0;
      };
      moveHandle.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        e.preventDefault();
        suppressClick = true;
        if (clickTimeout) { clearTimeout(clickTimeout); clickTimeout = null; }
        clickCount = 0;
        dragging = true;
        moveHandle.cursor = 'grabbing';
        startGlobal = { x: e.global.x, y: e.global.y };
        startPos = { x: container.position.x, y: container.position.y };
        app.stage.on('pointermove', onMovePointerMove);
        app.stage.on('pointerup', onMovePointerUp);
        app.stage.on('pointerupoutside', onMovePointerUp);
      });
      container.addChild(moveHandle);

      // Resize handle (bottom-right)
      const resizeHandle = new PIXI.Graphics();
      (resizeHandle as any).__isHandle = true;
      resizeHandle.eventMode = 'static';
      resizeHandle.cursor = 'nwse-resize';
      const drawResizeHandle = () => {
        resizeHandle.clear();
        resizeHandle.fill({ color: 0x424242, alpha: 1 });
        resizeHandle.rect(currentW - 12, currentH - 12, 10, 10);
        resizeHandle.stroke({ width: 1, color: 0xffffff, alpha: 0.9 });
      };
      drawResizeHandle();

      let resizing = false;
      let startGlobalR = { x: 0, y: 0 };
      let startSize = { w: node.width, h: node.height };
      let lastDrawn = { w: node.width, h: node.height };

      const redrawCard = (nw: number, nh: number) => {
        lastDrawn = { w: nw, h: nh };
        currentW = nw;
        currentH = nh;
        graphics.clear();
        if (node.type === 'region') {
          graphics.roundRect(0, 0, nw, nh, 15);
        } else if (node.type === 'plant') {
          graphics.roundRect(0, 0, nw, nh, 10);
        } else if (node.type === 'area') {
          graphics.roundRect(0, 0, nw, nh, 8);
        } else {
          graphics.rect(0, 0, nw, nh);
        }
        graphics.fill({ color: node.color, alpha: 0.7 });
        graphics.stroke({ width: 2, color: 0x333333, alpha: 1 });
        // update text constraints/position
        text.style.wordWrapWidth = nw - 10;
        text.x = nw / 2;
        if (node.type === 'region') {
          text.y = 25;
        } else if (node.type === 'plant') {
          text.y = 20;
        } else if (node.type === 'area') {
          text.y = 20;
        } else if (node.type === 'location') {
          text.y = 12;
        } else {
          text.y = nh / 2;
        }
        drawMoveHandle();
        drawResizeHandle();
      };

      const onResizePointerMove = (e: PIXI.FederatedPointerEvent) => {
        if (!resizing) return;
        const g = e.global;
        const dx = (g.x - startGlobalR.x) / (currentScale || 1);
        const dy = (g.y - startGlobalR.y) / (currentScale || 1);
        const rawW = startSize.w + dx;
        const rawH = startSize.h + dy;
        const snappedW = Math.max(MIN_CARD_WIDTH, Math.round(rawW / GRID_SIZE) * GRID_SIZE);
        const snappedH = Math.max(MIN_CARD_HEIGHT, Math.round(rawH / GRID_SIZE) * GRID_SIZE);
        redrawCard(snappedW, snappedH);
      };
      const onResizePointerUp = () => {
        if (!resizing) return;
        resizing = false;
        resizeHandle.cursor = 'nwse-resize';
        app.stage.off('pointermove', onResizePointerMove);
        app.stage.off('pointerup', onResizePointerUp);
        app.stage.off('pointerupoutside', onResizePointerUp);
        commitNodeUpdate(node.id, { width: lastDrawn.w, height: lastDrawn.h });
        suppressClick = true;
        if (clickTimeout) { clearTimeout(clickTimeout); clickTimeout = null; }
        clickCount = 0;
      };
      resizeHandle.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        e.preventDefault();
        suppressClick = true;
        if (clickTimeout) { clearTimeout(clickTimeout); clickTimeout = null; }
        clickCount = 0;
        resizing = true;
        startGlobalR = { x: e.global.x, y: e.global.y };
        startSize = { w: node.width, h: node.height };
        app.stage.on('pointermove', onResizePointerMove);
        app.stage.on('pointerup', onResizePointerUp);
        app.stage.on('pointerupoutside', onResizePointerUp);
      });
      container.addChild(resizeHandle);
    }

    return container;
  };

  useEffect(() => {
    // Initialize PIXI app once enterprise and dimensions are ready
    if (!enterprise) return;
    if (!containerRef.current) return;
    if (dimensions.width <= 0 || dimensions.height <= 0) return;

    let isDestroyed = false;

    const initApp = async () => {
      if (appRef.current) {
        // Ensure canvas is attached (in case of hot-reloads)
        if (containerRef.current && appRef.current.canvas && !containerRef.current.contains(appRef.current.canvas)) {
          containerRef.current.appendChild(appRef.current.canvas);
        }
        setAppReady(true);
        return;
      }

      try {
        const app = new PIXI.Application();
        await app.init({
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: 0xf5f5f5,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });
        if (isDestroyed) {
          app.destroy(false);
          return;
        }
        appRef.current = app;
        if (containerRef.current && app.canvas) {
          containerRef.current.appendChild(app.canvas);
        }
        setAppReady(true);
      } catch (error) {
        console.error('PIXI: Error during initialization:', error);
      }
    };

    initApp();

    return () => {
      isDestroyed = true;
      if (appRef.current) {
        try {
          if (appRef.current.canvas && appRef.current.canvas.parentNode) {
            appRef.current.canvas.parentNode.removeChild(appRef.current.canvas);
          }
          appRef.current.destroy(false);
        } catch (e) {
          console.warn('Error during cleanup:', e);
        }
        appRef.current = null;
      }
      setAppReady(false);
    };
  }, [enterprise, dimensions]);

  useEffect(() => {
    // Render/update stage when nodes or transforms change
    const app = appRef.current;
    if (!app || !appReady) return;

    // Clear stage
    app.stage.removeChildren();

    // Create main container for scaling and positioning
    const mainContainer = new PIXI.Container();
    mainContainer.scale.set(scale, scale);
    mainContainer.position.set(position.x, position.y);

    if (nodes.length > 0) {
      const commitNodeUpdate = (id: string, patch: Partial<VisualizationNode>) => {
        setNodes(prev => updateNodeTree(prev, id, patch));
      };
      nodes.forEach((node) => {
        const nodeContainer = createNodeGraphics(node, handleNodeClick, handleNodeDoubleClick, false, app, scale, commitNodeUpdate);
        mainContainer.addChild(nodeContainer);
      });
    } else {
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
  }, [appReady, nodes, scale, position, dimensions]);

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
      {!enterprise && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          Loading...
        </Box>
      )}
      <Box
        ref={containerRef}
        sx={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative',
          overflow: 'hidden'
        }}
        onWheel={handleWheel}
      />
    </Box>
  );
};