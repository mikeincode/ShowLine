import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import type { LiveQueueItem, SessionRecap } from "@/types";

const STORAGE_KEY = "@showline:session_history";

const TOPIC_RULES: [string, string[]][] = [
  ["Episode Ideas", ["episode", "topic", "deep dive", "idea", "cover", "talk about", "next"]],
  ["Creator Journey", ["journey", "advice", "lessons", "started", "career", "tips", "path"]],
  ["Monetization", ["paid", "money", "monetize", "membership", "revenue", "subscribe", "income"]],
  ["Community & Fans", ["community", "fans", "audience", "engagement", "connect", "meetup"]],
  ["Content Strategy", ["content", "strategy", "plan", "post", "schedule", "format", "short form"]],
  ["Collabs & Guests", ["collab", "guest", "partner", "together", "interview", "feature"]],
  ["Tools & Setup", ["tool", "tech", "software", "setup", "equipment", "gear", "mic", "camera"]],
  ["Personal Stories", ["personal", "life", "story", "family", "behind", "struggle", "honest"]],
];

export function extractTopics(items: LiveQueueItem[]): string[] {
  if (!items.length) return [];
  const allText = items.map((m) => m.content.toLowerCase()).join(" ");
  return TOPIC_RULES.filter(([, words]) => words.some((w) => allText.includes(w)))
    .map(([topic]) => topic)
    .slice(0, 6);
}

interface SessionHistoryContextType {
  sessions: SessionRecap[];
  isLoaded: boolean;
  addSession: (recap: SessionRecap) => void;
  clearHistory: () => void;
}

const SessionHistoryContext = createContext<SessionHistoryContextType | null>(null);

export function SessionHistoryProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<SessionRecap[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setSessions(parsed);
        } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  const addSession = useCallback((recap: SessionRecap) => {
    setSessions((prev) => {
      const next = [recap, ...prev].slice(0, 50);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSessions([]);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  return (
    <SessionHistoryContext.Provider value={{ sessions, isLoaded, addSession, clearHistory }}>
      {children}
    </SessionHistoryContext.Provider>
  );
}

export function useSessionHistory() {
  const ctx = useContext(SessionHistoryContext);
  if (!ctx) throw new Error("useSessionHistory must be used inside SessionHistoryProvider");
  return ctx;
}
