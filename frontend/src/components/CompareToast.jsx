import { useCompare } from '../context/CompareContext';

export default function CompareToast() {
  const { toast } = useCompare();
  if (!toast) return null;

  return (
    <div style={{
      position:     'fixed',
      bottom:       28,
      left:         '50%',
      transform:    'translateX(-50%)',
      background:   '#1C1C20',
      border:       '1px solid rgba(239,68,68,0.4)',
      color:        '#F0EFED',
      borderRadius: 8,
      padding:      '12px 20px',
      fontSize:     13,
      fontWeight:   500,
      zIndex:       9999,
      boxShadow:    '0 8px 32px rgba(0,0,0,0.5)',
      display:      'flex',
      alignItems:   'center',
      gap:          10,
      whiteSpace:   'nowrap',
      animation:    'slideUp 0.2s ease',
    }}>
      <span style={{ color: '#EF4444', fontSize: 16 }}>⚠</span>
      {toast}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}
