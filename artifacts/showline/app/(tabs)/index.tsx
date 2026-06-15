import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

import { LineCard } from "@/components/LineCard";
import { useBanner } from "@/context/BannerContext";
import { useLiveLine } from "@/context/LiveLineContext";
import { useMessages } from "@/context/MessagesContext";
import { useSessionHistory } from "@/context/SessionHistoryContext";
import { useShowLine } from "@/context/ShowLineContext";
import { useColors } from "@/hooks/useColors";
import { formatDuration, formatSessionDate } from "../sessions";

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lineStatuses, updateLineStatus } = useShowLine();
  const { isLive, startSession } = useLiveLine();
  const { fanMailMessages, collabMessages } = useMessages();
  const { showBanner } = useBanner();
  const { sessions } = useSessionHistory();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 0;

  const fanMailUnread = fanMailMessages.filter((m) => !m.isBlocked && !m.reply).length;
  const collabUnread = collabMessages.filter((m) => m.status === "New").length;
  const vipUnread = fanMailMessages.filter((m) => m.isVIP && !m.reply).length;

  const inboxNeedsReply = fanMailMessages.filter((m) => !m.isBlocked && !m.reply).length;
  const inboxPinned     = fanMailMessages.filter((m) => !m.isBlocked && m.isPinned).length;
  const inboxVIP        = fanMailMessages.filter((m) => !m.isBlocked && m.isVIP).length;

  const lastSession = sessions[0] ?? null;

  const toggleFanMail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = lineStatuses.fanmail === "Open" ? "Closed" : "Open";
    updateLineStatus("fanmail", next);
    showBanner({
      icon: "mail",
      title: next === "Open" ? "FanMail Opened" : "FanMail Closed",
      message: next === "Open" ? "Fans can now send you messages" : "New messages are paused",
      color: "#8B5CF6",
    });
  };

  const toggleCollab = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = lineStatuses.collab === "Collect Only" ? "Closed" : "Collect Only";
    updateLineStatus("collab", next);
    showBanner({
      icon: "briefcase",
      title: next === "Collect Only" ? "Collab Line Opened" : "Collab Line Closed",
      message:
        next === "Collect Only" ? "Accepting business inquiries" : "Collab inquiries paused",
      color: "#3B82F6",
    });
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Welcome back</Text>
          <Text style={[styles.appName, { color: colors.foreground }]}>ShowLine</Text>
        </View>
        <Pressable
          onPress={() => router.push("/upgrade")}
          style={[
            styles.proBadge,
            { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" },
          ]}
        >
          <Feather name="zap" size={12} color={colors.primary} />
          <Text style={[styles.proBadgeText, { color: colors.primary }]}>Upgrade</Text>
        </Pressable>
      </View>

      {/* Creator Number */}
      <View style={[styles.numberCard, { backgroundColor: colors.card }]}>
        <View style={styles.numberLeft}>
          <View style={[styles.numberIcon, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="phone" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.numberLabel, { color: colors.mutedForeground }]}>
              Your Creator Line
            </Text>
            <Text style={[styles.number, { color: colors.foreground }]}>(555) 014-SHOW</Text>
          </View>
        </View>
        <View style={[styles.comingSoonBadge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.comingSoonText, { color: colors.mutedForeground }]}>
            Real # Coming Soon
          </Text>
        </View>
      </View>

      {/* Last Live Recap card — only shown if a session exists */}
      {lastSession && (
        <Pressable
          onPress={() => router.push(`/session/${lastSession.id}`)}
          style={({ pressed }) => [
            styles.recapCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.primary + "33",
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <View style={[styles.recapLeft, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="film" size={18} color={colors.primary} />
          </View>
          <View style={styles.recapInfo}>
            <Text style={[styles.recapTitle, { color: colors.foreground }]}>
              Last Live Recap
            </Text>
            <Text style={[styles.recapMeta, { color: colors.mutedForeground }]}>
              {formatSessionDate(lastSession.startTime)} ·{" "}
              {formatDuration(lastSession.durationMs)} ·{" "}
              {lastSession.totalMessages} messages
            </Text>
            <View style={styles.recapPills}>
              {lastSession.messagesPinned > 0 && (
                <View style={[styles.recapPill, { backgroundColor: colors.primary + "22" }]}>
                  <Text style={[styles.recapPillText, { color: colors.primary }]}>
                    {lastSession.messagesPinned} pinned
                  </Text>
                </View>
              )}
              {lastSession.messagesAnswered > 0 && (
                <View style={[styles.recapPill, { backgroundColor: "#10B98122" }]}>
                  <Text style={[styles.recapPillText, { color: "#10B981" }]}>
                    {lastSession.messagesAnswered} answered
                  </Text>
                </View>
              )}
              {lastSession.fansVIPAdded > 0 && (
                <View style={[styles.recapPill, { backgroundColor: "#F59E0B22" }]}>
                  <Text style={[styles.recapPillText, { color: "#F59E0B" }]}>
                    {lastSession.fansVIPAdded} VIP
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>
      )}

      {/* Smart Inbox card */}
      {(inboxNeedsReply > 0 || inboxPinned > 0 || inboxVIP > 0) && (
        <Pressable
          onPress={() => router.push("/(tabs)/fanmail")}
          style={({ pressed }) => [
            styles.smartCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.primary + "33",
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <View style={styles.smartHeader}>
            <View style={[styles.smartIcon, { backgroundColor: colors.primary + "22" }]}>
              <Feather name="inbox" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.smartTitle, { color: colors.foreground }]}>Smart Inbox</Text>
            <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
          </View>
          <View style={styles.smartStats}>
            {inboxNeedsReply > 0 && (
              <View style={[styles.smartStat, { backgroundColor: "#EF444414" }]}>
                <Feather name="message-circle" size={13} color="#EF4444" />
                <Text style={[styles.smartStatNum, { color: "#EF4444" }]}>{inboxNeedsReply}</Text>
                <Text style={[styles.smartStatLabel, { color: colors.mutedForeground }]}>Needs Reply</Text>
              </View>
            )}
            {inboxPinned > 0 && (
              <View style={[styles.smartStat, { backgroundColor: "#10B98114" }]}>
                <Feather name="bookmark" size={13} color="#10B981" />
                <Text style={[styles.smartStatNum, { color: "#10B981" }]}>{inboxPinned}</Text>
                <Text style={[styles.smartStatLabel, { color: colors.mutedForeground }]}>Pinned</Text>
              </View>
            )}
            {inboxVIP > 0 && (
              <View style={[styles.smartStat, { backgroundColor: "#F59E0B14" }]}>
                <Feather name="award" size={13} color="#F59E0B" />
                <Text style={[styles.smartStatNum, { color: "#F59E0B" }]}>{inboxVIP}</Text>
                <Text style={[styles.smartStatLabel, { color: colors.mutedForeground }]}>VIP</Text>
              </View>
            )}
          </View>
        </Pressable>
      )}

      {/* Section title */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>YOUR LINES</Text>

      {/* FanMail Card */}
      <LineCard
        name="FanMail"
        subtitle="General fan message inbox"
        iconName="mail"
        accentColor="#8B5CF6"
        status={lineStatuses.fanmail}
        unreadCount={fanMailUnread}
        lastMessage={fanMailMessages[0]?.content}
        onPress={() => router.push("/(tabs)/fanmail")}
        primaryActionLabel={lineStatuses.fanmail === "Open" ? "Close Line" : "Open Line"}
        primaryActionIcon={lineStatuses.fanmail === "Open" ? "x-circle" : "check-circle"}
        onPrimaryAction={toggleFanMail}
        secondaryActionLabel="View Inbox"
        secondaryActionIcon="inbox"
        onSecondaryAction={() => router.push("/(tabs)/fanmail")}
      />

      {/* LiveLine Card */}
      <LineCard
        name="LiveLine"
        subtitle="Live show & call-in mode"
        iconName="radio"
        accentColor="#EF4444"
        status={isLive ? "Live Now" : lineStatuses.liveline}
        unreadCount={0}
        lastMessage={isLive ? "Session active — taking messages" : "No active session"}
        onPress={() => router.push("/(tabs)/liveline")}
        primaryActionLabel={isLive ? "View Live" : "Start Live"}
        primaryActionIcon={isLive ? "radio" : "play-circle"}
        onPrimaryAction={() => {
          if (!isLive) {
            startSession();
            showBanner({
              icon: "radio",
              title: "LiveLine Started",
              message: "Your line is now live and taking messages",
              color: "#EF4444",
            });
          }
          router.push("/(tabs)/liveline");
        }}
        secondaryActionLabel="Manage"
        secondaryActionIcon="settings"
        onSecondaryAction={() => router.push("/(tabs)/liveline")}
      />

      {/* Backstage Line Card */}
      <LineCard
        name="Backstage Line"
        subtitle="VIP superfan-only access"
        iconName="star"
        accentColor="#F59E0B"
        status={lineStatuses.backstage}
        unreadCount={vipUnread}
        lastMessage="For approved superfans only"
        onPress={() => router.push("/backstage")}
        primaryActionLabel="Open Backstage"
        primaryActionIcon="external-link"
        onPrimaryAction={() => router.push("/backstage")}
        secondaryActionLabel="Manage VIPs"
        secondaryActionIcon="users"
        onSecondaryAction={() => router.push("/backstage")}
      />

      {/* Collab Line Card */}
      <LineCard
        name="Collab Line"
        subtitle="Brands, sponsors & business"
        iconName="briefcase"
        accentColor="#3B82F6"
        status={lineStatuses.collab}
        unreadCount={collabUnread}
        lastMessage={
          collabMessages[0]?.company
            ? `${collabMessages[0].company} — ${collabMessages[0].content.slice(0, 40)}...`
            : undefined
        }
        onPress={() => router.push("/collab")}
        primaryActionLabel={lineStatuses.collab === "Closed" ? "Open Line" : "Close Line"}
        primaryActionIcon={lineStatuses.collab === "Closed" ? "check-circle" : "x-circle"}
        onPrimaryAction={toggleCollab}
        secondaryActionLabel="View Inquiries"
        secondaryActionIcon="briefcase"
        onSecondaryAction={() => router.push("/collab")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  appName: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  proBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  numberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  numberLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  numberIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  numberLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  number: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  comingSoonBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  comingSoonText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  recapCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 4,
  },
  recapLeft: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  recapInfo: { flex: 1, gap: 4 },
  recapTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  recapMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  recapPills: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  recapPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  recapPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 8,
  },
  smartCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 4,
  },
  smartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  smartIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  smartTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  smartStats: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  smartStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smartStatNum: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  smartStatLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
