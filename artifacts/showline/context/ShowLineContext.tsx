import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { INITIAL_BLOCKED, INITIAL_VIP_CONTACTS } from "@/data/mockData";
import type {
  AutoReplies,
  BlockedContact,
  CreatorType,
  LineStatuses,
  LineStatus,
  UseCase,
  VIPContact,
} from "@/types";

const STORAGE_KEY = "@showline:app_state";

const DEFAULT_STATUSES: LineStatuses = {
  fanmail: "Open",
  liveline: "Closed",
  backstage: "VIP Only",
  collab: "Collect Only",
};

const DEFAULT_AUTO_REPLIES: AutoReplies = {
  fanmail:
    "Thanks for reaching out! I read every message and I'll get back to you when I can. Stay awesome 🎙️",
  livelineOpen:
    "Thanks for joining the live! I'm taking questions now — keep them coming.",
  livelineClosed:
    "The live line is currently closed. Drop your message and I'll see it before the next show!",
  backstage:
    "Hey VIP! You're in the Backstage Line. I see your messages personally and respond as soon as I can. Thanks for being a superfan.",
  collab:
    "Thanks for your interest in collaborating! I review all business inquiries personally. If it's a good fit, I'll be in touch within 5-7 business days.",
};

interface ShowLineState {
  isLoaded: boolean;
  onboardingCompleted: boolean;
  creatorType: CreatorType | null;
  useCases: UseCase[];
  lineStatuses: LineStatuses;
  autoReplies: AutoReplies;
  vipContacts: VIPContact[];
  blockedContacts: BlockedContact[];
}

interface ShowLineContextType extends ShowLineState {
  completeOnboarding: (creatorType: CreatorType, useCases: UseCase[]) => Promise<void>;
  updateLineStatus: (line: keyof LineStatuses, status: LineStatus) => void;
  updateAutoReply: (key: keyof AutoReplies, text: string) => void;
  addVIP: (contact: VIPContact) => void;
  removeVIP: (id: string) => void;
  addBlocked: (contact: BlockedContact) => void;
  removeBlocked: (id: string) => void;
}

const ShowLineContext = createContext<ShowLineContextType | null>(null);

export function ShowLineProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ShowLineState>({
    isLoaded: false,
    onboardingCompleted: false,
    creatorType: null,
    useCases: [],
    lineStatuses: DEFAULT_STATUSES,
    autoReplies: DEFAULT_AUTO_REPLIES,
    vipContacts: INITIAL_VIP_CONTACTS,
    blockedContacts: INITIAL_BLOCKED,
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          setState((s) => ({ ...s, ...saved, isLoaded: true }));
        } catch {
          setState((s) => ({ ...s, isLoaded: true }));
        }
      } else {
        setState((s) => ({ ...s, isLoaded: true }));
      }
    });
  }, []);

  const persist = useCallback((next: Partial<ShowLineState>) => {
    setState((prev) => {
      const updated = { ...prev, ...next };
      const { isLoaded: _l, ...toSave } = updated;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
      return updated;
    });
  }, []);

  const completeOnboarding = useCallback(
    async (creatorType: CreatorType, useCases: UseCase[]) => {
      persist({ onboardingCompleted: true, creatorType, useCases });
    },
    [persist]
  );

  const updateLineStatus = useCallback(
    (line: keyof LineStatuses, status: LineStatus) => {
      setState((prev) => {
        const updated = { ...prev, lineStatuses: { ...prev.lineStatuses, [line]: status } };
        const { isLoaded: _l, ...toSave } = updated;
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
        return updated;
      });
    },
    []
  );

  const updateAutoReply = useCallback(
    (key: keyof AutoReplies, text: string) => {
      setState((prev) => {
        const updated = { ...prev, autoReplies: { ...prev.autoReplies, [key]: text } };
        const { isLoaded: _l, ...toSave } = updated;
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
        return updated;
      });
    },
    []
  );

  const addVIP = useCallback((contact: VIPContact) => {
    setState((prev) => {
      const updated = { ...prev, vipContacts: [...prev.vipContacts, contact] };
      const { isLoaded: _l, ...toSave } = updated;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
      return updated;
    });
  }, []);

  const removeVIP = useCallback((id: string) => {
    setState((prev) => {
      const updated = { ...prev, vipContacts: prev.vipContacts.filter((v) => v.id !== id) };
      const { isLoaded: _l, ...toSave } = updated;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
      return updated;
    });
  }, []);

  const addBlocked = useCallback((contact: BlockedContact) => {
    setState((prev) => {
      const updated = { ...prev, blockedContacts: [...prev.blockedContacts, contact] };
      const { isLoaded: _l, ...toSave } = updated;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
      return updated;
    });
  }, []);

  const removeBlocked = useCallback((id: string) => {
    setState((prev) => {
      const updated = {
        ...prev,
        blockedContacts: prev.blockedContacts.filter((b) => b.id !== id),
      };
      const { isLoaded: _l, ...toSave } = updated;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
      return updated;
    });
  }, []);

  return (
    <ShowLineContext.Provider
      value={{
        ...state,
        completeOnboarding,
        updateLineStatus,
        updateAutoReply,
        addVIP,
        removeVIP,
        addBlocked,
        removeBlocked,
      }}
    >
      {children}
    </ShowLineContext.Provider>
  );
}

export function useShowLine() {
  const ctx = useContext(ShowLineContext);
  if (!ctx) throw new Error("useShowLine must be used inside ShowLineProvider");
  return ctx;
}
