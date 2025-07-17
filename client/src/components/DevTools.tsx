// src/components/DevTools.tsx
import { PerformanceStats } from './PerformanceStats';

export default function DevTools() {
  if (!import.meta.env.DEV) return null;

  return (
    <div>
      <PerformanceStats />
      {/* 未來可以在這裡加入其他開發用工具 */}
    </div>
  );
}
