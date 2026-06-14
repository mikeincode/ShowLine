import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export interface BannerOptions {
  icon: string;
  title: string;
  message?: string;
  color?: string;
  duration?: number;
}

interface BannerContextType {
  current: BannerOptions | null;
  showBanner: (opts: BannerOptions) => void;
  dismissCurrent: () => void;
}

const BannerContext = createContext<BannerContextType | null>(null);

export function BannerProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<BannerOptions[]>([]);
  const [current, setCurrent] = useState<BannerOptions | null>(null);
  const activeRef = useRef(false);

  const showBanner = useCallback((opts: BannerOptions) => {
    setQueue((prev) => [...prev, opts]);
  }, []);

  const dismissCurrent = useCallback(() => {
    setCurrent(null);
    activeRef.current = false;
  }, []);

  useEffect(() => {
    if (!activeRef.current && queue.length > 0) {
      activeRef.current = true;
      const [next, ...rest] = queue;
      setQueue(rest);
      setCurrent(next);
    }
  }, [queue]);

  return (
    <BannerContext.Provider value={{ current, showBanner, dismissCurrent }}>
      {children}
    </BannerContext.Provider>
  );
}

export function useBanner() {
  const ctx = useContext(BannerContext);
  if (!ctx) throw new Error("useBanner must be used inside BannerProvider");
  return ctx;
}
