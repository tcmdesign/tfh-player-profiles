import { useState, useEffect, useRef } from 'react';
import { get } from '../api/client';

export default function PlayerSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const timerRef = useRef(null);
  const listboxId = 'ps-listbox';

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      setActiveIdx(-1);
      return;
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      get(`/players?name=${encodeURIComponent(query)}&limit=8`)
        .then(d => {
          setResults(d.players || []);
          setOpen(true);
          setActiveIdx(-1);
        })
        .catch(() => {});
    }, 300);
  }, [query]);

  function handleSelect(player) {
    setQuery('');
    setResults([]);
    setOpen(false);
    setActiveIdx(-1);
    onSelect(player.id);
  }

  function handleKeyDown(e) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0) { e.preventDefault(); handleSelect(results[activeIdx]); }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  }

  return (
    <div className="fp-search-wrap">
      <input
        className="fp-search-input"
        type="text"
        aria-label="Search NFL players"
        placeholder="Search any NFL player..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => { setOpen(false); setActiveIdx(-1); }, 200)}
        aria-haspopup="listbox"
        aria-expanded={open && results.length > 0}
        aria-autocomplete="list"
        aria-activedescendant={activeIdx >= 0 ? `${listboxId}-opt-${activeIdx}` : undefined}
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <div className="fp-search-results" role="listbox" id={listboxId} aria-label="Player suggestions">
          {results.map((p, idx) => (
            <div
              key={p.id}
              id={`${listboxId}-opt-${idx}`}
              role="option"
              aria-selected={activeIdx === idx}
              className="fp-search-result-item"
              onMouseDown={() => handleSelect(p)}
              onMouseEnter={() => setActiveIdx(idx)}
              style={activeIdx === idx ? { background: 'var(--fp-navy3)' } : undefined}
            >
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                {p.name}
              </span>
              <span style={{ color: 'var(--fp-muted)', fontSize: '11px', marginLeft: '8px' }}>
                {p.position} · {p.team || 'FA'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
