const FEATURED = [
  { id: 2506, name: "Ja'Marr Chase" },
  { id: 2225, name: 'CeeDee Lamb' },
  { id: 1155, name: 'Tyreek Hill' },
  { id: 856,  name: 'Stefon Diggs' },
];

export default function PlayerSwitcher({ activeId, onSelect }) {
  return (
    <div className="fp-player-switch">
      {FEATURED.map(p => (
        <button
          key={p.id}
          className={`fp-switch-btn${activeId === p.id ? ' active' : ''}`}
          onClick={() => onSelect(p.id)}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
