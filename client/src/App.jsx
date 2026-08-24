import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

function FarmerScannerPlaceholder() {
  return (
    <div className="screen-card">
      <h2>🌿 Farmer Scanner View</h2>
      <p style={{ marginTop: '10px', color: '#8fa394' }}>
        Camera viewfinder, Grad-CAM heatmap, and diagnosis engine will be mounted here.
      </p>
    </div>
  );
}

function NGOCommandCenterPlaceholder() {
  return (
    <div className="screen-card">
      <h2>📡 NGO Command Center</h2>
      <p style={{ marginTop: '10px', color: '#8fa394' }}>
        Live disease outbreak map (Level 2 stretch goal) will appear here.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '22px', color: '#4ade80' }}>AgriEdge</h1>
          <p style={{ fontSize: '12px', color: '#8fa394' }}>Edge AI Diagnostics</p>
        </header>

        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Diagnostic Scanner
          </NavLink>
          <NavLink to="/ngo" className={({ isActive }) => (isActive ? 'active' : '')}>
            NGO Command
          </NavLink>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<FarmerScannerPlaceholder />} />
            <Route path="/ngo" element={<NGOCommandCenterPlaceholder />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}