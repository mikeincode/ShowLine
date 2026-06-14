import React, { createContext, useCallback, useContext, useState } from "react";

import { INITIAL_LIVE_QUEUE } from "@/data/mockData";
import type { LiveQueueItem, LiveSessionSettings } from "@/types";

const DEFAULT_SETTINGS: LiveSessionSettings = {
  acceptTexts: true,
  acceptCallRequests: false,
  slowMode: false,
  autoReply: true,
  showQRCode: false,
};

interface LiveLineState {
  isLive: boolean;
  sessionStart: string | null;
  liveQueue: LiveQueueItem[];
  settings: LiveSessionSettings;
  sessionVIPAdded: number;
  sessionBlockedCount: number;
}

interface LiveLineContextType extends LiveLineState {
  startSession: () => void;
  endSession: () => void;
  toggleSetting: (key: keyof LiveSessionSettings) => void;
  pinQueueItem: (id: string) => void;
  addToQueue: (id: string) => void;
  markAnswered: (id: string) => void;
  blockFromLive: (id: string) => void;
  makeVIPFromLive: (id: string) => void;
  addLiveMessage: (msg: LiveQueueItem) => void;
}

const LiveLineContext = createContext<LiveLineContextType | null>(null);

export function LiveLineProvider({ children }: { children: React.ReactNode }) {
  const [isLive, setIsLive] = useState(false);
  const [sessionStart, setSessionStart] = useState<string | null>(null);
  const [liveQueue, setLiveQueue] = useState<LiveQueueItem[]>(INITIAL_LIVE_QUEUE);
  const [settings, setSettings] = useState<LiveSessionSettings>(DEFAULT_SETTINGS);
  const [sessionVIPAdded, setSessionVIPAdded] = useState(0);
  const [sessionBlockedCount, setSessionBlockedCount] = useState(0);

  const startSession = useCallback(() => {
    setIsLive(true);
    setSessionStart(new Date().toISOString());
    setSessionVIPAdded(0);
    setSessionBlockedCount(0);
  }, []);

  const endSession = useCallback(() => {
    setIsLive(false);
    setSessionStart(null);
    setSessionVIPAdded(0);
    setSessionBlockedCount(0);
    setLiveQueue(
      INITIAL_LIVE_QUEUE.map((m) => ({ ...m, isAnswered: false, inQueue: false, isPinned: false }))
    );
  }, []);

  const toggleSetting = useCallback((key: keyof LiveSessionSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const pinQueueItem = useCallback((id: string) => {
    setLiveQueue((prev) => prev.map((m) => (m.id === id ? { ...m, isPinned: !m.isPinned } : m)));
  }, []);

  const addToQueue = useCallback((id: string) => {
    setLiveQueue((prev) => prev.map((m) => (m.id === id ? { ...m, inQueue: !m.inQueue } : m)));
  }, []);

  const markAnswered = useCallback((id: string) => {
    setLiveQueue((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isAnswered: true, inQueue: false } : m))
    );
  }, []);

  const blockFromLive = useCallback((id: string) => {
    setLiveQueue((prev) => prev.filter((m) => m.id !== id));
    setSessionBlockedCount((n) => n + 1);
  }, []);

  const makeVIPFromLive = useCallback((id: string) => {
    setLiveQueue((prev) => prev.map((m) => (m.id === id ? { ...m, isVIP: true } : m)));
    setSessionVIPAdded((n) => n + 1);
  }, []);

  const addLiveMessage = useCallback((msg: LiveQueueItem) => {
    setLiveQueue((prev) => [msg, ...prev]);
  }, []);

  return (
    <LiveLineContext.Provider
      value={{
        isLive,
        sessionStart,
        liveQueue,
        settings,
        sessionVIPAdded,
        sessionBlockedCount,
        startSession,
        endSession,
        toggleSetting,
        pinQueueItem,
        addToQueue,
        markAnswered,
        blockFromLive,
        makeVIPFromLive,
        addLiveMessage,
      }}
    >
      {children}
    </LiveLineContext.Provider>
  );
}

export function useLiveLine() {
  const ctx = useContext(LiveLineContext);
  if (!ctx) throw new Error("useLiveLine must be used inside LiveLineProvider");
  return ctx;
}
