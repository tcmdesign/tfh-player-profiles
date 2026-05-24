export default function TfhOutlook({ data, loading }) {
  if (loading || !data?.writeup) return null;

  return (
    <div className="fp-insight" style={{ marginBottom: 16 }}>
      <div className="fp-insight-head">2026 TFH Outlook</div>
      <div className="fp-insight-text">{data.writeup}</div>
    </div>
  );
}
