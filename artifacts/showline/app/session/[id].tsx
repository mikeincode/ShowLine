import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import type { LiveQueueItem } from "@/types";
import { formatDuration, formatSessionDate, formatSessionTime } from "../sessions";

interface BigStatProps {
  value: string | number;
  label: string;
  sub?: string;
  color: string;
  icon: string;
}

function BigStat({ value, label, sub, color, icon }: BigStatProps) {
  const colors = useColors();
  return (
    <View style={[styles.bigStat, { backgroundColor: color + "14" }]}>
      <View style={[styles.bigStatIcon, { backgroundColor: color + "22" }]}>
        <Feather name={icon as any} size={16} color={color} />
      </View>
      <Text style={[styles.bigStatNum, { color }]}>{value}</Text>
      <Text style={[styles.bigStatLabel, { color: colors.foreground }]}>{label}</Text>
      {sub && <Text style={[styles.bigStatSub, { color: colors.mutedForeground }]}>{sub}</Text>}
    </View>
  );
}

function MiniQueueCard({ item }: { item: LiveQueueItem }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.miniCard,
        {
          backgroundColor: item.isVIP ? "#F59E0B0E" : colors.muted,
          borderColor: item.isVIP ? "#F59E0B44" : "transparent",
          borderWidth: item.isVIP ? 1 : 0,
        },
      ]}
    >
      <View
        style={[
          styles.miniAvatar,
          { backgroundColor: item.isVIP ? "#F59E0B22" : colors.card },
        ]}
      >
        <Text style={[styles.miniAvatarText, { color: item.isVIP ? "#F59E0B" : colors.primary }]}>
          {item.sender[0]}
        </Text>
      </View>
      <View style={styles.miniText}>
        <View style={styles.miniSenderRow}>
          <Text style={[styles.miniSender, { color: colors.foreground }]}>{item.sender}</Text>
          {item.isVIP && (
            <View style={styles.miniVIPBadge}>
              <Text style={styles.miniVIPText}>⭐ VIP</Text>
            </View>
          )}
        </View>
        <Text style={[styles.miniContent, { color: colors.mutedForeground }]} numberOfLines={2}>
          {item.content}
        </Text>
      </View>
    </View>
  );
}

