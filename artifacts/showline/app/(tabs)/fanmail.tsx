import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MessageCard } from "@/components/MessageCard";
import { useMessages } from "@/context/MessagesContext";
import { useShowLine } from "@/context/ShowLineContext";
import { useColors } from "@/hooks/useColors";
import type { FanMessage, MessageTag } from "@/types";

type FilterView = "All" | "Pinned" | "Saved" | "Unread" | MessageTag;
type SortOption = "newest" | "oldest" | "pinned_first" | "vip_first" | "needs_reply_first";
type Colors = ReturnType<typeof useColors>;

const FILTER_CHIPS: FilterView[] = [
  "All", "Pinned", "Saved", "Unread",
  "Needs Reply", "Question", "Topic Idea", "Story", "Fan Love", "VIP", "Collab", "Weird",
];

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
  { value: "newest",          label: "Newest",      icon: "arrow-down"     },
  { value: "oldest",          label: "Oldest",      icon: "arrow-up"       },
  { value: "pinned_first",    label: "Pinned",      icon: "bookmark"       },
  { value: "vip_first",       label: "VIP First",   icon: "award"          },
  { value: "needs_reply_first", label: "Needs Reply", icon: "message-circle" },
];

const SMART_SECTIONS: {
  key: "needs_reply" | "content" | "vip" | "pinned";
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  color: string;
  filter: FilterView;
}[] = [
  { key: "needs_reply", label: "Needs Reply",   icon: "message-circle", color: "#EF4444", filter: "Needs Reply" },
  { key: "content",     label: "Content Ideas", icon: "zap",            color: "#8B5CF6", filter: "Topic Idea" },
  { key: "vip",         label: "VIP Fans",      icon: "award",          color: "#F59E0B", filter: "VIP"        },
  { key: "pinned",      label: "Pinned",         icon: "bookmark",       color: "#10B981", filter: "Pinned"     },
];

const PREFS_KEY = "@showline:inbox_prefs";

function applySortFn(msgs: FanMessage[], sort: SortOption): FanMessage[] {
  switch (sort) {
    case "oldest":
      return [...msgs].reverse();
    case "pinned_first":
      return [...msgs].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    case "vip_first":
      return [...msgs].sort((a, b) => (b.isVIP ? 1 : 0) - (a.isVIP ? 1 : 0));
    case "needs_reply_first":
      return [...msgs].sort((a, b) => (!a.reply ? 0 : 1) - (!b.reply ? 0 : 1));
    default:
      return msgs;
  }
}

interface SmartInboxCardsProps {
  counts: { needs_reply: number; content: number; vip: number; pinned: number };
  onFilter: (f: FilterView) => void;
  colors: Colors;
}

