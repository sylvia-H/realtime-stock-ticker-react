import WebSocket, { WebSocketServer } from 'ws';
import { StockManager } from './stock-manager';
import { ServerMessage } from './types';

const PORT = 3001;
const wss = new WebSocketServer({ port: PORT });

const tickers = ['AAPL', 'TSLA', 'AMZN', 'GOOG', 'MSFT', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC','ADBE']; // 多股票範例
const stockManager = new StockManager(tickers);

// 客戶端初始連線，回傳歡迎訊息
wss.on('connection', (ws: WebSocket, req) => {
  console.log('[Server] Client connected');

  // 📌 若 URL 帶有 since 參數，處理補發
  const url = new URL(req.url ?? '', `ws://${req.headers.host}`);
  const sinceParam = url.searchParams.get('since');
  if (sinceParam) {
    const since = parseInt(sinceParam, 10);
    if (!isNaN(since)) {
      const missed = stockManager.getUpdatesSince(since);
      if (missed.length > 0) {
        const resyncMsg: ServerMessage = {
          type: 'resync',
          data: missed,
        };
        ws.send(JSON.stringify(resyncMsg));
        console.log(`[Server] Resent ${missed.length} updates since ${since}`);
      }
    }
  }

  // 📌 初始歡迎訊息
  const welcomeMsg: ServerMessage = {
    type: 'welcome',
    message: 'Connected to multi-stock ticker server',
  };
  ws.send(JSON.stringify(welcomeMsg));

  // 📌 客戶端主動請求補發
  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.type === 'resync') {
        const since: number = parsed.since;
        if (typeof since === 'number' && !isNaN(since)) {
          const missedUpdates = stockManager.getUpdatesSince(since);
          const resyncMsg: ServerMessage = {
            type: 'resync',
            data: missedUpdates,
          };
          ws.send(JSON.stringify(resyncMsg));
          console.log(`[Server] Resent ${missedUpdates.length} updates via client msg since ${since}`);
        }
      }
    } catch (e) {
      console.error('Invalid message from client:', e);
    }
  });

  // 客戶端關閉連線時，顯示斷線訊息
  ws.on('close', () => {
    console.log('[Server] Client disconnected');
  });
});

// 每 300 毫秒推送所有股票最新價格
setInterval(() => {
  const updates = stockManager.updatePrices();

  updates.forEach((update) => {
    const msg: ServerMessage = {
      type: 'price-update',
      data: update,
    };
    const msgStr = JSON.stringify(msg);

    // 將新的價格資料透過 client.send() 廣播給所有連線中的客戶端
    wss.clients.forEach((client) => {
      // 可避免連線未就緒或已關閉時送資料
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(msgStr);
        } catch (e) {
          console.error('[Server] Failed to send message to client', e);
        }
      } else {
        console.log(`[Server] Skipping client with state: ${client.readyState}`);
      }
    });

  });
}, 300);

console.log(`WebSocket server running at ws://localhost:${PORT}`);
