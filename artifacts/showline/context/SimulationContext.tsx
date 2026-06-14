import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type SimFrequency = "low" | "normal" | "high";

const STORAGE_KEY = "@showline:simulation";

export const FANMAIL_INTERVAL_MS: Record<SimFrequency, number> = {
  low: 45_000,
  normal: 20_000,
  high: 8_000,
};

export const LIVE_INTERVAL_MS: Record<SimFrequency, number> = {
  low: 20_000,
  normal: 8_000,
  high: 4_000,
};

interface SimulationState {
  isLoaded: boolean;
  enabled: boolean;
  frequency: SimFrequency;
}

interface SimulationContextType extends SimulationState {
  setEnabled: (v: boolean) => void;
  setFrequency: (v: SimFrequency) => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SimulationState>({
    isLoaded: false,
    enabled: true,
    frequency: "normal",
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          setState({ ...saved, isLoaded: true });
        } catch {
          setState((s) => ({ ...s, isLoaded: true }));
        }
      } else {
        setState((s) => ({ ...s, isLoaded: true }));
      }
    });
  }, []);

  const persist = useCallback((patch: Partial<SimulationState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      const { isLoaded: _l, ...toSave } = next;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
      return next;
    });
  }, []);

  const setEnabled = useCallback((v: boolean) => persist({ enabled: v }), [persist]);
  const setFrequency = useCallback((v: SimFrequency) => persist({ frequency: v }), [persist]);

  return (
    <SimulationContext.Provider value={{ ...state, setEnabled, setFrequency }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used inside SimulationProvider");
  return ctx;
}