function SmartInboxCards({ counts, onFilter, colors }: SmartInboxCardsProps) {
  return (
    <View style={smartStyles.wrap}>
      <Text style={[smartStyles.heading, { color: colors.mutedForeground }]}>SMART INBOX</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={smartStyles.row}
      >
        {SMART_SECTIONS.map((s) => {
          const count = counts[s.key];
          return (
            <Pressable
              key={s.key}
              onPress={() => onFilter(s.filter)}
              style={({ pressed }) => [
                smartStyles.card,
                {
                  backgroundColor: s.color + "14",
                  borderColor: s.color + "33",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={[smartStyles.iconWrap, { backgroundColor: s.color + "22" }]}>
                <Feather name={s.icon} size={16} color={s.color} />
              </View>
              <Text style={[smartStyles.count, { color: s.color }]}>{count}</Text>
              <Text style={[smartStyles.label, { color: colors.mutedForeground }]}>{s.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

interface EmptyStateProps {
  hasSearch: boolean;
  hasFilter: boolean;
  showBlocked: boolean;
  onClearFilters: () => void;
  colors: Colors;
}

function EmptyState({ hasSearch, hasFilter, showBlocked, onClearFilters, colors }: EmptyStateProps) {
  if (showBlocked) {
    return (
      <View style={emptyStyles.wrap}>
        <Feather name="slash" size={36} color={colors.border} />
        <Text style={[emptyStyles.title, { color: colors.mutedForeground }]}>No blocked messages</Text>
      </View>
    );
  }
  if (hasSearch || hasFilter) {
    return (
      <View style={emptyStyles.wrap}>
        <Feather name="search" size={36} color={colors.border} />
        <Text style={[emptyStyles.title, { color: colors.mutedForeground }]}>
          No FanMail matches this filter.
        </Text>
        <Text style={[emptyStyles.desc, { color: colors.border }]}>
          Try clearing search or switching back to All.
        </Text>
        <Pressable
          onPress={onClearFilters}
          style={[emptyStyles.clearBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="x" size={14} color={colors.mutedForeground} />
          <Text style={[emptyStyles.clearText, { color: colors.mutedForeground }]}>Clear Filters</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={emptyStyles.wrap}>
      <Feather name="inbox" size={36} color={colors.border} />
      <Text style={[emptyStyles.title, { color: colors.mutedForeground }]}>No messages yet</Text>
      <Text style={[emptyStyles.desc, { color: colors.border }]}>
        Share your ShowLine number to start collecting fan messages
      </Text>
    </View>
  );
}

export default function FanMailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    fanMailMessages,
    pinMessage, saveMessage, makeVIP, blockSender,
    replyToMessage, moveToLiveLine, moveToCollab,
  } = useMessages();
  const { addBlocked } = useShowLine();

  const [searchText, setSearchText]       = useState("");
  const [activeFilter, setActiveFilter]   = useState<FilterView>("All");
  const [activeSort, setActiveSort]       = useState<SortOption>("newest");
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [showBlocked, setShowBlocked]     = useState(false);

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 0;

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then((raw) => {
      if (!raw) return;
      try {
        const { filter, sort } = JSON.parse(raw);
        if (filter) setActiveFilter(filter as FilterView);
        if (sort)   setActiveSort(sort as SortOption);
      } catch {}
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ filter: activeFilter, sort: activeSort })).catch(() => {});
  }, [activeFilter, activeSort]);

  const baseMsgs = useMemo(
    () => fanMailMessages.filter((m) => !m.isBlocked),
    [fanMailMessages]
  );

  const smartCounts = useMemo(
    () => ({
      needs_reply: baseMsgs.filter((m) => !m.reply).length,
      content:     baseMsgs.filter((m) => m.tags.includes("Topic Idea") || m.tags.includes("Story")).length,
      vip:         baseMsgs.filter((m) => m.isVIP).length,
      pinned:      baseMsgs.filter((m) => m.isPinned).length,
    }),
    [baseMsgs]
  );

  const visible = useMemo(() => {
    if (showBlocked) return fanMailMessages.filter((m) => m.isBlocked);

    let result = [...baseMsgs];

    const q = searchText.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (m) =>
          m.sender.toLowerCase().includes(q) ||
          (m.handle ?? "").toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    switch (activeFilter) {
      case "Pinned": result = result.filter((m) => m.isPinned); break;
      case "Saved":  result = result.filter((m) => m.isSaved);  break;
      case "Unread": result = result.filter((m) => !m.reply);   break;
      case "All": break;
      default:
        result = result.filter((m) => m.tags.includes(activeFilter as MessageTag));
    }

    return applySortFn(result, activeSort);
  }, [fanMailMessages, baseMsgs, showBlocked, searchText, activeFilter, activeSort]);

  const showSmartSections = !showBlocked && activeFilter === "All" && !searchText.trim();
  const hasActiveFilters   = activeFilter !== "All" || searchText.trim() !== "" || activeSort !== "newest";

  const handleClearFilters = () => {
    setSearchText("");
    setActiveFilter("All");
    setActiveSort("newest");
  };

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

  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === activeSort)?.label ?? "Newest";
  const sortActive       = activeSort !== "newest";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>FanMail</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {visible.length} message{visible.length !== 1 ? "s" : ""}
            {hasActiveFilters && !showBlocked ? " · filtered" : ""}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {!showBlocked && (
            <Pressable
              onPress={() => setShowSortPanel((v) => !v)}
              style={[
                styles.sortBtn,
                {
                  backgroundColor: sortActive ? colors.primary + "22" : colors.muted,
                  borderColor:     sortActive ? colors.primary + "44" : "transparent",
                },
              ]}
            >
              <Feather name="sliders" size={13} color={sortActive ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.sortBtnText, { color: sortActive ? colors.primary : colors.mutedForeground }]}>
                {currentSortLabel}
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => { setShowBlocked((v) => !v); setShowSortPanel(false); }}
            style={[styles.iconBtn, { backgroundColor: showBlocked ? "#EF444422" : colors.muted }]}
          >
            <Feather
              name={showBlocked ? "slash" : "filter"}
              size={15}
              color={showBlocked ? colors.destructive : colors.mutedForeground}
            />
          </Pressable>
        </View>
      </View>

      {/* ── Sort panel (toggle) ───────────────────────────────── */}
      {showSortPanel && !showBlocked && (
        <View style={[styles.sortPanel, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
            {SORT_OPTIONS.map((opt) => {
              const active = activeSort === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => { setActiveSort(opt.value); setShowSortPanel(false); }}
                  style={[
                    styles.sortChip,
                    {
                      backgroundColor: active ? colors.primary : colors.muted,
                      borderColor:     active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Feather name={opt.icon} size={12} color={active ? "#fff" : colors.mutedForeground} />
                  <Text style={[styles.sortChipText, { color: active ? "#fff" : colors.mutedForeground }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── Search bar ───────────────────────────────────────── */}
      {!showBlocked && (
        <View style={[styles.searchRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.searchWrap, { backgroundColor: colors.muted }]}>
            <Feather name="search" size={15} color={colors.mutedForeground} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search fans, messages, tags…"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.searchInput, { color: colors.foreground }]}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText("")} hitSlop={8}>
                <Feather name="x-circle" size={15} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* ── Filter chips ─────────────────────────────────────── */}
      {!showBlocked && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={[styles.filterScroll, { borderBottomColor: colors.border }]}
        >
          {FILTER_CHIPS.map((chip) => {
            const active = activeFilter === chip;
            return (
              <Pressable
                key={chip}
                onPress={() => setActiveFilter(active ? "All" : chip)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor:     active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.filterChipText, { color: active ? "#fff" : colors.mutedForeground }]}>
                  {chip}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* ── Blocked banner ───────────────────────────────────── */}
      {showBlocked && (
        <View style={[styles.blockedBanner, { backgroundColor: "#2D0A0A" }]}>
          <Feather name="slash" size={14} color={colors.destructive} />
          <Text style={[styles.blockedText, { color: colors.destructive }]}>Showing blocked messages</Text>
        </View>
      )}

      {/* ── Message list ─────────────────────────────────────── */}
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
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          showSmartSections ? (
            <SmartInboxCards counts={smartCounts} onFilter={setActiveFilter} colors={colors} />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            hasSearch={searchText.trim().length > 0}
            hasFilter={activeFilter !== "All"}
            showBlocked={showBlocked}
            onClearFilters={handleClearFilters}
            colors={colors}
          />
        }
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  title:    { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sortPanel: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  sortRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  sortChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  filterScroll: { flexGrow: 0, borderBottomWidth: 1 },
  filterRow:   { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  blockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    paddingHorizontal: 16,
  },
  blockedText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  list: { padding: 16, gap: 0 },
});

const smartStyles = StyleSheet.create({
  wrap:    { paddingBottom: 4 },
  heading: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, marginBottom: 10 },
  row:     { flexDirection: "row", gap: 10, paddingRight: 8 },
  card: {
    width: 100,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  count: { fontSize: 22, fontFamily: "Inter_700Bold" },
  label: { fontSize: 11, fontFamily: "Inter_500Medium", lineHeight: 14 },
});

const emptyStyles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 10, paddingTop: 60, paddingHorizontal: 24 },
  title: { fontSize: 16, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  desc:  { fontSize: 13, fontFamily: "Inter_400Regular",  textAlign: "center", maxWidth: 260 },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  clearText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
