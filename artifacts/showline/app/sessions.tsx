import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSessionHistory } from "@/context/SessionHistoryContext";
import { useColors } from "@/hooks/useColors";
import type { SessionRecap } from "@/types";

export function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

export function formatSessionDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatSessionTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface StatPillProps {
  value: string | number;
  label: string;
  color: string;
}

function StatPill({ value, label, color }: StatPillProps) {
  const colors = useColors();
  return (
    <View style={[styles.pill, { backgroundColor: color + "18" }]}>
      <Text style={[styles.pillNum, { color }]}>{value}</Text>
      <Text style={[styles.pillLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function RecapCard({ recap, onPress }: { recap: SessionRecap; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {/* Date/time header */}
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconWrap, { backgroundColor: "#8B5CF622" }]}>
          <Feather name="film" size={18} color="#8B5CF6" />
        </View>
        <View style={styles.cardDate}>
          <Text style={[styles.cardDateText, { color: colors.foreground }]}>
            {formatSessionDate(recap.startTime)}
          </Text>
          <Text style={[styles.cardTimeText, { color: colors.mutedForeground }]}>
            {formatSessionTime(recap.startTime)} · {formatDuration(recap.durationMs)}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </View>

      {/* Stats row */}
      <View style={styles.pillRow}>
        <StatPill value={recap.totalMessages} label="msgs" color="#8B5CF6" />
        <StatPill value={recap.messagesPinned} label="pinned" color="#8B5CF6" />
        <StatPill value={recap.messagesAnswered} label="answered" color="#10B981" />
        {recap.fansVIPAdded > 0 && (
          <StatPill value={recap.fansVIPAdded} label="VIP" color="#F59E0B" />
        )}
        {recap.contactsBlocked > 0 && (
          <StatPill value={recap.contactsBlocked} label="blocked" color="#EF4444" />
        )}
      </View>

      {/* Topics */}
      {recap.topTopics.length > 0 && (
        <View style={styles.topicsRow}>
          {recap.topTopics.slice(0, 3).map((t) => (
            <View key={t} style={[styles.topicTag, { backgroundColor: colors.muted }]}>
              <Text style={[styles.topicTagText, { color: colors.mutedForeground }]}>{t}</Text>
            </View>
          ))}
          {recap.topTopics.length > 3 && (
            <Text style={[styles.topicMore, { color: colors.border }]}>
              +{recap.topTopics.length - 3} more
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

export default function SessionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sessions } = useSessionHistory();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Post-Show Recaps</Text>
        <Text style={[styles.pageDesc, { color: colors.mutedForeground }]}>
          Every live session you end generates a recap — pinned questions, answered messages, VIP
          fans, and content ideas in one place.
        </Text>
      </View>

      {sessions.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.card }]}>
          <View style={[styles.emptyIcon, { backgroundColor: "#8B5CF622" }]}>
            <Feather name="film" size={32} color="#8B5CF6" />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No recaps yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            Start a LiveLine session and end it to generate your first post-show recap.
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/liveline")}
            style={({ pressed }) => [
              styles.emptyBtn,
              { backgroundColor: "#EF4444", opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="play-circle" size={16} color="#fff" />
            <Text style={styles.emptyBtnText}>Go to LiveLine</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {sessions.length} session{sessions.length !== 1 ? "s" : ""} saved
          </Text>
          {sessions.map((s) => (
            <RecapCard
              key={s.id}
              recap={s}
              onPress={() => router.push(`/session/${s.id}`)}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 10 },
  pageHeader: { gap: 6, marginBottom: 8 },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  pageDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  count: { fontSize: 12, fontFamily: "Inter_500Medium", letterSpacing: 0.5 },
  card: { borderRadius: 16, padding: 16, gap: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardDate: { flex: 1, gap: 2 },
  cardDateText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardTimeText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignItems: "center", flexDirection: "row", gap: 4 },
  pillNum: { fontSize: 14, fontFamily: "Inter_700Bold" },
  pillLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  topicsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" },
  topicTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  topicTagText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  topicMore: { fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { borderRadius: 20, padding: 32, alignItems: "center", gap: 14 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  emptyBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
});
