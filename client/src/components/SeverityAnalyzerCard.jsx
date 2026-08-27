import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Level 1: AI Disease Severity Analyzer Card
 * Visualizes foliar surface area infection %, active severity tier, and CV lesion segmentation mask.
 * Supports full English and Hindi localization.
 */
export default function SeverityAnalyzerCard({ severityData, originalImage, isHealthy }) {
  const { lang, t } = useLanguage();
  const [showMask, setShowMask] = useState(false);

  if (!severityData) return null;

  const { severityScore, tier, healthyRatio, maskDataUrl } = severityData;
  const isSevere = tier?.tier === 3;
  const meterColor = tier?.color || '#4ade80';

  // Localized tier badge
  const getLocalizedBadge = () => {
    if (lang === 'hi') {
      if (isHealthy || (tier?.tier === 0)) return 'स्टेज 0: एकदम स्वस्थ';
      if (tier?.tier === 1) return 'स्टेज 1: शुरुआती (<10%)';
      if (tier?.tier === 2) return 'स्टेज 2: मध्यम (10–30%)';
      return 'स्टेज 3: गंभीर (>30%)';
    }
    return tier?.badge || 'Tier 0';
  };

  return (
    <div style={{
      marginTop: '16px',
      padding: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderRadius: '12px',
      border: `1px solid ${isSevere ? 'rgba(248, 113, 113, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`,
      textAlign: 'left'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8fa394', fontWeight: '700' }}>
            {t('level1Cv')}
          </span>
          <h4 style={{ margin: '2px 0 0 0', fontSize: '15px', color: '#e5f5e8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🔬 {t('foliarSeverity')}
          </h4>
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          padding: '4px 10px',
          borderRadius: '9999px',
          backgroundColor: `${meterColor}20`,
          color: meterColor,
          border: `1px solid ${meterColor}50`
        }}>
          {getLocalizedBadge()}
        </span>
      </div>

      {/* Severity Progress Bar */}
      <div style={{ marginTop: '12px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px', color: '#8fa394' }}>{t('infectedSurface')}</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: meterColor }}>
            {isHealthy ? '0.0%' : `${severityScore}%`}
          </span>
        </div>

        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            width: `${Math.min(100, Math.max(0, isHealthy ? 0 : severityScore))}%`,
            height: '100%',
            backgroundColor: meterColor,
            borderRadius: '9999px',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: '#6e8274' }}>
          <span>{t('pristine')}</span>
          <span>{t('mild')}</span>
          <span>{t('moderate')}</span>
          <span>{t('necrosis')}</span>
        </div>
      </div>

      {/* Surface Area Breakdown Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '14px',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div>
          <span style={{ fontSize: '11px', color: '#8fa394', display: 'block' }}>{t('healthyCanopy')}</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#4ade80' }}>
            {isHealthy ? '100%' : `${healthyRatio}%`}
          </span>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: '#8fa394', display: 'block' }}>{t('necroticLesions')}</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: isHealthy ? '#4ade80' : meterColor }}>
            {isHealthy ? '0%' : `${severityScore}%`}
          </span>
        </div>
      </div>

      {/* Computer Vision Segmentation Mask Toggle */}
      {(maskDataUrl || originalImage) && !isHealthy && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#e5f5e8' }}>
              {t('cvFilter')}
            </span>
            <button
              onClick={() => setShowMask(!showMask)}
              style={{
                backgroundColor: showMask ? '#4ade80' : 'rgba(255, 255, 255, 0.08)',
                color: showMask ? '#121816' : '#e5f5e8',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {showMask ? t('showOriginal') : t('viewMask')}
            </button>
          </div>

          {showMask && maskDataUrl && (
            <div style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              backgroundColor: '#0a0f0d',
              aspectRatio: '1/1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={maskDataUrl}
                alt="Computer Vision Lesion Mask"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                right: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                padding: '6px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                color: '#e5f5e8',
                display: 'flex',
                justifyContent: 'space-between',
                backdropFilter: 'blur(4px)'
              }}>
                <span><strong style={{ color: '#f87171' }}>{t('redLesions')}</strong></span>
                <span><strong style={{ color: '#4ade80' }}>{t('greenHealthy')}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Critical Alert Banner for Tier 3 (>30% infection) */}
      {isSevere && !isHealthy && (
        <div style={{
          marginTop: '12px',
          padding: '10px 12px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          color: '#fca5a5',
          fontSize: '12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '16px' }}>🚨</span>
          <div>
            <strong style={{ color: '#f87171', display: 'block', marginBottom: '2px' }}>
              {t('criticalOutbreak')}
            </strong>
            {t('criticalOutbreakDesc')}
          </div>
        </div>
      )}
    </div>
  );
}
