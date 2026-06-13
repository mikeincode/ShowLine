import { Feather } from "@expo/vector-icons";
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

import { MessageCard } from "@/components/MessageCard";
import { TagBadge } from "@/components/TagBadge";
import { useMessages } from "@/context/MessagesContext";
import { useShowLine } from "@/context/ShowLineContext";
import { useColors } from "@/hooks/useColors";
import type { FanMessage, MessageTag } from "@/types";

const ALL_TAGS: MessageTag[] = [
  "Question", "Topic Idea", "Story", "Fan Love", "Collab", "VIP", "Weird", "Needs Reply",
];

export default function FanMailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { fanMailMessages, pinMessage, saveMessage, makeVIP, blockSender, replyToMessage, moveToLiveLine, moveToCollab } = useMessages();
  const { addBlocked } = useShowLine();
  const [activeTag, setActiveTag] = useState<MessageTag | null>(null);
  const [showBlocked, setShowBlocked] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 0;

  const visible = fanMailMessages.filter((m) => {
    if (m.isBlocked !== showBlocked) return false;
    if (activeTag && !m.tags.includes(activeTag)) return false;
    return true;
  });

  const handleBlock = (m: FanMessage) => {
    blockSender(m.id);
    addBlocked({
      id: m.id,
      name: m.sender,
      handle: m.handle,
      reason: "Blocked from FanMail",
      blockedAt: "just now",
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>FanMail</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {visible.length} message{visible.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <Pressable
          onPress={() => setShowBlocked((v) => !v)}
          style={[styles.filterBtn, { backgroundColor: showBlocked ? "#EF444422" : colors.muted }]}
        >
          <Feather name={showBlocked ? "slash" : "filter"} size={16} color={showBlocked ? colors.destructive : colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Tag filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagRow}
        style={[styles.tagScroll, { borderBottomColor: colors.border }]}
      >
        <Pressable
          onPress={() => setActiveTag(null)}
          style={[
            styles.tagBtn,
            { backgroundColor: !activeTag ? colors.primary : colors.card, borderColor: !activeTag ? colors.primary : colors.border },
          ]}
        >
          <Text style={[styles.tagBtnText, { color: !activeTag ? "#fff" : colors.mutedForeground }]}>
            All
          </Text>
        </Pressable>
        {ALL_TAGS.map((tag) => (
          <Pressable
            key={tag}
            onPress={() => setActiveTag(activeTag === tag ? null : tag)}
            style={[
              styles.tagBtn,
              { backgroundColor: activeTag === tag ? colors.primary : colors.card, borderColor: activeTag === tag ? colors.primary : colors.border },
            ]}
          >
            <Text style={[styles.tagBtnText, { color: activeTag === tag ? "#fff" : colors.mutedForeground }]}>
              {tag}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {showBlocked && (
        <View style={[styles.blockedBanner, { backgroundColor: "#2D0A0A" }]}>
          <Feather name="slash" size={14} color={colors.destructive} />
          <Text style={[styles.blockedText, { color: colors.destructive }]}>
            Showing blocked messages
          </Text>
        </View>
      )}

      <FlatList
        data={visible}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MessageCard
            message={item}
            onPin={() => pinMessage(item.id)}
            onSave={() => saveMessage(item.id)}
            onMakeVIP={() => makeVIP(item.id)}
            onBlock={() => handleBlock(item)}
            onReply={(text) => replyToMessage(item.id, text)}
            onMoveToLiveLine={() => moveToLiveLine(item.id)}
            onMoveToCollab={() => moveToCollab(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: bottomPad + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!visible.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={40} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>
              {activeTag ? `No messages tagged "${activeTag}"` : "No messages yet"}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.border }]}>
              Share your ShowLine number to start collecting fan messages
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  filterBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  tagScroll: { flexGrow: 0, borderBottomWidth: 1 },
  tagRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  tagBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  tagBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  blockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    paddingHorizontal: 16,
  },
  blockedText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  list: { padding: 16, gap: 0 },
  empty: { alignItems: "center", gap: 10, paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 260 },
});
