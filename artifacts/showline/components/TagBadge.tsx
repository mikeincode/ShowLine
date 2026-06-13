import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { CollabTag, MessageTag } from "@/types";

type AnyTag = MessageTag | CollabTag;

const TAG_COLORS: Record<AnyTag, { bg: string; text: string }> = {
  "Question":    { bg: "#0A1A30", text: "#60A5FA" },
  "Topic Idea":  { bg: "#0F1A0A", text: "#4ADE80" },
  "Story":       { bg: "#1A0A1A", text: "#C084FC" },
  "Fan Love":    { bg: "#2D0A1A", text: "#FB7185" },
  "Collab":      { bg: "#0A1A1A", text: "#22D3EE" },
  "VIP":         { bg: "#2D1A00", text: "#FBBF24" },
  "Weird":       { bg: "#1A1A0A", text: "#A3E635" },
  "Needs Reply": { bg: "#2D0A0A", text: "#FCA5A5" },
  "Sponsor":     { bg: "#0A1A30", text: "#38BDF8" },
  "Guest":       { bg: "#1A0A2D", text: "#A78BFA" },
  "Brand":       { bg: "#0A1A1A", text: "#34D399" },
  "Press":       { bg: "#1A1A0A", text: "#FDE68A" },
};

interface TagBadgeProps {
  tag: AnyTag;
}

export function TagBadge({ tag }: TagBadgeProps) {
  const config = TAG_COLORS[tag] ?? { bg: "#1E1E2A", text: "#9CA3AF" };
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{tag}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
});
