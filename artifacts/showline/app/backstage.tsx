import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatusPill } from "@/components/StatusPill";
import { useMessages } from "@/context/MessagesContext";
import { useShowLine } from "@/context/ShowLineContext";
import { useColors } from "@/hooks/useColors";
import type { BackstageMode, LineStatus, VIPAccessLevel } from "@/types";

const MODES: { id: BackstageMode; status: LineStatus; desc: string }[] = [
  { id: "VIP Only", status: "VIP Only", desc: "Only approved superfans can reach you" },
  {
    id: "Quiet Hours",
    status: "Quiet Hours",
    desc: "VIPs can message, but you won't be notified",
  },
  { id: "Closed", status: "Closed", desc: "Backstage Line is completely closed" },
];

const ACCESS_LEVEL_COLOR: Record<VIPAccessLevel, string> = {
  "Standard Fan": "#6B7280",
  VIP: "#F59E0B",
  "Inner Circle": "#8B5CF6",
  Muted: "#F97316",
  Blocked: "#EF4444",
};

export default function BackstageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { lineStatuses, updateLineStatus, vipContacts, removeVIP } = useShowLine();
  const { fanMailMessages } = useMessages();
  const [activeTab, setActiveTab] = useState<"inbox" | "vips" | "settings">("inbox");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const vipMessages = fanMailMessages.filter((m) => m.isVIP && !m.isBlocked);

  const handleRemoveVIP = (id: string, name: string) => {
    Alert.alert("Remove Backstage Access", `Remove ${name} from your Backstage Line?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove Access",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          removeVIP(id);
        },
      },
    ]);
  };

  const activeCount = vipContacts.filter(
    (v) => v.accessLevel !== "Muted" && v.accessLevel !== "Blocked"
  ).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}
      >
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.foreground }]}>Backstage Line</Text>
          <StatusPill status={lineStatuses.backstage} size="sm" />
        </View>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          A private channel for your approved superfans only.
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {(["inbox", "vips", "settings"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? colors.primary : colors.mutedForeground },
              ]}
            >
              {tab === "vips"
                ? `VIPs (${activeCount})`
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Inbox Tab */}
      {activeTab === "inbox" && (
        <FlatList
          data={vipMessages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 24 }]}
          scrollEnabled={!!vipMessages.length}
          renderItem={({ item }) => {
            const vip = vipContacts.find(
              (v) => v.name.toLowerCase() === item.sender.toLowerCase()
            );
            return (
              <View
                style={[
                  styles.msgCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: "#F59E0B33",
                    borderWidth: 1,
                  },
                ]}
              >
                <View style={styles.msgHeader}>
                  <View style={[styles.avatar, { backgroundColor: "#F59E0B22" }]}>
                    <Text style={[styles.avatarText, { color: "#F59E0B" }]}>
                      {item.sender[0]}
                    </Text>
                  </View>
                  <View style={styles.msgMeta}>
                    <Text style={[styles.msgSender, { color: colors.foreground }]}>
                      {item.sender}
                    </Text>
                    {item.handle && (
                      <Text style={[styles.msgHandle, { color: colors.mutedForeground }]}>
                        {item.handle}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.vipTag, { backgroundColor: "#F59E0B22" }]}>
                    <Feather name="award" size={12} color="#F59E0B" />
                    <Text style={[styles.vipTagText, { color: "#F59E0B" }]}>VIP</Text>
                  </View>
                </View>
                <Text style={[styles.msgContent, { color: colors.foreground }]}>
                  {item.content}
                </Text>
                {vip && (
                  <Pressable
                    onPress={() => router.push(`/vip/${vip.id}`)}
                    style={({ pressed }) => [
                      styles.viewProfileBtn,
                      {
                        backgroundColor: colors.muted,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Feather name="user" size={13} color={colors.primary} />
                    <Text style={[styles.viewProfileText, { color: colors.primary }]}>
                      View Profile
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="star" size={40} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>
                No VIP messages yet
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.border }]}>
                Mark fans as VIP from FanMail to see their messages here
              </Text>
            </View>
          }
        />
      )}

      {/* VIPs Tab */}
      {activeTab === "vips" && (
        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 24 }]}>
          <View
            style={[
              styles.infoBanner,
              { backgroundColor: "#F59E0B11", borderColor: "#F59E0B33" },
            ]}
          >
            <Feather name="info" size={14} color="#F59E0B" />
            <Text style={[styles.infoBannerText, { color: "#F59E0B" }]}>
              Tap any fan to view their full profile, add notes, and manage access.
            </Text>
          </View>

          {vipContacts.length === 0 && (
            <View style={styles.empty}>
              <Feather name="users" size={36} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>
                No VIPs yet
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.border }]}>
                Make fans VIP from FanMail or LiveLine to build your Backstage community.
              </Text>
            </View>
          )}

          {vipContacts.map((vip) => {
            const level = vip.accessLevel ?? "VIP";
            const levelColor = ACCESS_LEVEL_COLOR[level];
            const isMuted = level === "Muted";
            const isBlocked = level === "Blocked";
            return (
              <Pressable
                key={vip.id}
                onPress={() => router.push(`/vip/${vip.id}`)}
                style={({ pressed }) => [
                  styles.vipCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isBlocked
                      ? "#EF444433"
                      : isMuted
                      ? "#F9730033"
                      : "transparent",
                    borderWidth: isBlocked || isMuted ? 1 : 0,
                    opacity: pressed ? 0.85 : isMuted ? 0.65 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.vipAvatar,
                    { backgroundColor: levelColor + "22" },
                  ]}
                >
                  <Text style={[styles.avatarText, { color: levelColor }]}>{vip.name[0]}</Text>
                </View>
                <View style={styles.vipInfo}>
                  <View style={styles.vipNameRow}>
                    <Text style={[styles.vipName, { color: colors.foreground }]}>
                      {vip.name}
                    </Text>
                    <View
                      style={[
                        styles.levelBadge,
                        { backgroundColor: levelColor + "22" },
                      ]}
                    >
                      <Text style={[styles.levelBadgeText, { color: levelColor }]}>
                        {level}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.vipHandle, { color: colors.mutedForeground }]}>
                    {vip.handle} · {vip.messages} messages
                  </Text>
                  {vip.notes ? (
                    <Text
                      style={[styles.vipNote, { color: colors.mutedForeground }]}
                      numberOfLines={1}
                    >
                      📝 {vip.notes}
                    </Text>
                  ) : null}
                  {(vip.tags ?? []).length > 0 && (
                    <View style={styles.tagRow}>
                      {(vip.tags ?? []).slice(0, 3).map((t) => (
                        <View
                          key={t}
                          style={[styles.tagChip, { backgroundColor: colors.muted }]}
                        >
                          <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                            {t}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <Pressable
                  onPress={() => handleRemoveVIP(vip.id, vip.name)}
                  hitSlop={8}
                  style={[styles.removeBtn, { backgroundColor: "#EF444418" }]}
                >
                  <Feather name="x" size={15} color={colors.destructive} />
                </Pressable>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 24 }]}>
          <Text style={[styles.modeTitle, { color: colors.mutedForeground }]}>ACCESS MODE</Text>
          {MODES.map((mode) => {
            const active = lineStatuses.backstage === mode.status;
            return (
              <Pressable
                key={mode.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  updateLineStatus("backstage", mode.status);
                }}
                style={[
                  styles.modeCard,
                  {
                    backgroundColor: active ? colors.warning + "18" : colors.card,
                    borderColor: active ? colors.warning : colors.border,
                    borderWidth: active ? 1.5 : 1,
                  },
                ]}
              >
                <View style={styles.modeLeft}>
                  <Text
                    style={[
                      styles.modeLabel,
                      { color: active ? colors.warning : colors.foreground },
                    ]}
                  >
                    {mode.id}
                  </Text>
                  <Text style={[styles.modeDesc, { color: colors.mutedForeground }]}>
                    {mode.desc}
                  </Text>
                </View>
                {active && <Feather name="check-circle" size={20} color={colors.warning} />}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, gap: 6 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  list: { padding: 16, gap: 10 },
  infoBanner: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  infoBannerText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  msgCard: { borderRadius: 14, padding: 14, gap: 10 },
  msgHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  msgMeta: { flex: 1 },
  msgSender: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  msgHandle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  vipTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vipTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  msgContent: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  viewProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  viewProfileText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  vipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  vipAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  vipNameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  vipInfo: { flex: 1, gap: 4 },
  vipName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  levelBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  levelBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  vipHandle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  vipNote: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  tagRow: { flexDirection: "row", gap: 5, flexWrap: "wrap" },
  tagChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  tagText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  modeTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  modeCard: {
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modeLeft: { flex: 1, gap: 4 },
  modeLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modeDesc: { fontSize: 13, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", gap: 10, paddingTop: 40 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptyDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    maxWidth: 260,
  },
});
