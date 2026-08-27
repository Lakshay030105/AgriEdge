import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

/**
 * Offline-First Farmer Authentication Modal
 * Allows farmers to register or login using Mobile Number + 4-digit PIN.
 * Includes a 1-click Quick Demo login for hackathon judges.
 */
export default function FarmerAuthModal({ isOpen, onClose }) {
  const { login, signup, quickDemoLogin } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!phone || !pin) throw new Error('Please enter mobile number and 4-digit PIN.');
        await login(phone, pin);
      } else {
        if (!name || !phone || !pin) throw new Error('Please fill in Name, Mobile Number, and 4-digit PIN.');
        if (pin.length !== 4) throw new Error('Security PIN must be exactly 4 digits.');
        await signup({ name, phone, village, pin });
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await quickDemoLogin();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#121816',
        borderRadius: '16px',
        border: '2px solid rgba(74, 222, 128, 0.35)',
        maxWidth: '440px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        color: '#e5f5e8',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#8fa394',
            fontSize: '20px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ✕
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <span style={{ fontSize: '32px' }}>🧑‍🌾</span>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '18px', color: '#4ade80' }}>
            {mode === 'login' ? t('loginTitle') : t('signupTitle')}
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#8fa394' }}>
            {t('loginRequiredMsg')}
          </p>
        </div>

        {/* 1-Click Judge / Demo Login */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: 'rgba(251, 191, 36, 0.15)',
              color: '#fbbf24',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            {t('quickDemoBtn')}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ fontSize: '11px', color: '#8fa394' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          padding: '3px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: mode === 'login' ? '#4ade80' : 'transparent',
              color: mode === 'login' ? '#121816' : '#8fa394',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {t('loginTitle')}
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: mode === 'signup' ? '#4ade80' : 'transparent',
              color: mode === 'signup' ? '#121816' : '#8fa394',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {t('signupTitle')}
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            color: '#f87171',
            fontSize: '12px',
            marginBottom: '14px',
            textAlign: 'left'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: '11px', color: '#8fa394', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                {t('farmerName')} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', color: '#8fa394', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
              {t('farmerPhone')} *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: '11px', color: '#8fa394', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                {t('farmerVillage')} (Optional)
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Nashik, Maharashtra"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', color: '#8fa394', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
              {t('farmerPin')} (4 Digits) *
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '16px',
                letterSpacing: '4px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#4ade80',
              color: '#121816',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isSubmitting ? '...' : (mode === 'login' ? t('loginBtn') : t('signupBtn'))}
          </button>
        </form>
      </div>
    </div>
  );
}
