import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import { useBanner } from "@/context/BannerContext";
import { useLiveLine } from "@/context/LiveLineContext";
import { useMessages } from "@/context/MessagesContext";
import {
  FANMAIL_INTERVAL_MS,
  LIVE_INTERVAL_MS,
  useSimulation,
} from "@/context/SimulationContext";
import { useShowLine } from "@/context/ShowLineContext";
import { generateFanMessage, generateLiveQueueItem } from "@/data/simulatorData";
import type { FanMessage, LiveQueueItem } from "@/types";

const MAX_SIMULATED_FANMAIL = 60;

function makeId(): string {
  return "sim_" + Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function SimulationEngine() {
  const { enabled, frequency, isLoaded } = useSimulation();
  const { onboardingCompleted } = useShowLine();
  const { addFanMessage, fanMailMessages } = useMessages();
  const { isLive, addLiveMessage } = useLiveLine();
  const { showBanner } = useBanner();

  const fanMailCountRef = useRef(fanMailMessages.length);
  fanMailCountRef.current = fanMailMessages.length;

  useEffect(() => {
    if (!isLoaded || !enabled || !onboardingCompleted) return;

    const ms = FANMAIL_INTERVAL_MS[frequency];
    const timer = setInterval(() => {
      if (fanMailCountRef.current >= MAX_SIMULATED_FANMAIL) return;
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
  }, [isLoaded, enabled, frequency, onboardingCompleted, addFanMessage, showBanner]);

  useEffect(() => {
    if (!isLoaded || !enabled || !onboardingCompleted || !isLive) return;

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
  }, [isLoaded, enabled, frequency, onboardingCompleted, isLive, addLiveMessage, showBanner]);

  return null;
}
