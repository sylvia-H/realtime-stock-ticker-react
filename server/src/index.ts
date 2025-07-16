import WebSocket, { WebSocketServer } from 'ws';
import { generatePrice } from './price-generator';

const PORT = 3001;
const wss = new WebSocketServer({ port: PORT });

let currentPrice = 100;

function broadcastPrice() {
  currentPrice = generatePrice(currentPrice);
  const data = {
    timestamp: Date.now(),
    price: currentPrice.toFixed(2),
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to stock ticker server',
  }));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

setInterval(broadcastPrice, 1000);
console.log(`WebSocket server running at ws://localhost:${PORT}`);
