import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { FooterStatusBar } from './FooterStatusBar';
import CopilotFloatingWidget from '../../../components/copilot/CopilotFloatingWidget';
import GlobalCommandPaletteModal from '../../../components/common/GlobalCommandPaletteModal';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState('Refinery Alpha');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global Ctrl + K / Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLaunchCopilotQuery = (query: string) => {
    // Open copilot drawer with query pre-filled by dispatching custom event
    const event = new CustomEvent('copilot-launch-query', { detail: { query } });
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-300">
      {/* Top Header */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedPlant={selectedPlant}
        setSelectedPlant={setSelectedPlant}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Body with Sidebar + Workspace Content */}
      <div className="flex-1 flex relative">
        <Sidebar isOpen={sidebarOpen} />

        {/* Content Container */}
        <main
          className={`flex-1 transition-all duration-300 p-6 pb-16 ${
            sidebarOpen ? 'ml-60' : 'ml-16'
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette Modal (Ctrl + K) */}
      <GlobalCommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onLaunchCopilotQuery={handleLaunchCopilotQuery}
      />

      {/* Floating PlantTwin AI Copilot Assistant */}
      <CopilotFloatingWidget />

      {/* Bottom Control Room Footer */}
      <FooterStatusBar />
    </div>
  );
};

export default DashboardLayout;
