// context/ProdutoContext.tsx
import React, { createContext, useState } from 'react';

export const ProdutoContext = createContext<any>(null);

export function ProdutoProvider({ children }: { children: React.ReactNode }) {
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  return (
    <ProdutoContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </ProdutoContext.Provider>
  );
}