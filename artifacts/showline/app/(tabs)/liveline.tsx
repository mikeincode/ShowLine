import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLiveLine } from "@/context/LiveLineContext";
import { useShowLine } from "@/context/ShowLineContext";
import { useColors } from "@/hooks/useColors";
import type { LiveQueueItem } from "@/types";

function QueueCard({
  item,
  onPin,
  onQueue,
  onAnswered,
  onBlock,
}: {
  item: LiveQueueItem;
  onPin: () => void;
  onQueue: () => void;
  onAnswered: () => void;
  onBlock: () => void;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.qCard,
        {
          backgroundColor: item.isPinned ? colors.primary + "18" : colors.card,
          borderColor: item.inQueue ? colors.live : item.isPinned ? colors.primary : colors.border,
          borderWidth: item.inQueue || item.isPinned ? 1 : 0,
          opacity: item.isAnswered ? 0.4 : 1,
        },
      ]}
    >
      <View style={styles.qHeader}>
        <View style={[styles.qAvatar, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.qAvatarText, { color: colors.primary }]}>{item.sender[0]}</Text>
        </View>
        <View style={styles.qMeta}>
          <Text style={[styles.qSender, { color: colors.foreground }]}>{item.sender}</Text>
          <Text style={[styles.qTime, { color: colors.mutedForeground }]}>{item.timestamp}</Text>
        </View>
        {item.inQueue && (
          <View style={[styles.inQueueBadge, { backgroundColor: colors.live + "22" }]}>
            <Text style={[styles.inQueueText, { color: colors.live }]}>In Queue</Text>
          </View>
        )}
        {item.isAnswered && (
          <View style={[styles.inQueueBadge, { backgroundColor: colors.success + "22" }]}>
            <Text style={[styles.inQueueText, { color: colors.success }]}>Answered</Text>
          </View>
        )}
      </View>
      <Text style={[styles.qContent, { color: colors.foreground }]}>{item.content}</Text>
      {!item.isAnswered && (
        <View style={styles.qActions}>
          <Pressable onPress={onPin} style={[styles.qBtn, { backgroundColor: item.isPinned ? colors.primary + "22" : colors.muted }]}>
            <Feather name="bookmark" size={14} color={item.isPinned ? colors.primary : colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={onQueue} style={[styles.qBtn, { backgroundColor: item.inQueue ? colors.live + "22" : colors.muted }]}>
            <Feather name="list" size={14} color={item.inQueue ? colors.live : colors.mutedForeground} />
            <Text style={[styles.qBtnText, { color: item.inQueue ? colors.live : colors.mutedForeground }]}>
              {item.inQueue ? "In Queue" : "Add to Queue"}
            </Text>
          </Pressable>
          <Pressable onPress={onAnswered} style={[styles.qBtn, { backgroundColor: colors.success + "18" }]}>
            <Feather name="check" size={14} color={colors.success} />
            <Text style={[styles.qBtnText, { color: colors.success }]}>Answered</Text>
          </Pressable>
          <Pressable onPress={onBlock} style={[styles.qBtn, { backgroundColor: colors.muted }]}>
            <Feather name="slash" size={14} color={colors.destructive} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function LiveLineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isLive, sessionStart, liveQueue, settings, startSession, endSession, toggleSetting, pinQueueItem, addToQueue, markAnswered, blockFromLive } = useLiveLine();
  const { updateLineStatus } = useShowLine();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 0;

  const handleEnd = () => {
    Alert.alert("End Live Session", "Are you sure? Your live queue will be reset.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End Session",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          endSession();
          updateLineStatus("liveline", "Closed");
        },
      },
    ]);
  };

  const handleStart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    startSession();
    updateLineStatus("liveline", "Live Now");
  };

  const sessionDuration = sessionStart
    ? Math.floor((Date.now() - new Date(sessionStart).getTime()) / 60000)
    : 0;

  if (!isLive) {
    return (
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.offlineContent, { paddingTop: topPad + 24, paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.offlineHeader}>
          <Text style={[styles.title, { color: colors.foreground }]}>LiveLine</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Real-time fan engagement</Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
          <View style={[styles.heroIcon, { backgroundColor: "#EF444422" }]}>
            <Feather name="radio" size={40} color={colors.live} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>Start a Live Session</Text>
          <Text style={[styles.heroDesc, { color: colors.mutedForeground }]}>
            Open your line to take live messages and call requests from your audience during streams,
            shows, or broadcasts.
          </Text>
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [styles.startBtn, { backgroundColor: colors.live, opacity: pressed ? 0.85 : 1 }]}
          >
            <Feather name="play-circle" size={20} color="#fff" />
            <Text style={styles.startBtnText}>Start Live Session</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SESSION FEATURES</Text>

        {[
          { icon: "message-square", label: "Accept fan texts & questions" },
          { icon: "phone-incoming", label: "Accept call requests" },
          { icon: "clock", label: "Slow mode to control pace" },
          { icon: "zap", label: "Auto-reply to incoming messages" },
          { icon: "grid", label: "Show QR code for your audience" },
        ].map((f) => (
          <View key={f.label} style={[styles.featureRow, { backgroundColor: colors.card }]}>
            <Feather name={f.icon as any} size={18} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.foreground }]}>{f.label}</Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Live Header */}
      <View style={[styles.liveHeader, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.liveStatus}>
          <View style={[styles.liveDot, { backgroundColor: colors.live }]} />
          <Text style={[styles.liveLabel, { color: colors.live }]}>LIVE</Text>
          <Text style={[styles.liveDuration, { color: colors.mutedForeground }]}>
            {sessionDuration}m
          </Text>
        </View>
        <Text style={[styles.liveTitle, { color: colors.foreground }]}>LiveLine</Text>
        <Pressable onPress={handleEnd} style={[styles.endBtn, { backgroundColor: colors.live }]}>
          <Feather name="x" size={14} color="#fff" />
          <Text style={styles.endBtnText}>End</Text>
        </Pressable>
      </View>

      {/* Controls */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.controlsScroll, { borderBottomColor: colors.border }]}>
        <View style={styles.controls}>
          {(Object.keys(settings) as (keyof typeof settings)[]).map((key) => {
            const labels: Record<string, string> = {
              acceptTexts: "Texts",
              acceptCallRequests: "Calls",
              slowMode: "Slow Mode",
              autoReply: "Auto-Reply",
              showQRCode: "QR Code",
            };
            return (
              <View key={key} style={[styles.toggle, { backgroundColor: colors.card }]}>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>{labels[key]}</Text>
                <Switch
                  value={settings[key]}
                  onValueChange={() => toggleSetting(key)}
                  trackColor={{ false: colors.border, true: colors.primary + "88" }}
                  thumbColor={settings[key] ? colors.primary : colors.mutedForeground}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Queue */}
      <View style={[styles.queueHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.queueTitle, { color: colors.foreground }]}>
          Live Queue{" "}
          <Text style={{ color: colors.mutedForeground }}>
            ({liveQueue.filter((m) => !m.isAnswered).length})
          </Text>
        </Text>
      </View>

      <FlatList
        data={liveQueue}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <QueueCard
            item={item}
            onPin={() => pinQueueItem(item.id)}
            onQueue={() => addToQueue(item.id)}
            onAnswered={() => markAnswered(item.id)}
            onBlock={() => blockFromLive(item.id)}
          />
        )}
        contentContainerStyle={[styles.queueList, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!liveQueue.length}
      />

      {/* End Session big button */}
      <View style={[styles.endFooter, { paddingBottom: bottomPad + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          onPress={handleEnd}
          style={({ pressed }) => [styles.endBigBtn, { backgroundColor: colors.live, opacity: pressed ? 0.85 : 1 }]}
        >
          <Feather name="stop-circle" size={20} color="#fff" />
          <Text style={styles.endBigBtnText}>End Live Session</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { flex: 1 },
  offlineContent: { paddingHorizontal: 16, gap: 12 },
  offlineHeader: { gap: 4, marginBottom: 8 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  heroCard: { borderRadius: 20, padding: 24, alignItems: "center", gap: 14 },
  heroIcon: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  heroDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  startBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, marginTop: 8 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12 },
  featureText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  liveHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  liveStatus: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveLabel: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  liveDuration: { fontSize: 12, fontFamily: "Inter_400Regular" },
  liveTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  endBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  endBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  controlsScroll: { flexGrow: 0, borderBottomWidth: 1 },
  controls: { flexDirection: "row", gap: 8, padding: 12, paddingHorizontal: 16 },
  toggle: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  toggleLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  queueHeader: { padding: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
  queueTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  queueList: { padding: 16, gap: 10 },
  qCard: { borderRadius: 14, padding: 14, gap: 10 },
  qHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  qAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  qAvatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  qMeta: { flex: 1 },
  qSender: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  qTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
  inQueueBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  inQueueText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  qContent: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  qActions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  qBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  qBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  endFooter: { borderTopWidth: 1, padding: 16 },
  endBigBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 16,
  },
  endBigBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
