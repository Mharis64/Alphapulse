import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SentimentResult } from '../types';

interface SentimentStore {
  results: SentimentResult[];
  addResult: (r: SentimentResult) => void;
  clearResults: () => void;
}

const SentimentContext = createContext<SentimentStore>({
  results: [],
  addResult: () => {},
  clearResults: () => {},
});

export function SentimentProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<SentimentResult[]>([]);

  function addResult(r: SentimentResult) {
    setResults(prev => [r, ...prev].slice(0, 50));
  }

  function clearResults() {
    setResults([]);
  }

  return (
    <SentimentContext.Provider value={{ results, addResult, clearResults }}>
      {children}
    </SentimentContext.Provider>
  );
}

export function useSentimentStore() {
  return useContext(SentimentContext);
}