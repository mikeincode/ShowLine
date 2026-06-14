import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Platform } from "react-native";

import { useBanner } from "@/context/BannerContext";
import { useLiveLine } from "@/context/LiveLineContext";
import { useMessages } from "@/context/MessagesContext";
import {
  FANMAIL_INTERVAL_MS,
  LIVE_INTERVAL_MS,
  useSimulation,
} from "@/context/SimulationContext";
import { generateFanMessage, generateLiveQueueItem } from "@/data/simulatorData";
import type { FanMessage, LiveQueueItem } from "@/types";

function makeId(): string {
  return "sim_" + Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function SimulationEngine() {
  const { enabled, frequency, isLoaded } = useSimulation();
  const { addFanMessage } = useMessages();
  const { isLive, addLiveMessage } = useLiveLine();
  const { showBanner } = useBanner();

  useEffect(() => {
    if (!isLoaded || !enabled) return;

    const ms = FANMAIL_INTERVAL_MS[frequency];
    const timer = setInterval(() => {
      const partial = generateFanMessage();
      const msg: FanMessage = { ...partial, id: makeId() };
      addFanMessage(msg);
      showBanner({
        icon: "mail",
        title: "New FanMail",
        message: `${msg.sender}: ${msg.content.slice(0, 60)}${msg.content.length > 60 ? "…" : ""}`,
        color: "#8B5CF6",
        duration: 3000,
      });
    }, ms);

    return () => clearInterval(timer);
  }, [isLoaded, enabled, frequency, addFanMessage, showBanner]);

  useEffect(() => {
    if (!isLoaded || !enabled || !isLive) return;

    const ms = LIVE_INTERVAL_MS[frequency];
    const timer = setInterval(() => {
      const partial = generateLiveQueueItem();
      const item: LiveQueueItem = { ...partial, id: makeId() };
      addLiveMessage(item);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

      showBanner({
        icon: "radio",
        title: "New Live Message",
        message: `${item.sender}: ${item.content}`,
        color: "#EF4444",
        duration: 2500,
      });
    }, ms);

    return () => clearInterval(timer);
  }, [isLoaded, enabled, frequency, isLive, addLiveMessage, showBanner]);

  return null;
}
