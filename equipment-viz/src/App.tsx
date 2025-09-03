import React, { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { EquipmentProvider, useEquipment } from './contexts/EquipmentContext';
import { Layout } from './components/layout/Layout';
import { sampleEnterprise } from './data/sampleData';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#fafafa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        },
      },
    },
  },
});

const AppContent: React.FC = () => {
  const { setEnterprise } = useEquipment();

  useEffect(() => {
    setEnterprise(sampleEnterprise);
  }, [setEnterprise]);

  return <Layout />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EquipmentProvider>
        <AppContent />
      </EquipmentProvider>
    </ThemeProvider>
  );
}

export default App
