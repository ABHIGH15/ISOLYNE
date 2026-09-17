const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 3000 });

console.log('Isolyne Sync Server starting on ws://0.0.0.0:3000');

wss.on('connection', function connection(ws) {
  console.log('Client connected.');
  ws.on('message', function message(data) {
    const dataStr = data.toString();
    console.log('Received signal:', dataStr);
    // Broadcast to everyone else
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === 1) {
        client.send(data);
      }
    });
  });
  
  ws.on('close', () => console.log('Client disconnected.'));
});
