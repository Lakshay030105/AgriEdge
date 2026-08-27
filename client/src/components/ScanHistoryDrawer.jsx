import { useEffect, useState } from 'react';
import { getFarmerScans, deleteFarmerScan } from '../db/db';
import { useLanguage } from '../context/LanguageContext';

/**
 * Individual Farmer Crop Scan Diary (खेत का पिछला रिकॉर्ड)
 * Displays chronological, zero-bloat field diagnoses stored locally in IndexedDB.
 */
export default function ScanHistoryDrawer({ farmerId, onSelectScan, refreshTrigger }) {
  const { lang, t } = useLanguage();
  const [scans, setScans] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadScans = async () => {
    if (!farmerId) {
      setScans([]);
      return;
    }
    setLoading(true);
    try {
      const records = await getFarmerScans(farmerId);
      setScans(records);
    } catch (err) {
      console.warn("Failed to load farmer scans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, [farmerId, refreshTrigger]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteFarmerScan(id);
      loadScans();
    } catch (err) {
      console.warn("Failed to delete scan record:", err);
    }
  };

  if (!farmerId) return null;

  return (
    <div style={{
      marginTop: '20px',
      padding: '14px',
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'left'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '15px', color: '#e5f5e8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {t('farmDiaryTitle')}
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '10px',
              backgroundColor: 'rgba(74, 222, 128, 0.15)',
              color: '#4ade80',
              border: '1px solid rgba(74, 222, 128, 0.3)'
            }}>
              {scans.length}
            </span>
          </h4>
          <span style={{ fontSize: '11px', color: '#8fa394' }}>
            {t('farmDiarySub')}
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            color: '#4ade80',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          {isExpanded ? '▲ ' + (lang === 'hi' ? 'छिपाएं' : 'Hide') : '▼ ' + (lang === 'hi' ? 'दिखाएं' : 'Show')}
        </button>
      </div>

      {/* Scans List */}
      {isExpanded && (
        <div style={{ marginTop: '12px' }}>
          {loading ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#8fa394', fontSize: '12px' }}>
              Loading field diary...
            </div>
          ) : scans.length === 0 ? (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              color: '#8fa394',
              fontSize: '12px'
            }}>
              {t('noScansYet')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
              {scans.map((scan) => {
                const dateStr = new Date(scan.timestamp).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                });

                const displayName = (lang === 'hi' && scan.diseaseNameHi)
                  ? scan.diseaseNameHi
                  : scan.diseaseName;

                return (
                  <div
                    key={scan.id}
                    onClick={() => onSelectScan && onSelectScan(scan)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Micro Thumbnail or Crop Icon */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      backgroundColor: '#0a0f0d',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {scan.thumbnail ? (
                        <img src={scan.thumbnail} alt="Leaf thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '20px' }}>🌿</span>
                      )}
                    </div>

                    {/* Scan Information */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: scan.isHealthy ? '#4ade80' : '#f87171',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {displayName}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '600' }}>
                          {scan.isHealthy ? '0%' : `${scan.severityScore}%`}
                        </span>
                        <span style={{ fontSize: '10px', color: '#8fa394' }}>
                          📅 {dateStr}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => onSelectScan && onSelectScan(scan)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'rgba(74, 222, 128, 0.15)',
                          color: '#4ade80',
                          border: '1px solid rgba(74, 222, 128, 0.3)',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {t('viewRx')}
                      </button>

                      <button
                        onClick={(e) => handleDelete(e, scan.id)}
                        title={t('deleteScan')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6e8274',
                          fontSize: '13px',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