export default function SessionDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessions } = useSessionHistory();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const recap = sessions.find((s) => s.id === id);

  if (!recap) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>
          Recap not found
        </Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: colors.primary }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const engagementRate =
    recap.totalMessages > 0
      ? Math.round((recap.messagesAnswered / recap.totalMessages) * 100)
      : 0;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Session Header */}
      <View style={[styles.sessionHeader, { backgroundColor: colors.card }]}>
        <View style={[styles.sessionHeaderIcon, { backgroundColor: "#8B5CF622" }]}>
          <Feather name="film" size={24} color="#8B5CF6" />
        </View>
        <View style={styles.sessionHeaderText}>
          <Text style={[styles.sessionDate, { color: colors.foreground }]}>
            {formatSessionDate(recap.startTime)}
          </Text>
          <Text style={[styles.sessionTime, { color: colors.mutedForeground }]}>
            Started {formatSessionTime(recap.startTime)} · {formatDuration(recap.durationMs)}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        SESSION STATS
      </Text>
      <View style={styles.statsGrid}>
        <BigStat
          value={recap.totalMessages}
          label="Messages"
          sub="total received"
          color="#8B5CF6"
          icon="message-square"
        />
        <BigStat
          value={recap.messagesPinned}
          label="Pinned"
          sub="for reference"
          color="#8B5CF6"
          icon="bookmark"
        />
        <BigStat
          value={recap.messagesAnswered}
          label="Answered"
          sub={`${engagementRate}% rate`}
          color="#10B981"
          icon="check-circle"
        />
        <BigStat
          value={recap.fansVIPAdded}
          label="VIP Adds"
          sub="to backstage"
          color="#F59E0B"
          icon="award"
        />
        <BigStat
          value={formatDuration(recap.durationMs)}
          label="Duration"
          sub="session length"
          color="#3B82F6"
          icon="clock"
        />
        <BigStat
          value={recap.contactsBlocked}
          label="Blocked"
          sub="from live"
          color="#EF4444"
          icon="slash"
        />
      </View>

      {/* Content Ideas Banner */}
      {recap.topTopics.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            CONTENT IDEAS FROM THIS SESSION
          </Text>
          <View style={[styles.topicsCard, { backgroundColor: "#8B5CF611", borderColor: "#8B5CF633" }]}>
            <View style={styles.topicsCardHeader}>
              <Feather name="zap" size={16} color="#8B5CF6" />
              <Text style={[styles.topicsCardTitle, { color: "#8B5CF6" }]}>
                Turn these into clips, posts, or next-episode topics
              </Text>
            </View>
            <View style={styles.topicsGrid}>
              {recap.topTopics.map((t) => (
                <View key={t} style={[styles.topicChip, { backgroundColor: "#8B5CF622" }]}>
                  <Text style={[styles.topicChipText, { color: "#8B5CF6" }]}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {/* Pinned Messages */}
      {recap.pinnedMessages.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            PINNED QUESTIONS & MESSAGES
          </Text>
          <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
            These stood out during your live — great for follow-up content.
          </Text>
          {recap.pinnedMessages.map((item) => (
            <MiniQueueCard key={item.id} item={item} />
          ))}
        </>
      )}

      {/* Answered Messages */}
      {recap.answeredMessages.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            ANSWERED ON AIR
          </Text>
          <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
            Questions you addressed live — consider turning your best answers into posts.
          </Text>
          {recap.answeredMessages.map((item) => (
            <MiniQueueCard key={item.id} item={item} />
          ))}
        </>
      )}

      {/* VIP Fans */}
      {recap.fansVIPAdded > 0 && (
        <View style={[styles.vipBanner, { backgroundColor: "#F59E0B11", borderColor: "#F59E0B33" }]}>
          <Feather name="award" size={18} color="#F59E0B" />
          <View style={styles.vipBannerText}>
            <Text style={[styles.vipBannerTitle, { color: colors.foreground }]}>
              {recap.fansVIPAdded} fan{recap.fansVIPAdded !== 1 ? "s" : ""} added to Backstage Line
            </Text>
            <Text style={[styles.vipBannerDesc, { color: colors.mutedForeground }]}>
              Check your Backstage Line to follow up with your newest VIPs.
            </Text>
          </View>
        </View>
      )}

      {/* Empty state if nothing notable */}
      {recap.pinnedMessages.length === 0 &&
        recap.answeredMessages.length === 0 &&
        recap.topTopics.length === 0 && (
          <View style={[styles.emptyNote, { backgroundColor: colors.card }]}>
            <Feather name="info" size={16} color={colors.mutedForeground} />
            <Text style={[styles.emptyNoteText, { color: colors.mutedForeground }]}>
              No pinned or answered messages in this session. Next time, try pinning fan questions
              to save them for later content ideas.
            </Text>
          </View>
        )}

      {/* CTA */}
      <Pressable
        onPress={() => router.push("/(tabs)/liveline")}
        style={({ pressed }) => [
          styles.ctaBtn,
          { backgroundColor: "#EF4444", opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Feather name="play-circle" size={18} color="#fff" />
        <Text style={styles.ctaBtnText}>Start Another Live Session</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 10 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  backBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  backBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    marginBottom: 4,
  },
  sessionHeaderIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionHeaderText: { flex: 1, gap: 3 },
  sessionDate: { fontSize: 20, fontFamily: "Inter_700Bold" },
  sessionTime: { fontSize: 13, fontFamily: "Inter_400Regular" },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginTop: 6,
  },
  sectionHint: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, marginTop: -4 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bigStat: {
    flex: 1,
    minWidth: "30%",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  bigStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  bigStatNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  bigStatLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  bigStatSub: { fontSize: 10, fontFamily: "Inter_400Regular" },
  topicsCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  topicsCardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  topicsCardTitle: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  topicsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  topicChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  topicChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  miniCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  miniAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  miniAvatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  miniText: { flex: 1, gap: 3 },
  miniSenderRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  miniSender: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  miniVIPBadge: { backgroundColor: "#F59E0B22", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  miniVIPText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#F59E0B" },
  miniContent: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  vipBanner: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  vipBannerText: { flex: 1, gap: 3 },
  vipBannerTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  vipBannerDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  emptyNote: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    alignItems: "flex-start",
  },
  emptyNoteText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 16,
    marginTop: 8,
  },
  ctaBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
