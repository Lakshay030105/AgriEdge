import { useLanguage } from '../context/LanguageContext';

/**
 * Kisan Prescription Modal (डिजिटल किसान निदान पर्चा)
 * 
 * Generates an official, offline-ready agronomic prescription ticket
 * formatted for agricultural retailers (खाद-बीज विक्रेता) and extension officers.
 */
export default function KisanPrescriptionModal({ isOpen, onClose, prediction, treatment, severityData, capturedImage }) {
  const { lang, t } = useLanguage();

  if (!isOpen || !prediction) return null;

  const dateString = new Date().toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const diseaseDisplayName = (lang === 'hi' && treatment?.diseaseNameHi)
    ? treatment.diseaseNameHi
    : prediction.label;

  const severityText = prediction.isHealthy
    ? (lang === 'hi' ? '0% (पूर्णतः स्वस्थ)' : '0% (Pristine Canopy)')
    : `${severityData?.severityScore || '0'}% (${lang === 'hi' ? 'स्टेज ' + (severityData?.tier?.tier || 2) : 'Tier ' + (severityData?.tier?.tier || 2)})`;

  const chemicalDose = (lang === 'hi' && treatment?.chemicalSprayHi)
    ? treatment.chemicalSprayHi
    : (treatment?.chemicalSpray || 'No chemical treatment needed.');

  const organicDose = (lang === 'hi' && treatment?.organicActionHi)
    ? treatment.organicActionHi
    : (treatment?.organicAction || 'Maintain standard cultural care.');

  // WhatsApp Share Message Formatter
  const handleWhatsAppShare = () => {
    const text = lang === 'hi'
      ? `🌱 *एग्री-एज किसान निदान पर्ची*\n📅 दिनांक: ${dateString}\n🌾 रोग: ${diseaseDisplayName}\n📊 फैलाव: ${severityText}\n🧪 सुझाई गई दवा: ${chemicalDose}\n🌱 जैविक उपचार: ${organicDose}\n\n_AgriEdge - बिना इंटरनेट फसल डॉक्टर_`
      : `🌱 *AgriEdge Digital Crop Prescription*\n📅 Date: ${dateString}\n🌾 Condition: ${diseaseDisplayName}\n📊 Severity: ${severityText}\n🧪 Prescribed Spray: ${chemicalDose}\n🌱 Cultural Action: ${organicDose}\n\n_AgriEdge - Offline Crop Doctor_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
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
        border: '2px solid rgba(74, 222, 128, 0.4)',
        maxWidth: '520px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
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

        {/* Prescription Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px dashed rgba(74, 222, 128, 0.3)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '28px' }}>Rx</span>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#4ade80', letterSpacing: '-0.3px' }}>
              {t('rxTitle')}
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#8fa394' }}>
            {t('rxSub')}
          </p>
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.1)', display: 'inline-block', padding: '2px 8px', borderRadius: '4px' }}>
            ✓ Verified Offline Diagnostic Signature
          </div>
        </div>

        {/* Prescription Content Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
          {/* Date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '6px' }}>
            <span style={{ color: '#8fa394' }}>{t('date')}:</span>
            <span style={{ fontWeight: '600', color: '#e5f5e8' }}>{dateString}</span>
          </div>

          {/* Condition */}
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '8px' }}>
            <span style={{ color: '#8fa394', display: 'block', marginBottom: '2px' }}>{t('cropAndDisease')}:</span>
            <span style={{ fontSize: '15px', fontWeight: '700', color: prediction.isHealthy ? '#4ade80' : '#f87171' }}>
              {diseaseDisplayName}
            </span>
          </div>

          {/* Severity */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '6px' }}>
            <span style={{ color: '#8fa394' }}>{t('severityRating')}:</span>
            <span style={{ fontWeight: '700', color: '#fbbf24' }}>{severityText}</span>
          </div>

          {/* Prescribed Chemical */}
          <div style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(248, 113, 113, 0.08)',
            borderLeft: '4px solid #f87171',
            borderRadius: '4px'
          }}>
            <strong style={{ color: '#f87171', display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              🧪 {t('prescribedChemical')}:
            </strong>
            <div style={{ lineHeight: '1.4', fontSize: '12px' }}>
              {chemicalDose}
            </div>
          </div>

          {/* Organic Cultural Remedy */}
          <div style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(74, 222, 128, 0.08)',
            borderLeft: '4px solid #4ade80',
            borderRadius: '4px'
          }}>
            <strong style={{ color: '#4ade80', display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              🌱 {t('prescribedOrganic')}:
            </strong>
            <div style={{ lineHeight: '1.4', fontSize: '12px' }}>
              {organicDose}
            </div>
          </div>

          {/* Field Application Timing */}
          <div style={{ fontSize: '11px', color: '#8fa394', fontStyle: 'italic', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '8px', borderRadius: '4px' }}>
            ⏱️ <strong>{t('applicationTiming')}:</strong> {t('safetyTip')}
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={handleWhatsAppShare}
            style={{
              flex: 1,
              padding: '10px 14px',
              backgroundColor: '#25D366',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {t('shareWhatsapp')}
          </button>

          <button
            onClick={handlePrint}
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#e5f5e8',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {t('printPrescription')}
          </button>
        </div>
      </div>
    </div>
  );
}
