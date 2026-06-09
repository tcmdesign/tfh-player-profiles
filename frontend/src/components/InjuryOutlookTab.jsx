function riskLevel(rating) {
  if (!rating) return 'low';
  if (/high/i.test(rating))     return 'high';
  if (/moderate/i.test(rating)) return 'moderate';
  return 'low';
}

const RISK_COLORS = { low: '#00CC66', moderate: '#FFD700', high: '#FF4444' };
const REC_STYLES = {
  Draft:          { color: '#00CC66', bg: 'rgba(0,204,102,0.12)', border: 'rgba(0,204,102,0.4)' },
  "Don't Draft":  { color: '#FF4444', bg: 'rgba(255,68,68,0.12)', border: 'rgba(255,68,68,0.4)' },
};

export default function InjuryOutlookTab({ data, loading }) {
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--fp-muted)', fontSize: 13 }}>
        Loading injury outlook…
      </div>
    );
  }
  if (!data?.analysis) return null;

  const rl = riskLevel(data.risk_rating);
  const rc = RISK_COLORS[rl];
  const recStyle = REC_STYLES[data.recommendation] || REC_STYLES['Draft'];

  const historyItems = (data.prior_history || '')
    .split('\n')
    .filter(Boolean);

  const paragraphs = (data.analysis || '')
    .split('\n\n')
    .filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header badges */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'stretch',
      }}>
        {/* Injury */}
        <div style={{
          flex: 1,
          background: 'var(--fp-navy2)',
          border: '1px solid var(--fp-border)',
          borderRadius: 10, padding: '14px 16px',
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase',
            color: 'var(--fp-muted)', marginBottom: 6,
          }}>2025 Injury</div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
            fontSize: 16, color: 'var(--fp-text)', lineHeight: 1.3,
          }}>{data.injury}</div>
          {data.week_injured && (
            <div style={{
              fontFamily: "'Courier Prime', monospace", fontSize: 10,
              color: 'var(--fp-muted)', marginTop: 4, letterSpacing: '0.5px',
            }}>{data.week_injured}</div>
          )}
        </div>

        {/* Risk Rating */}
        <div style={{
          minWidth: 140, textAlign: 'center',
          background: `${rc}0a`,
          border: `1px solid ${rc}44`,
          borderRadius: 10, padding: '14px 16px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase',
            color: rc, marginBottom: 4,
          }}>Risk Rating</div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
            fontSize: 22, color: rc, textTransform: 'uppercase',
          }}>{data.risk_rating}</div>
        </div>

        {/* Recommendation */}
        <div style={{
          minWidth: 120, textAlign: 'center',
          background: recStyle.bg,
          border: `1px solid ${recStyle.border}`,
          borderRadius: 10, padding: '14px 16px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase',
            color: recStyle.color, marginBottom: 4,
          }}>Recommendation</div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
            fontSize: 20, color: recStyle.color, textTransform: 'uppercase',
          }}>{data.recommendation}</div>
        </div>
      </div>

      {/* Prior History */}
      {historyItems.length > 0 && (
        <div style={{
          background: 'var(--fp-navy2)',
          border: '1px solid var(--fp-border)',
          borderRadius: 10, padding: '14px 16px',
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase',
            color: 'var(--fp-muted)', marginBottom: 8,
          }}>Prior Injury History</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {historyItems.map((item, i) => (
              <span key={i} style={{
                fontFamily: "'Courier Prime', monospace", fontSize: 10,
                color: '#aaa', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4, padding: '3px 8px',
              }}>{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* Analysis */}
      <div style={{
        background: 'var(--fp-navy2)',
        border: '1px solid var(--fp-border)',
        borderRadius: 10, padding: '16px 18px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase',
            color: 'var(--fp-muted)',
          }}>Dr. Ethan Turner's Analysis</div>
        </div>
        <div style={{
          fontFamily: "'Courier Prime', monospace", fontSize: 12,
          lineHeight: 1.65, color: 'var(--fp-steel)',
        }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ marginBottom: i < paragraphs.length - 1 ? 10 : 0 }}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
