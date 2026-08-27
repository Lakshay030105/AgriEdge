import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { initDatabase } from './db/db';
import Scanner from './components/Scanner';
import FarmerAuthModal from './components/FarmerAuthModal';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function MainLayout() {
  const { lang, setLang, t } = useLanguage();
  const { farmer, logout, isAuthModalOpen, setIsAuthModalOpen } = useAuth();
  
  // Real-time network monitor
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="app-container">
      <header style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', color: '#4ade80', letterSpacing: '-0.5px', margin: 0 }}>
          🌿 {t('appName')}
        </h1>
        <p style={{ fontSize: '13px', color: '#8fa394', margin: '2px 0 10px 0' }}>
          {t('appSubtitle')}
        </p>

        {/* Real-time Network Pill & Language Switcher Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Offline / Online Network Indicator */}
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            padding: '5px 10px',
            borderRadius: '20px',
            backgroundColor: !isOnline ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            color: !isOnline ? '#4ade80' : '#8fa394',
            border: `1px solid ${!isOnline ? '#4ade80' : 'rgba(255, 255, 255, 0.15)'}`
          }}>
            {!isOnline ? t('offlineStatusOffline') : t('offlineStatusOnline')}
          </span>

          {/* Bilingual Switcher */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '3px',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <button
              onClick={() => setLang('hi')}
              style={{
                backgroundColor: lang === 'hi' ? '#4ade80' : 'transparent',
                color: lang === 'hi' ? '#121816' : '#e5f5e8',
                border: 'none',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🇮🇳 हिंदी
            </button>
            <button
              onClick={() => setLang('en')}
              style={{
                backgroundColor: lang === 'en' ? '#4ade80' : 'transparent',
                color: lang === 'en' ? '#121816' : '#e5f5e8',
                border: 'none',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Farmer Profile Status Bar */}
        <div style={{ marginTop: '10px' }}>
          {farmer ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(74, 222, 128, 0.1)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
              <span style={{ fontSize: '12px', color: '#e5f5e8', fontWeight: '600' }}>
                🧑‍🌾 {farmer.name} {farmer.village ? `(${farmer.village})` : ''}
              </span>
              <button
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f87171',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '2px 4px'
                }}
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                backgroundColor: 'rgba(74, 222, 128, 0.15)',
                color: '#4ade80',
                border: '1px solid #4ade80',
                borderRadius: '20px',
                padding: '5px 14px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🧑‍🌾 {t('loginTitle')}
            </button>
          )}
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Scanner />} />
        </Routes>
      </main>

      {/* Offline Farmer Auth Modal */}
      <FarmerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}