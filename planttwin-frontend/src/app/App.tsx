import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { ThemeProvider } from './theme/ThemeProvider';
import { PlantTelemetryProvider } from './contexts/PlantTelemetryContext';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PlantTelemetryProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </PlantTelemetryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
