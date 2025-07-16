// src/components/StockChart.tsx
import React from 'react';
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

export const StockChart: React.FC<StockChartProps> = ({ stockHistory, selectedTicker }) => {
  if (!selectedTicker || !stockHistory[selectedTicker]) {
    return <div className="text-gray-600">尚無資料可顯示</div>;
  }

  const raw = stockHistory[selectedTicker];
  const candles: CandlestickDataPoint[] = transformToCandlestick(raw, 5);

  if (candles.length === 0) {
    return <div>資料載入中．．．</div>;
  }

  const data: ChartData<'candlestick', CandlestickDataPoint[], unknown> = {
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
  };

  const options: ChartOptions<'candlestick'> = {
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
  };

  return (
    <div className="p-4 border rounded shadow-md bg-white">
      <Chart
        type="candlestick"
        key={selectedTicker} // 強制重新 render
        data={data}
        options={options}
      />
    </div>
  );
};
