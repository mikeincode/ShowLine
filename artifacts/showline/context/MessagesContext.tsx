import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { INITIAL_COLLAB_MESSAGES, INITIAL_FAN_MESSAGES } from "@/data/mockData";
import type { CollabMessage, CollabStatus, FanMessage } from "@/types";

const STORAGE_KEY = "@showline:messages";

interface MessagesState {
  fanMailMessages: FanMessage[];
  collabMessages: CollabMessage[];
}

interface MessagesContextType extends MessagesState {
  pinMessage: (id: string) => void;
  saveMessage: (id: string) => void;
  makeVIP: (id: string) => void;
  blockSender: (id: string) => void;
  moveToCollab: (id: string) => void;
  moveToLiveLine: (id: string) => void;
  replyToMessage: (id: string, reply: string) => void;
  updateCollabStatus: (id: string, status: CollabStatus) => void;
}

const MessagesContext = createContext<MessagesContextType | null>(null);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [fanMailMessages, setFanMail] = useState<FanMessage[]>(INITIAL_FAN_MESSAGES);
  const [collabMessages, setCollab] = useState<CollabMessage[]>(INITIAL_COLLAB_MESSAGES);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const { fanMail, collab } = JSON.parse(raw);
          if (fanMail) setFanMail(fanMail);
          if (collab) setCollab(collab);
        } catch {}
      }
    });
  }, []);

  const persistFanMail = useCallback((msgs: FanMessage[]) => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      const prev = raw ? JSON.parse(raw) : {};
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, fanMail: msgs })).catch(() => {});
    });
  }, []);

  const persistCollab = useCallback((msgs: CollabMessage[]) => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      const prev = raw ? JSON.parse(raw) : {};
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, collab: msgs })).catch(() => {});
    });
  }, []);

  const pinMessage = useCallback(
    (id: string) => {
      setFanMail((prev) => {
        const next = prev.map((m) => (m.id === id ? { ...m, isPinned: !m.isPinned } : m));
        persistFanMail(next);
        return next;
      });
    },
    [persistFanMail]
  );

  const saveMessage = useCallback(
    (id: string) => {
      setFanMail((prev) => {
        const next = prev.map((m) => (m.id === id ? { ...m, isSaved: !m.isSaved } : m));
        persistFanMail(next);
        return next;
      });
    },
    [persistFanMail]
  );

  const makeVIP = useCallback(
    (id: string) => {
      setFanMail((prev) => {
        const next = prev.map((m) => (m.id === id ? { ...m, isVIP: true } : m));
        persistFanMail(next);
        return next;
      });
    },
    [persistFanMail]
  );

  const blockSender = useCallback(
    (id: string) => {
      setFanMail((prev) => {
        const next = prev.map((m) => (m.id === id ? { ...m, isBlocked: true } : m));
        persistFanMail(next);
        return next;
      });
    },
    [persistFanMail]
  );

  const moveToCollab = useCallback(
    (id: string) => {
      setFanMail((prev) => {
        const next = prev.map((m) => (m.id === id ? { ...m, line: "fanmail" as const } : m));
        persistFanMail(next);
        return next;
      });
    },
    [persistFanMail]
  );

  const moveToLiveLine = useCallback(
    (id: string) => {
      setFanMail((prev) => {
        const next = prev.map((m) => (m.id === id ? { ...m, line: "liveline" as const } : m));
        persistFanMail(next);
        return next;
      });
    },
    [persistFanMail]
  );

  const replyToMessage = useCallback(
    (id: string, reply: string) => {
      setFanMail((prev) => {
        const next = prev.map((m) => (m.id === id ? { ...m, reply } : m));
        persistFanMail(next);
        return next;
      });
    },
    [persistFanMail]
  );

  const updateCollabStatus = useCallback(
    (id: string, status: CollabStatus) => {
      setCollab((prev) => {
        const next = prev.map((m) => (m.id === id ? { ...m, status } : m));
        persistCollab(next);
        return next;
      });
    },
    [persistCollab]
  );

  return (
    <MessagesContext.Provider
      value={{
        fanMailMessages,
        collabMessages,
        pinMessage,
        saveMessage,
        makeVIP,
        blockSender,
        moveToCollab,
        moveToLiveLine,
        replyToMessage,
        updateCollabStatus,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used inside MessagesProvider");
  return ctx;
}
