import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TagBadge } from "@/components/TagBadge";
import { useMessages } from "@/context/MessagesContext";
import { useColors } from "@/hooks/useColors";
import type { CollabMessage, CollabStatus, CollabTag } from "@/types";

const STATUS_COLORS: Record<CollabStatus, { bg: string; text: string }> = {
  New: { bg: "#0A1A30", text: "#60A5FA" },
  Interested: { bg: "#0F1A0A", text: "#4ADE80" },
  Replied: { bg: "#2D1A00", text: "#FBBF24" },
  Archived: { bg: "#1E1E2A", text: "#6B7280" },
};

const STATUSES: CollabStatus[] = ["New", "Interested", "Replied", "Archived"];
const COLLAB_TAGS: CollabTag[] = ["Sponsor", "Guest", "Brand", "Collab", "Press"];

function CollabCard({ msg, onStatusChange }: { msg: CollabMessage; onStatusChange: (status: CollabStatus) => void }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_COLORS[msg.status];

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.cardAvatar, { backgroundColor: "#3B82F622" }]}>
          <Text style={[styles.cardAvatarText, { color: "#3B82F6" }]}>{msg.sender[0]}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={[styles.cardSender, { color: colors.foreground }]}>{msg.sender}</Text>
          {msg.company && (
            <Text style={[styles.cardCompany, { color: colors.mutedForeground }]}>{msg.company}</Text>
          )}
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.statusText, { color: config.text }]}>{msg.status}</Text>
          </View>
          <Text style={[styles.cardTime, { color: colors.mutedForeground }]}>{msg.timestamp}</Text>
        </View>
      </View>

      <Text style={[styles.cardContent, { color: colors.foreground }]} numberOfLines={expanded ? undefined : 2}>
        {msg.content}
      </Text>

      <View style={styles.tagsRow}>
        {msg.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
      </View>

      {expanded && (
        <View style={[styles.statusActions, { borderTopColor: colors.border }]}>
          <Text style={[styles.statusLabel, { color: colors.mutedForeground }]}>Mark as:</Text>
          <View style={styles.statusBtns}>
            {STATUSES.map((s) => (
              <Pressable
                key={s}
                onPress={() => {
                  Haptics.selectionAsync();
                  onStatusChange(s);
                }}
                style={[
                  styles.statusBtn,
                  { backgroundColor: msg.status === s ? STATUS_COLORS[s].bg : colors.muted },
                ]}
              >
                <Text style={[styles.statusBtnText, { color: msg.status === s ? STATUS_COLORS[s].text : colors.mutedForeground }]}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
          {msg.email && (
            <View style={[styles.emailRow, { backgroundColor: colors.muted }]}>
              <Feather name="mail" size={14} color={colors.mutedForeground} />
              <Text style={[styles.emailText, { color: colors.mutedForeground }]}>{msg.email}</Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

export default function CollabScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { collabMessages, updateCollabStatus } = useMessages();
  const [activeTag, setActiveTag] = useState<CollabTag | null>(null);
  const [activeStatus, setActiveStatus] = useState<CollabStatus | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const visible = collabMessages.filter((m) => {
    if (activeTag && !m.tags.includes(activeTag)) return false;
    if (activeStatus && m.status !== activeStatus) return false;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Collab Line</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Business inquiries, sponsors & collaborations
        </Text>
      </View>

      {/* Auto-reply note */}
      <View style={[styles.autoReplyBanner, { backgroundColor: "#3B82F611", borderColor: "#3B82F633" }]}>
        <Feather name="zap" size={13} color="#3B82F6" />
        <Text style={[styles.autoReplyText, { color: "#3B82F6" }]}>
          Auto-reply is active for new inquiries
        </Text>
        <Feather name="chevron-right" size={13} color="#3B82F6" />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={[styles.filterScroll, { borderBottomColor: colors.border }]}
      >
        {STATUSES.map((s) => (
          <Pressable
            key={s}
            onPress={() => setActiveStatus(activeStatus === s ? null : s)}
            style={[
              styles.filterBtn,
              { backgroundColor: activeStatus === s ? STATUS_COLORS[s].bg : colors.card, borderColor: activeStatus === s ? STATUS_COLORS[s].text : colors.border },
            ]}
          >
            <Text style={[styles.filterBtnText, { color: activeStatus === s ? STATUS_COLORS[s].text : colors.mutedForeground }]}>
              {s}
            </Text>
          </Pressable>
        ))}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        {COLLAB_TAGS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setActiveTag(activeTag === t ? null : t)}
            style={[
              styles.filterBtn,
              { backgroundColor: activeTag === t ? "#3B82F622" : colors.card, borderColor: activeTag === t ? "#3B82F6" : colors.border },
            ]}
          >
            <Text style={[styles.filterBtnText, { color: activeTag === t ? "#3B82F6" : colors.mutedForeground }]}>
              {t}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={visible}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <CollabCard
            msg={item}
            onStatusChange={(status) => updateCollabStatus(item.id, status)}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!visible.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="briefcase" size={40} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No inquiries yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.border }]}>
              Business inquiries sent to your Collab Line will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, gap: 4 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  autoReplyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderTopWidth: 0,
  },
  autoReplyText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  filterScroll: { flexGrow: 0, borderBottomWidth: 1 },
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10, alignItems: "center" },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1 },
  filterBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  divider: { width: 1, height: 20 },
  list: { padding: 16, gap: 10 },
  card: { borderRadius: 14, padding: 14, gap: 10 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardAvatar: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardAvatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  cardMeta: { flex: 1, gap: 2 },
  cardSender: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  cardCompany: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cardRight: { alignItems: "flex-end", gap: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  cardContent: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  tagsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  statusActions: { borderTopWidth: 1, paddingTop: 10, gap: 10 },
  statusLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  statusBtns: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  emailRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 8, borderRadius: 8 },
  emailText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", gap: 10, paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 260 },
});
