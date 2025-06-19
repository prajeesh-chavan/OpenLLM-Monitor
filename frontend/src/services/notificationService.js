import { toast } from "react-hot-toast";

class NotificationService {
  constructor() {
    this.settings = {
      enabled: true,
      newRequestNotifications: true,
      errorNotifications: true,
      warningNotifications: true,
      soundEnabled: false,
      errorThreshold: 5,
      latencyThreshold: 5000,
      costThreshold: 1.0,
    };

    this.errorCount = 0;
    this.lastErrorTime = null;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  playSound(type = "default") {
    if (!this.settings.soundEnabled) return;

    try {
      // Create audio context for notification sounds
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different sounds for different notification types
      switch (type) {
        case "success":
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(
            1000,
            audioContext.currentTime + 0.1
          );
          break;
        case "error":
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(
            300,
            audioContext.currentTime + 0.2
          );
          break;
        case "warning":
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          break;
        default:
          oscillator.frequency.setValueAtTime(700, audioContext.currentTime);
      }

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn("Could not play notification sound:", error);
    }
  }

  // New request notification
  showNewRequest(log) {
    if (!this.settings.enabled || !this.settings.newRequestNotifications)
      return;

    const message = `New ${log.provider} request completed`;
    const statusIcon =
      log.status === "success" ? "✅" : log.status === "error" ? "❌" : "⚠️";

    toast.success(`${statusIcon} ${message}`, {
      duration: 3000,
      icon: "📥",
    });

    this.playSound(log.status);
  }

  // Error notification
  showError(error, log = null) {
    if (!this.settings.enabled || !this.settings.errorNotifications) return;

    this.errorCount++;
    this.lastErrorTime = Date.now();

    // Only show notification if error count exceeds threshold
    if (this.errorCount >= this.settings.errorThreshold) {
      const message = log
        ? `Request failed: ${error.message || error}`
        : `System error: ${error.message || error}`;

      toast.error(message, {
        duration: 5000,
        icon: "🚨",
      });

      this.playSound("error");
      this.errorCount = 0; // Reset counter after showing notification
    }
  }

  // High latency warning
  showHighLatency(latency, log) {
    if (!this.settings.enabled || !this.settings.warningNotifications) return;
    if (latency < this.settings.latencyThreshold) return;

    toast(`⚡ High latency detected: ${Math.round(latency)}ms`, {
      duration: 4000,
      icon: "⏱️",
      style: {
        background: "#f59e0b",
        color: "#fff",
      },
    });

    this.playSound("warning");
  }

  // High cost warning
  showHighCost(cost, log) {
    if (!this.settings.enabled || !this.settings.warningNotifications) return;
    if (!cost || cost.totalCost < this.settings.costThreshold) return;

    toast(`💰 High cost request: $${cost.totalCost.toFixed(4)}`, {
      duration: 4000,
      icon: "💸",
      style: {
        background: "#dc2626",
        color: "#fff",
      },
    });

    this.playSound("warning");
  }

  // Connection status notifications
  showConnectionStatus(status, message) {
    if (!this.settings.enabled) return;

    switch (status) {
      case "connecting":
        toast.loading(message || "Connecting...", { id: "connection" });
        break;
      case "connected":
        toast.success(message || "Connected successfully", {
          id: "connection",
          icon: "🔗",
        });
        this.playSound("success");
        break;
      case "disconnected":
        toast.error(message || "Connection lost", {
          id: "connection",
          icon: "📡",
        });
        this.playSound("error");
        break;
      case "reconnecting":
        toast.loading(message || "Reconnecting...", { id: "connection" });
        break;
    }
  }

  // Provider test notifications
  showProviderTest(provider, success, message) {
    if (!this.settings.enabled) return;

    if (success) {
      toast.success(`${provider} connection successful`, {
        icon: "✅",
        duration: 3000,
      });
      this.playSound("success");
    } else {
      toast.error(`${provider} connection failed: ${message}`, {
        icon: "❌",
        duration: 5000,
      });
      this.playSound("error");
    }
  }

  // Replay completion notification
  showReplayComplete(similarity) {
    if (!this.settings.enabled) return;

    const similarityPercent = Math.round(similarity);
    const icon =
      similarityPercent > 70 ? "🎯" : similarityPercent > 40 ? "📊" : "📈";

    toast.success(`Replay completed (${similarityPercent}% similarity)`, {
      icon,
      duration: 3000,
    });

    this.playSound("success");
  }

  // Settings saved notification
  showSettingsSaved() {
    if (!this.settings.enabled) return;

    toast.success("Settings saved successfully", {
      icon: "⚙️",
      duration: 2000,
    });
  }

  // Reset error counter (call this periodically or on successful requests)
  resetErrorCount() {
    // Reset error count if last error was more than 5 minutes ago
    if (this.lastErrorTime && Date.now() - this.lastErrorTime > 5 * 60 * 1000) {
      this.errorCount = 0;
    }
  }

  // Clear all notifications
  clearAll() {
    toast.dismiss();
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
