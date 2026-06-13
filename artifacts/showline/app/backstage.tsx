import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import type { BackstageMode, LineStatus } from "@/types";

const MODES: { id: BackstageMode; status: LineStatus; desc: string }[] = [
  { id: "VIP Only", status: "VIP Only", desc: "Only approved superfans can reach you" },
  { id: "Quiet Hours", status: "Quiet Hours", desc: "VIPs can message, but you won't be notified" },
  { id: "Closed", status: "Closed", desc: "Backstage Line is completely closed" },
];

export default function BackstageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { lineStatuses, updateLineStatus, vipContacts, removeVIP, addVIP } = useShowLine();
  const { fanMailMessages, makeVIP } = useMessages();
  const [activeTab, setActiveTab] = useState<"inbox" | "vips" | "settings">("inbox");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const vipMessages = fanMailMessages.filter((m) => m.isVIP);

  const handleRemoveVIP = (id: string, name: string) => {
    Alert.alert("Remove VIP", `Remove ${name} from your Backstage Line?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          removeVIP(id);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
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
            style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.mutedForeground }]}>
              {tab === "vips" ? "VIP List" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "inbox" && (
        <FlatList
          data={vipMessages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 24 }]}
          scrollEnabled={!!vipMessages.length}
          renderItem={({ item }) => (
            <View style={[styles.msgCard, { backgroundColor: colors.card, borderColor: "#F59E0B33", borderWidth: 1 }]}>
              <View style={styles.msgHeader}>
                <View style={[styles.avatar, { backgroundColor: "#F59E0B22" }]}>
                  <Text style={[styles.avatarText, { color: "#F59E0B" }]}>{item.sender[0]}</Text>
                </View>
                <View style={styles.msgMeta}>
                  <Text style={[styles.msgSender, { color: colors.foreground }]}>{item.sender}</Text>
                  {item.handle && <Text style={[styles.msgHandle, { color: colors.mutedForeground }]}>{item.handle}</Text>}
                </View>
                <View style={[styles.vipTag, { backgroundColor: "#F59E0B22" }]}>
                  <Feather name="award" size={12} color="#F59E0B" />
                  <Text style={[styles.vipTagText, { color: "#F59E0B" }]}>VIP</Text>
                </View>
              </View>
              <Text style={[styles.msgContent, { color: colors.foreground }]}>{item.content}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="star" size={40} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No VIP messages yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.border }]}>
                Mark fans as VIP from FanMail to see their messages here
              </Text>
            </View>
          }
        />
      )}

      {activeTab === "vips" && (
        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 24 }]}>
          <View style={[styles.infoBanner, { backgroundColor: "#F59E0B11", borderColor: "#F59E0B33" }]}>
            <Feather name="info" size={14} color="#F59E0B" />
            <Text style={[styles.infoBannerText, { color: "#F59E0B" }]}>
              VIPs have access to your Backstage Line. Add fans from FanMail using the "Make VIP" action.
            </Text>
          </View>
          {vipContacts.map((vip) => (
            <View key={vip.id} style={[styles.vipCard, { backgroundColor: colors.card }]}>
              <View style={[styles.vipAvatar, { backgroundColor: "#F59E0B22" }]}>
                <Text style={[styles.avatarText, { color: "#F59E0B" }]}>{vip.name[0]}</Text>
              </View>
              <View style={styles.vipInfo}>
                <Text style={[styles.vipName, { color: colors.foreground }]}>{vip.name}</Text>
                <Text style={[styles.vipHandle, { color: colors.mutedForeground }]}>{vip.handle} · Since {vip.since}</Text>
                <Text style={[styles.vipMessages, { color: colors.mutedForeground }]}>{vip.messages} messages</Text>
              </View>
              <Pressable
                onPress={() => handleRemoveVIP(vip.id, vip.name)}
                style={[styles.removeBtn, { backgroundColor: "#EF444422" }]}
              >
                <Feather name="x" size={16} color={colors.destructive} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {activeTab === "settings" && (
        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 24 }]}>
          <Text style={[styles.modeTitle, { color: colors.mutedForeground }]}>MODE</Text>
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
                  <Text style={[styles.modeLabel, { color: active ? colors.warning : colors.foreground }]}>
                    {mode.id}
                  </Text>
                  <Text style={[styles.modeDesc, { color: colors.mutedForeground }]}>{mode.desc}</Text>
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
  header: { padding: 16, paddingHorizontal: 16, borderBottomWidth: 1, gap: 6 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  list: { padding: 16, gap: 10 },
  infoBanner: { flexDirection: "row", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  infoBannerText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  msgCard: { borderRadius: 14, padding: 14, gap: 10 },
  msgHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  msgMeta: { flex: 1 },
  msgSender: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  msgHandle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  vipTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  vipTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  msgContent: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  vipCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, gap: 12 },
  vipAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  vipInfo: { flex: 1, gap: 2 },
  vipName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  vipHandle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  vipMessages: { fontSize: 12, fontFamily: "Inter_400Regular" },
  removeBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  modeTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  modeCard: { padding: 16, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modeLeft: { flex: 1, gap: 4 },
  modeLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modeDesc: { fontSize: 13, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", gap: 10, paddingTop: 40 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 260 },
});
