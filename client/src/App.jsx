import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { initDatabase, db } from './db/db'; // Import your DB logic

function FarmerScannerPlaceholder() {
  const [treatmentCount, setTreatmentCount] = useState(0);

  useEffect(() => {
    // Count how many records are stored offline
    db.treatments.count().then(setTreatmentCount);
  }, []);

  return (
    <div className="screen-card">
      <h2>🌿 Farmer Scanner View</h2>
      <p style={{ marginTop: '10px', color: '#4ade80' }}>
        Offline Database Ready: {treatmentCount} treatment protocols cached locally.
      </p>
    </div>
  );
}

function NGOCommandCenterPlaceholder() {
  return (
    <div className="screen-card">
      <h2>📡 NGO Command Center</h2>
      <p style={{ marginTop: '10px', color: '#8fa394' }}>
        Live disease outbreak map will appear here.
      </p>
    </div>
  );
}

export default function App() {
  // Run the database initialization when the app starts
  useEffect(() => {
    initDatabase();
  }, []);

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