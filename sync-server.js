const { WebSocketServer } = require('ws');

const port = process.env.PORT || 8080;
const wss = new WebSocketServer({ port });

console.log(`[ISOLYNE SYNC] Local WebSocket server running on ws://localhost:${port}`);

wss.on('connection', function connection(ws) {
  console.log('[ISOLYNE SYNC] Client connected');
  
  ws.on('message', function message(data) {
    try {
      const parsed = JSON.parse(data);
      console.log(`[ISOLYNE SYNC] Received signal from ${parsed.actorId || 'Unknown'} (type: ${parsed.type})`);
      
      // Broadcast to all other clients
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === 1) { // 1 = OPEN
          client.send(data);
        }
      });
    } catch (e) {
      console.error('[ISOLYNE SYNC] Failed to parse message:', e);
    }
  });

  ws.on('close', () => {
    console.log('[ISOLYNE SYNC] Client disconnected');
  });
});
