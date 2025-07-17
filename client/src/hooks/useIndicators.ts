import { useEffect, useRef, useState } from 'react';
import { scheduleIndicatorUpdate } from '../utils/calculateIndicators';

export function useIndicators(price: number, symbol: string) {
  const [indicators, setIndicators] = useState({ sma: NaN, ema: NaN, high: 0, low: 0 });
  const bufferRef = useRef<Record<string, number[]>>({});

  useEffect(() => {
    if (!bufferRef.current[symbol]) {
      bufferRef.current[symbol] = [];
    }

    const list = bufferRef.current[symbol];
    list.push(price);
    if (list.length > 100) list.shift();

    scheduleIndicatorUpdate(list, setIndicators);
  }, [price, symbol]);

  return indicators;
}
