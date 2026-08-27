import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Dynamic Integrated Pest Management (IPM) Treatment Plan Component
 * 
 * Adapts treatment recommendations dynamically according to:
 * - Specific pathogen diagnosis (from 38 PlantVillage classes)
 * - Exact foliar infection severity tier (Tier 1: <10%, Tier 2: 10-30%, Tier 3: >30%)
 * - Full bilingual English and Hindi localization
 */
export default function DynamicTreatmentPlan({ treatment, prediction, severityData }) {
  const { lang, t } = useLanguage();

  if (!prediction) return null;

  const isHealthy = prediction.isHealthy;
  const initialTierId = isHealthy ? 0 : (severityData?.tier?.tier || 2);
  const [selectedTier, setSelectedTier] = useState(initialTierId);

  // Agronomic Tier Guidance Templates (Bilingual)
  const TIER_GUIDANCE = {
    0: {
      title: t('tier0Title'),
      badgeColor: '#4ade80',
      tag: lang === 'hi' ? '0% स्वस्थ' : '0% Infection',
      advisory: t('tier0Advisory')
    },
    1: {
      title: t('tier1Title'),
      badgeColor: '#4ade80',
      tag: lang === 'hi' ? '<10% शुरुआती' : '<10% Surface',
      advisory: t('tier1Advisory')
    },
    2: {
      title: t('tier2Title'),
      badgeColor: '#fbbf24',
      tag: lang === 'hi' ? '10–30% मध्यम' : '10–30% Surface',
      advisory: t('tier2Advisory')
    },
    3: {
      title: t('tier3Title'),
      badgeColor: '#f87171',
      tag: lang === 'hi' ? '>30% गंभीर' : '>30% Surface',
      advisory: t('tier3Advisory')
    }
  };

  const activeTier = TIER_GUIDANCE[selectedTier] || TIER_GUIDANCE[2];

  // Localized treatment text
  const organicText = (lang === 'hi' && treatment?.organicActionHi)
    ? treatment.organicActionHi
    : (treatment?.organicAction || 'Maintain regular foliar inspection and balanced soil moisture.');

  const chemicalText = (lang === 'hi' && treatment?.chemicalSprayHi)
    ? treatment.chemicalSprayHi
    : (treatment?.chemicalSpray || 'No chemical spray required.');

  return (
    <div style={{
      marginTop: '16px',
      padding: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'left'
    }}>
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8fa394', fontWeight: '700' }}>
            {t('actionEngine')}
          </span>
          <h4 style={{ margin: '2px 0 0 0', fontSize: '15px', color: '#e5f5e8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {t('ipmTitle')}
          </h4>
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          padding: '3px 8px',
          borderRadius: '6px',
          backgroundColor: 'rgba(74, 222, 128, 0.15)',
          color: '#4ade80',
          border: '1px solid rgba(74, 222, 128, 0.3)'
        }}>
          {t('indexedDbVerified')}
        </span>
      </div>

      {/* Interactive Severity Tier Switcher (for exploring dynamic recommendations) */}
      {!isHealthy && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', color: '#8fa394', marginBottom: '6px' }}>
            {t('interactiveTiersDesc')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            {[1, 2, 3].map((tId) => {
              const tierMeta = TIER_GUIDANCE[tId];
              const isCurrentDetected = (severityData?.tier?.tier || 2) === tId;
              const isSelected = selectedTier === tId;

              const stageLabel = lang === 'hi' 
                ? (tId === 1 ? 'हल्का' : tId === 2 ? 'मध्यम' : 'गंभीर')
                : (tId === 1 ? 'Mild' : tId === 2 ? 'Moderate' : 'Severe');

              return (
                <button
                  key={tId}
                  onClick={() => setSelectedTier(tId)}
                  style={{
                    padding: '6px 4px',
                    borderRadius: '6px',
                    border: `1px solid ${isSelected ? tierMeta.badgeColor : 'rgba(255, 255, 255, 0.1)'}`,
                    backgroundColor: isSelected ? `${tierMeta.badgeColor}25` : 'rgba(0, 0, 0, 0.2)',
                    color: isSelected ? '#ffffff' : '#8fa394',
                    fontSize: '11px',
                    fontWeight: isSelected ? '700' : '500',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ color: tierMeta.badgeColor, fontWeight: '700', fontSize: '11px' }}>
                    {tierMeta.tag}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.85 }}>
                    {stageLabel}
                  </div>
                  {isCurrentDetected && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-2px',
                      backgroundColor: tierMeta.badgeColor,
                      color: '#121816',
                      fontSize: '8px',
                      fontWeight: '800',
                      padding: '1px 3px',
                      borderRadius: '4px'
                    }}>
                      {lang === 'hi' ? 'सक्रिय' : 'ACTIVE'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Tier Advisory Banner */}
      {!isHealthy && (
        <div style={{
          padding: '10px 12px',
          backgroundColor: `${activeTier.badgeColor}15`,
          border: `1px solid ${activeTier.badgeColor}35`,
          borderRadius: '8px',
          marginBottom: '14px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: activeTier.badgeColor, marginBottom: '2px' }}>
            {activeTier.title}
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#e5f5e8', lineHeight: '1.4' }}>
            {activeTier.advisory}
          </p>
        </div>
      )}

      {/* Specific Agronomic Treatments (Organic Action & Chemical Intervention) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Organic Action */}
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(74, 222, 128, 0.06)',
          borderLeft: '3px solid #4ade80',
          borderRadius: '0 8px 8px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px' }}>🌱</span>
            <span style={{ fontWeight: '700', color: '#4ade80', fontSize: '13px' }}>
              {t('organicHeading')}
            </span>
          </div>
          <p style={{ margin: 0, color: '#e5f5e8', fontSize: '13px', lineHeight: '1.45' }}>
            {organicText}
          </p>
        </div>

        {/* Chemical Spray */}
        <div style={{
          padding: '12px',
          backgroundColor: isHealthy ? 'rgba(74, 222, 128, 0.06)' : 'rgba(248, 113, 113, 0.06)',
          borderLeft: `3px solid ${isHealthy ? '#4ade80' : '#f87171'}`,
          borderRadius: '0 8px 8px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px' }}>🧪</span>
            <span style={{ fontWeight: '700', color: isHealthy ? '#4ade80' : '#f87171', fontSize: '13px' }}>
              {t('chemicalHeading')}
            </span>
          </div>
          <p style={{ margin: 0, color: '#e5f5e8', fontSize: '13px', lineHeight: '1.45' }}>
            {chemicalText}
          </p>
        </div>
      </div>

      {/* Safety Protocol Note */}
      <div style={{
        marginTop: '12px',
        padding: '8px 10px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#8fa394',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>🛡️</span>
        <span>
          <strong>{t('safetyTitle')}</strong> {t('safetyTip')}
        </span>
      </div>
    </div>
  );
}
