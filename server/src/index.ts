import WebSocket, { WebSocketServer } from 'ws';
import { StockManager } from './stock-manager';
import { ServerMessage } from './types';

const PORT = 3001;
const wss = new WebSocketServer({ port: PORT });

const tickers = ['AAPL', 'TSLA', 'MSFT']; // 多股票範例
const stockManager = new StockManager(tickers);

// 客戶端初始連線，回傳歡迎訊息
wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  const welcomeMsg: ServerMessage = {
    type: 'welcome',
    message: 'Connected to multi-stock ticker server',
  };
  ws.send(JSON.stringify(welcomeMsg));

  // 客戶端關閉連線時，顯示斷線訊息
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// 每秒推送所有股票最新價格
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
        client.send(msgStr);
      }
    });
  });
}, 1000);

console.log(`WebSocket server running at ws://localhost:${PORT}`);
