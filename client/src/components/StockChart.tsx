// src/components/StockChart.tsx
import React, { useMemo } from 'react';
import { Chart } from 'react-chartjs-2';
import {
  CandlestickController,
  CandlestickElement,
  OhlcElement,
} from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  Tooltip,
  Title,
  Legend,
  CategoryScale,
  type ChartData,
  type ChartOptions,
  type ChartDataset,
} from 'chart.js';

import type { StockPriceUpdate } from '../types';
import { transformToCandlestick, type CandlestickDataPoint } from '../utils/candlestickTransformer';
import { useIndicators } from '../hooks/useIndicators';

ChartJS.register(
  TimeScale,
  LinearScale,
  Tooltip,
  Title,
  Legend,
  CategoryScale,
  CandlestickController,
  CandlestickElement,
  OhlcElement
);

interface StockChartProps {
  stockHistory: Record<string, StockPriceUpdate[]>;
  selectedTicker: string | null;
}


const StockChartComponent: React.FC<StockChartProps> = ({ stockHistory, selectedTicker }) => {
  // 1. 先宣告所有 hooks（即使資料不足也要呼叫）
  const raw = useMemo(
    () => (selectedTicker && stockHistory[selectedTicker] ? stockHistory[selectedTicker] : []),
    [selectedTicker, stockHistory]
  );
  const recentPrices = useMemo(() => {
    return raw.slice(-100).map(p => Number(p.price));
  }, [raw]);
  // useIndicators 需傳 (prices: number[], ticker: string)
  const latestPrice = recentPrices.length > 0 ? recentPrices[recentPrices.length - 1] : NaN;
  const indicators = useIndicators(latestPrice, selectedTicker ?? '');
  const candles: CandlestickDataPoint[] = useMemo(() => {
    return transformToCandlestick(raw, 5);
  }, [raw]);
  const data: ChartData<'candlestick', CandlestickDataPoint[], unknown> = useMemo(() => ({
    datasets: [
      {
        label: `${selectedTicker} Candlestick`,
        data: candles,
        borderColor: '#000',
        backgroundColor: '#ccc',
        color: {
          up: '#10b981',
          down: '#ef4444',
          unchanged: '#d1d5db',
        },
      } as unknown as ChartDataset<'candlestick', CandlestickDataPoint[]>,
    ],
  }), [candles, selectedTicker]);
  const options: ChartOptions<'candlestick'> = useMemo(() => ({
    responsive: true,
    scales: {
      x: {
        type: 'time',
        offset: false,
        time: {
          unit: 'minute',
          tooltipFormat: 'HH:mm:ss',
        },
        title: {
          display: true,
          text: '時間',
        },
      },
      y: {
        title: {
          display: true,
          text: '價格',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#000',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#888',
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const raw = context.raw as CandlestickDataPoint;
            return `開: ${raw.o.toFixed(2)}  高: ${raw.h.toFixed(2)}  低: ${raw.l.toFixed(2)}  收: ${raw.c.toFixed(2)}`;
          },
          title: function (context) {
            const date = context[0].label;
            return `時間: ${date}`;
          },
        },
      },
    },
  }), []);

  // 2. 再根據狀態 early return
  if (!selectedTicker || !stockHistory[selectedTicker]) {
    return <div className="text-gray-600">尚無資料可顯示</div>;
  }
  if (candles.length === 0) {
    return <div>資料載入中．．．</div>;
  }

  return (
    <div className="p-4 border rounded shadow-md bg-white">
      <Chart
        type="candlestick"
        key={selectedTicker}
        data={data}
        options={options}
      />
      <div className="mt-2 text-sm text-gray-700">
        <strong>{selectedTicker}</strong> 技術指標：
        <ul className="mt-1 space-y-0.5">
          <li>SMA(10): <span className="text-blue-600">{indicators.sma?.toFixed(2) || 'N/A'}</span></li>
          <li>EMA(10): <span className="text-green-600">{indicators.ema?.toFixed(2) || 'N/A'}</span></li>
          <li>High-Low(20): <span className="text-purple-600">{indicators.high?.toFixed(2)} / {indicators.low?.toFixed(2)}</span></li>
        </ul>
      </div>
    </div>
  );
};

// ⚛️ 記憶化組件，避免不必要的重繪
export const StockChart = React.memo(StockChartComponent);
