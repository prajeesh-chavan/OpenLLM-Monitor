import { io } from "socket.io-client";

/**
 * WebSocket service for real-time updates
 */
class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }
  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.socket?.connected) {
      return Promise.resolve();
    } // Use the configured WebSocket URL or fall back to current host
    const serverUrl = import.meta.env.VITE_WS_URL || window.location.origin;
    console.log("🔌 Connecting to WebSocket server:", serverUrl);

    this.socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true,
      autoConnect: true,
    });

    return new Promise((resolve, reject) => {
      // Set a timeout for connection
      const connectionTimeout = setTimeout(() => {
        console.warn("⚠️ WebSocket connection timeout, resolving anyway");
        resolve(); // Resolve even on timeout so app doesn't break
      }, 10000);

      this.socket.on("connect", () => {
        clearTimeout(connectionTimeout);
        console.log("✅ Connected to WebSocket server");
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ WebSocket connection error:", error);
        // Don't reject immediately, let the app continue to work
        if (this.reconnectAttempts === 0) {
          clearTimeout(connectionTimeout);
          resolve(); // Allow app to work without WebSocket
        }
      });

      this.socket.on("disconnect", (reason) => {
        console.log("🔌 Disconnected from WebSocket server:", reason);

        // Attempt reconnection for certain disconnect reasons
        if (reason === "io server disconnect") {
          // Server initiated disconnect, don't reconnect automatically
          return;
        }

        this.handleReconnection();
      });

      this.socket.on("reconnect", (attemptNumber) => {
        console.log(
          `🔄 Reconnected to WebSocket server (attempt ${attemptNumber})`
        );
        this.reconnectAttempts = 0;
      });

      this.socket.on("reconnect_error", (error) => {
        console.error("❌ WebSocket reconnection error:", error);
      });

      this.socket.on("reconnect_failed", () => {
        console.error(
          "❌ WebSocket reconnection failed after maximum attempts"
        );
      });

      // Set up default event handlers
      this.setupDefaultHandlers();
    });
  }

  /**
   * Set up default event handlers
   */
  setupDefaultHandlers() {
    this.socket.on("connected", (data) => {
      console.log("📡 WebSocket connected:", data.message);
    });

    this.socket.on("new-log", (data) => {
      this.emit("new-log", data);
    });

    this.socket.on("provider-status", (data) => {
      this.emit("provider-status", data);
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
      this.emit("websocket-error", error);
    });
  }

  /**
   * Handle reconnection logic
   */
  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Maximum reconnection attempts reached");
      this.emit("max-reconnect-attempts");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
    );

    setTimeout(() => {
      if (!this.socket?.connected) {
        this.socket?.connect();
      }
    }, delay);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  /**
   * Join a room for targeted updates
   * @param {string} room - Room name
   */
  joinRoom(room) {
    if (this.socket?.connected) {
      this.socket.emit(`join-${room}`);
      console.log(`📥 Joined room: ${room}`);
    }
  }

  /**
   * Leave a room
   * @param {string} room - Room name
   */
  leaveRoom(room) {
    if (this.socket?.connected) {
      this.socket.emit(`leave-${room}`);
      console.log(`📤 Left room: ${room}`);
    }
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in WebSocket event listener for ${event}:`,
            error
          );
        }
      });
    }
  }

  /**
   * Send a message to the server
   * @param {string} event - Event name
   * @param {*} data - Data to send
   */
  send(event, data = {}) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Cannot send message: WebSocket not connected");
    }
  }

  /**
   * Get connection status
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Get connection info
   * @returns {Object} Connection information
   */
  getConnectionInfo() {
    return {
      connected: this.isConnected(),
      id: this.socket?.id,
      transport: this.socket?.io?.engine?.transport?.name,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    };
  }
}

// Export singleton instance
export const wsService = new WebSocketService();
export default wsService;
