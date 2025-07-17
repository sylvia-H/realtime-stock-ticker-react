// PerformanceStats.tsx
import Stats from 'stats.js';
import { useEffect } from 'react';

export const PerformanceStats = () => {
  useEffect(() => {
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    
    document.body.appendChild(stats.dom);

    const loop = () => {
      stats.begin();
      stats.end();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => {
      document.body.removeChild(stats.dom);
    };
  }, []);
  return null;
};