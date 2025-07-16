// src/hooks/useStocks.ts
import { useContext } from 'react';
import { StocksContext } from '../contexts/StocksContext';

export const useStocks = () => {
  const context = useContext(StocksContext);
  if (!context) throw new Error('useStocks must be used within StocksProvider');
  return context;
};
