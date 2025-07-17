// src/components/WebSocketProvider.tsx
import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ServerMessage, StockPriceUpdate } from '../types';
import { StocksContext, type ConnectionStatus, type StocksContextValue } from '../contexts/StocksContext';

interface StocksProviderProps {
  children: ReactNode;
  onResync?: (updates: StockPriceUpdate[]) => void;
}

const WS_URL = 'ws://localhost:3001';
const RECONNECT_INTERVAL = 5000; // 毫秒

export const StocksProvider: React.FC<StocksProviderProps> = ({ children, onResync }) => {
  const [stockData, setStockData] = useState<Record<string, StockPriceUpdate>>({});
  const [previousData, setPreviousData] = useState<Record<string, StockPriceUpdate>>({});
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting'); // ← 初始為連線中

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stockDataRef = useRef<Record<string, StockPriceUpdate>>({});
  // 自動斷線定時器
  const autoDisconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  /** 📌 同步 stockDataRef */
  useEffect(() => {
    stockDataRef.current = stockData;
  }, [stockData]);

  /** 📌 計算目前 stockData 中最新的 timestamp */
  const getLastTimestamp = (): number | null => {
    const timestamps = Object.values(stockData)
      .map((d) => new Date(d.timestamp).getTime())
      .filter((t) => !isNaN(t));
    return timestamps.length > 0 ? Math.max(...timestamps) : null;
  };

  /** 📌 封裝資料更新邏輯 applyPriceUpdate */
  function applyPriceUpdate(update: StockPriceUpdate) {
    // 先取目前 stockData 的舊值，這裡不在 setStockData 裡做
    // const current = stockData[update.ticker];
    const current = stockDataRef.current[update.ticker];
    
    if (current) {
      setPreviousData((oldPrev) => ({
        ...oldPrev,
        [update.ticker]: { ...current }, // 深拷貝快照
      }));
    }

    setStockData((prev) => ({
      ...prev,
      [update.ticker]: update,
    }));

    // 更新 lastTimestampRef
    lastTimestampRef.current = update.timestamp;
    console.log(`[${update.ticker}] prev:`, current?.price, '-> new:', update.price);
  }


  /** 📌 建立 WebSocket 並處理重連與補發邏輯 */
  const connect = () => {
    // 關閉舊的連線（如有）
    if (wsRef.current) {
      try {
        console.log('❗️ 確保斷開連線');
        wsRef.current.onmessage = null;
        wsRef.current.close(); // 確保強制關閉
        wsRef.current = null;
      } catch (e) {
        console.warn('Error closing previous socket:', e);
      }
    }

    const lastReceived = getLastTimestamp();
    const url = lastReceived ? `${WS_URL}?since=${lastReceived}` : WS_URL;

    const ws = new WebSocket(url);
    setConnectionStatus('connecting');

    // 先設置所有事件處理器
    ws.onopen = () => {
      setConnectionStatus('connected');
      console.log('[WebSocket] Connected');

      // 🔄 連線成功後，補發 request（resync）
      const lastTimestamp = lastTimestampRef.current;
      if (lastTimestamp) {
        ws.send(
          JSON.stringify({
            type: 'resync',
            since: lastTimestamp - 1, // 讓補發包含邊界 tick
          })
        );
        console.log('[WebSocket] Sent resync since:', lastTimestamp);
      }

      // 🔄 測試用：每 10 秒自動關閉連線，模擬中斷
      if (autoDisconnectTimer.current) clearTimeout(autoDisconnectTimer.current);
      autoDisconnectTimer.current = setTimeout(() => {
        console.warn('[WebSocket] Auto-disconnect after 10 seconds');
        ws.close(); // 故意關閉，會觸發 onclose → 補發
      }, 10000);
    };

    ws.onclose = () => {
      console.warn('[WebSocket] Disconnected, will retry in 3s');
      // ❗️ 確保斷開連線
      if (wsRef.current === ws) {
        try {
          console.log('❗️ 確保斷開連線');
          wsRef.current.onmessage = null;
          wsRef.current.close();
          wsRef.current = null;
        } catch (e) {
          console.warn('Error while closing socket:', e);
        }
        wsRef.current = null;
      }
      setConnectionStatus('disconnected');
      scheduleReconnect();
    };

    ws.onerror = (err) => {
      console.error('[WebSocket] Error', err);
      ws.close(); // 自動觸發 onclose → 重連
      wsRef.current = null;
    };

    ws.onmessage = (event) => {
      // 不處理非 wsRef.current 且連線非 WebSocket.OPEN 的資料
      if (wsRef.current !== ws || ws.readyState !== WebSocket.OPEN) return;
      
      const msg: ServerMessage = JSON.parse(event.data);
      if (msg.type === 'price-update') {
        applyPriceUpdate(msg.data);
      }

      if (msg.type === 'resync') {
        console.log(`[WebSocket] Received ${msg.data.length} resync ticks`);
        // ✅ 呼叫外部 callback 傳出補發資料
        if (typeof onResync === 'function') {
          onResync(msg.data);
        }

        // ✅ 同步更新目前狀態資料
        msg.data.forEach((update) => {
          applyPriceUpdate(update);
        });
      }
    };

    // 所有事件處理器設置完成後，才設置 wsRef.current
    wsRef.current = ws;
  };

  /** 📌 排程重連 */
  const scheduleReconnect = () => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    setConnectionStatus('reconnecting');
    reconnectTimer.current = setTimeout(() => {
      connect();
    }, RECONNECT_INTERVAL);
  };

  /** 📌 初始化與清理 */
  useEffect(() => {
    stockDataRef.current = stockData;
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.onmessage = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (autoDisconnectTimer.current) {
        clearTimeout(autoDisconnectTimer.current);
      }
    };
  }, []); // 初始只執行一次

  const value: StocksContextValue = { stockData, previousData, connectionStatus };

  return (
    <StocksContext.Provider value={value}>
      {children}
    </StocksContext.Provider>
  )
};
