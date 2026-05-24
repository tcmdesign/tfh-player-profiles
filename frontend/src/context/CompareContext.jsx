import { createContext, useContext, useState, useCallback } from 'react';

const CompareContext = createContext(null);

export const MAX_COMPARE = 4;

export function CompareProvider({ children }) {
  const [list,    setList]    = useState([]); // [{ id, name, position, team }]
  const [toast,   setToast]   = useState(null); // message string or null

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const add = useCallback((player) => {
    setList(prev => {
      if (prev.find(p => p.id === player.id)) return prev; // already in
      if (prev.length >= MAX_COMPARE) {
        showToast(`You're already comparing ${MAX_COMPARE} players. Remove one to add another.`);
        return prev;
      }
      return [...prev, player];
    });
  }, []);

  const remove = useCallback((id) => {
    setList(prev => prev.filter(p => p.id !== id));
  }, []);

  const clear = useCallback(() => setList([]), []);

  const isComparing = useCallback((id) => list.some(p => p.id === id), [list]);

  return (
    <CompareContext.Provider value={{ list, add, remove, clear, isComparing, toast }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
