import React from 'react';
import { useDemoMode } from '../contexts/DemoContext';
import { FlaskConical } from 'lucide-react';

const DemoModeToggle: React.FC = () => {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <div className="demo-mode-toggle">
      <div className="demo-toggle-content">
        <FlaskConical size={18} className="demo-icon" />
        <span className="demo-label">Demo Mode</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isDemoMode}
            onChange={toggleDemoMode}
          />
          <span className="slider"></span>
        </label>
      </div>
      
      {isDemoMode && (
        <div className="demo-badge">
          <span>🎭 Demo</span>
        </div>
      )}
    </div>
  );
};

export default DemoModeToggle;