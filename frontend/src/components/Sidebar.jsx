import { NavLink } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Backdrop (mobile) */}
      {isOpen && (
        <div
          className="fp-sidebar-backdrop fp-sidebar-backdrop--visible"
          onClick={onClose}
        />
      )}

      <nav className={`fp-sidebar${isOpen ? ' fp-sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="fp-sidebar-logo">
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 17, fontWeight: 800, letterSpacing: '1px',
            textTransform: 'uppercase', color: 'var(--fp-text)',
          }}>
            <span style={{
              background: 'var(--fp-orange-grad)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>TFH</span> Profiles
          </div>
          <div style={{ fontSize: 10, color: 'var(--fp-muted)', marginTop: 3, letterSpacing: '0.3px' }}>
            2026 Draft Guide
          </div>
        </div>

        {/* Nav */}
        <div className="fp-sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `fp-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <span className="fp-nav-icon">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="7" r="4" />
                <path d="M3 19c0-4 3.134-7 7-7s7 3 7 7" />
              </svg>
            </span>
            Player Profiles
          </NavLink>

          <NavLink
            to="/compare"
            className={({ isActive }) => `fp-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <span className="fp-nav-icon">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="6" height="11" rx="1.5" />
                <rect x="12" y="3" width="6" height="13" rx="1.5" />
                <line x1="8" y1="10.5" x2="12" y2="10.5" />
                <path d="M10 8.5l2 2-2 2" />
              </svg>
            </span>
            Compare
          </NavLink>
        </div>
      </nav>
    </>
  );
}
