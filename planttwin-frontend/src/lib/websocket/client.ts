export class TelemetryWebSocketClient {
  private socket: WebSocket | null = null;
  private channel: string;
  private listeners: Set<(data: any) => void> = new Set();
  private reconnectInterval: number = 3000;
  private isExplicitClose: boolean = false;

  constructor(channel: string = 'global') {
    this.channel = channel;
  }

  public connect() {
    const wsUrl = `ws://localhost:8000/api/v1/telemetry/ws/${this.channel}`;
    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log(`Connected to Telemetry WebSocket [Channel: ${this.channel}]`);
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.listeners.forEach((listener) => listener(parsed));
        } catch (err) {
          console.warn('Failed to parse WebSocket message:', event.data);
        }
      };

      this.socket.onclose = () => {
        if (!this.isExplicitClose) {
          console.log(`WebSocket closed. Reconnecting in ${this.reconnectInterval}ms...`);
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      this.socket.onerror = (error) => {
        console.warn('WebSocket error encountered:', error);
      };
    } catch (err) {
      console.warn('Could not establish WebSocket connection:', err);
    }
  }

  public subscribe(callback: (data: any) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public disconnect() {
    this.isExplicitClose = true;
    if (this.socket) {
      this.socket.close();
    }
  }
}
