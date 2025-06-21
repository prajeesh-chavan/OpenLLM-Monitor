import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import notificationService from "./services/notificationService";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import LogsPage from "./pages/LogsPage";
import LogDetailPage from "./pages/LogDetailPage";
import ReplayPage from "./pages/ReplayPage";
import TestModelsPage from "./pages/TestModelsPage";
import ProvidersPage from "./pages/ProvidersPage";

// Error Pages
import {
  NotFoundErrorPage,
  RateLimitErrorPage,
  ServerErrorPage,
  NetworkErrorPage,
} from "./pages/ErrorPages";

// Components
import ErrorBoundary from "./components/ErrorBoundary";

// Services
import wsService from "./services/websocket";
import { useAppStore } from "./store";

function App() {
  const { setWsConnected, setWsReconnecting, notificationSettings } =
    useAppStore();

  useEffect(() => {
    // Initialize WebSocket connection
    const initializeWebSocket = async () => {
      try {
        await wsService.connect();
        setWsConnected(true);

        // Join logs room for real-time updates
        wsService.joinRoom("logs");
        wsService.joinRoom("providers"); // Set up error handling
        wsService.on("websocket-error", (error) => {
          console.error("WebSocket error:", error);
          notificationService.updateSettings(notificationSettings);
          notificationService.showConnectionStatus(
            "disconnected",
            "Connection error occurred"
          );
        });

        wsService.on("max-reconnect-attempts", () => {
          notificationService.showConnectionStatus(
            "disconnected",
            "Connection lost. Please refresh the page."
          );
          setWsConnected(false);
          setWsReconnecting(false);
        });

        // Handle reconnection events
        wsService.socket?.on("reconnecting", () => {
          setWsReconnecting(true);
          notificationService.showConnectionStatus(
            "reconnecting",
            "Reconnecting..."
          );
        });
        wsService.socket?.on("reconnect", () => {
          setWsReconnecting(false);
          setWsConnected(true);
          notificationService.showConnectionStatus(
            "connected",
            "Reconnected successfully"
          );
        });
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        setWsConnected(false);
        // Don't show error toast on initial connection failure
        // as the app should work without WebSocket
      }
    };

    initializeWebSocket();

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, [setWsConnected, setWsReconnecting]);  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Error Pages */}
          <Route path="/error/429" element={<RateLimitErrorPage />} />
          <Route path="/error/500" element={<ServerErrorPage />} />
          <Route path="/error/network" element={<NetworkErrorPage />} />          {/* Standalone Pages */}
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/providers" element={<ProvidersPage />} />

          {/* Dashboard Routes */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="logs/:id" element={<LogDetailPage />} />
            <Route path="replay" element={<ReplayPage />} />
            <Route path="test" element={<TestModelsPage />} />
          </Route>

          {/* 404 Catch all route */}
          <Route path="*" element={<NotFoundErrorPage />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
