

type NotificationCallback = (notification: any) => void;
type BotStateCallback = (bots: any[]) => void;

class NotificationSocketService {
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private callbacks: NotificationCallback[] = [];
  private botStateCallbacks: BotStateCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  connect(token: string) {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    
    this.token = token;
    
    // Construct dynamic websocket URL based on window.location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/notifications/?token=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('Notification WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.ws_type === 'bot_state') {
          this.botStateCallbacks.forEach(cb => cb(payload.data));
        } else {
          this.callbacks.forEach(cb => cb(payload));
        }
      } catch (e) {
        console.error('Error parsing WebSocket data', e);
      }
    };

    this.socket.onclose = () => {
      console.log('Notification WebSocket disconnected');
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.token) {
      this.reconnectAttempts++;
      const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      
      if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
      
      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect notification websocket (Attempt ${this.reconnectAttempts})...`);
        this.connect(this.token!);
      }, timeout);
    }
  }

  disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.callbacks = [];
    this.botStateCallbacks = [];
  }

  onNotification(callback: NotificationCallback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  onBotStateUpdate(callback: BotStateCallback) {
    this.botStateCallbacks.push(callback);
    return () => {
      this.botStateCallbacks = this.botStateCallbacks.filter(cb => cb !== callback);
    };
  }
}

export const notificationSocket = new NotificationSocketService();
