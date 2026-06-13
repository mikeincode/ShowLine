import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import type { LineStatus } from "@/types";

interface StatusPillProps {
  status: LineStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<LineStatus, { bg: string; text: string; dot?: string }> = {
  "Open":         { bg: "#0E3320", text: "#10B981", dot: "#10B981" },
  "Closed":       { bg: "#1E1E2A", text: "#6B7280" },
  "Live Now":     { bg: "#2D0A0A", text: "#EF4444", dot: "#EF4444" },
  "VIP Only":     { bg: "#2D2004", text: "#F59E0B", dot: "#F59E0B" },
  "Collect Only": { bg: "#0A1A30", text: "#3B82F6", dot: "#3B82F6" },
  "Quiet Hours":  { bg: "#1A1A28", text: "#8B5CF6" },
};

export function StatusPill({ status, size = "md" }: StatusPillProps) {
  const config = STATUS_CONFIG[status];
  const pulse = useRef(new Animated.Value(1)).current;
  const isLive = status === "Live Now";

  useEffect(() => {
    if (!isLive) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isLive, pulse]);

  const isSmall = size === "sm";

  return (
    <View style={[styles.pill, { backgroundColor: config.bg }, isSmall && styles.pillSm]}>
      {config.dot && (
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: config.dot },
            isLive && { opacity: pulse },
          ]}
        />
      )}
      <Text style={[styles.text, { color: config.text }, isSmall && styles.textSm]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    gap: 6,
    alignSelf: "flex-start",
  },
  pillSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 11,
  },
});
