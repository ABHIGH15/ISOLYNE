import { Signal } from '../../domain/Signal';
import { SyncAdapter } from './SyncSignalRepository';
import { Platform } from 'react-native';

export class WebSocketSyncAdapter implements SyncAdapter {
  private ws: WebSocket | null = null;
  private url: string;
  private callback?: (signal: Signal) => void;
  private retryTimeout?: any;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[SYNC] Connected to WebSocket Server');
      };

      this.ws.onmessage = (e) => {
        try {
          // React Native WebSocket messages are often strings
          const dataStr = typeof e.data === 'string' ? e.data : e.data.toString();
          const signal: Signal = JSON.parse(dataStr);
          if (this.callback) {
            this.callback(signal);
          }
        } catch (err) {
          console.warn('[SYNC] Failed to parse incoming signal', err);
        }
      };

      this.ws.onclose = () => {
        console.log('[SYNC] Disconnected from WebSocket Server. Retrying in 3s...');
        this.scheduleReconnect();
      };

      this.ws.onerror = (e) => {
        console.debug('[SYNC] WebSocket error:', e);
        // Will close and trigger reconnect automatically
      };
    } catch (err) {
      console.debug('[SYNC] Error creating WebSocket', err);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
    this.retryTimeout = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  disconnect() {
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendSignal(signal: Signal) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(signal));
      } catch (err) {
        console.debug('[SYNC] Failed to send signal', err);
      }
    } else {
      console.debug('[SYNC] Cannot send signal, WebSocket is not OPEN');
    }
  }

  onSignalReceived(callback: (signal: Signal) => void) {
    this.callback = callback;
  }
}
