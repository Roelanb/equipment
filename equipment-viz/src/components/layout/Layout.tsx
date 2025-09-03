import React from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  Paper,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { TreeView } from '../ui/TreeView';
import { DetailsPanel } from '../ui/DetailsPanel';
import { CanvasContainer } from '../canvas/CanvasContainer';
import { EquipmentToolbar } from '../ui/EquipmentToolbar';

const drawerWidth = 280;
const detailsPanelWidth = 320;

export const Layout: React.FC = () => {
  const theme = useTheme();
  const [openDrawer, setOpenDrawer] = React.useState(true);
  const [openDetails] = React.useState(true);

  const handleDrawerToggle = () => {
    setOpenDrawer(!openDrawer);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.primary.main,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            {openDrawer ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Enterprise Equipment Visualization
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        anchor="left"
        open={openDrawer}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            mt: 8,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Equipment Hierarchy
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TreeView />
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          mt: 8,
          ml: openDrawer ? 0 : `-${drawerWidth}px`,
          mr: openDetails ? 0 : `-${detailsPanelWidth}px`,
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Paper
          elevation={2}
          sx={{
            height: 'calc(100vh - 96px)',
            position: 'relative',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <EquipmentToolbar />
          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            <CanvasContainer />
          </Box>
        </Paper>
      </Box>

      <Drawer
        variant="persistent"
        anchor="right"
        open={openDetails}
        sx={{
          width: detailsPanelWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: detailsPanelWidth,
            boxSizing: 'border-box',
            mt: 8,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <DetailsPanel />
        </Box>
      </Drawer>
    </Box>
  );
};