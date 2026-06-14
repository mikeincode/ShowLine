import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBanner } from "@/context/BannerContext";
import { useMessages } from "@/context/MessagesContext";
import { useShowLine } from "@/context/ShowLineContext";
import { useColors } from "@/hooks/useColors";
import type { VIPAccessLevel } from "@/types";

// NOTE: Message history is matched by sender display name (case-insensitive).
// A real backend would use stable fan IDs for exact linking across lines.

const ACCESS_LEVELS: { level: VIPAccessLevel; icon: string; desc: string; color: string }[] = [
  { level: "Standard Fan", icon: "user", desc: "Basic line access", color: "#6B7280" },
  { level: "VIP", icon: "award", desc: "Backstage access", color: "#F59E0B" },
  { level: "Inner Circle", icon: "star", desc: "Top-tier access", color: "#8B5CF6" },
  { level: "Muted", icon: "volume-x", desc: "Hidden from inbox", color: "#F97316" },
  { level: "Blocked", icon: "slash", desc: "No access", color: "#EF4444" },
];

const PRESET_TAGS = [
  "superfan",
  "top-caller",
  "mod-candidate",
  "merch-buyer",
  "event-goer",
  "early-supporter",
  "content-idea",
  "potential-collab",
];

export default function VIPProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { vipContacts, updateVIPContact, removeVIP, addBlocked } = useShowLine();
  const { fanMailMessages, makeVIP, blockSender } = useMessages();
  const { showBanner } = useBanner();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const vip = vipContacts.find((v) => v.id === id);
  const [noteText, setNoteText] = useState(vip?.notes ?? "");
  const [noteDirty, setNoteDirty] = useState(false);

  useEffect(() => {
    if (vip) setNoteText(vip.notes ?? "");
  }, [vip?.id]);

  if (!vip) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="user-x" size={32} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>
          Fan profile not found
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>← Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const currentLevel = vip.accessLevel ?? "VIP";
  const levelMeta = ACCESS_LEVELS.find((l) => l.level === currentLevel) ?? ACCESS_LEVELS[1];
  const currentTags = vip.tags ?? [];

  // Message history: match by sender name (case-insensitive) — real backend uses IDs
  const linkedMessages = fanMailMessages
    .filter((m) => m.sender.toLowerCase() === vip.name.toLowerCase() && !m.isBlocked)
    .slice(0, 6);

  const handleSaveNote = () => {
    updateVIPContact(vip.id, { notes: noteText });
    setNoteDirty(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showBanner({
      icon: "edit-3",
      title: "Note Saved",
      message: `Private note updated for ${vip.name}`,
      color: "#8B5CF6",
    });
  };

  const handleAccessLevelChange = (level: VIPAccessLevel) => {
    if (level === currentLevel) return;
    updateVIPContact(vip.id, { accessLevel: level });
    Haptics.selectionAsync();
    showBanner({
      icon: "shield",
      title: "Access Level Updated",
      message: `${vip.name} → ${level}`,
      color: ACCESS_LEVELS.find((l) => l.level === level)?.color ?? "#8B5CF6",
    });
  };

  const handleToggleTag = (tag: string) => {
    const next = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    updateVIPContact(vip.id, { tags: next });
    Haptics.selectionAsync();
  };

  const handleRemoveVIP = () => {
    Alert.alert(
      "Remove Backstage Access",
      `Remove ${vip.name} from your VIP list? They'll lose Backstage Line access.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove Access",
          style: "destructive",
          onPress: () => {
            removeVIP(vip.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.back();
          },
        },
      ]
    );
  };

  const handleBlock = () => {
    Alert.alert(
      "Block Contact",
      `Block ${vip.name}? This removes them from VIP and blocks all future messages.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => {
            // Find and block their FanMail message if any
            const fm = fanMailMessages.find(
              (m) => m.sender.toLowerCase() === vip.name.toLowerCase()
            );
            if (fm) blockSender(fm.id);
            addBlocked({
              id: vip.id,
              name: vip.name,
              handle: vip.handle,
              reason: "Removed from VIP",
              blockedAt: "Just now",
            });
            removeVIP(vip.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            showBanner({
              icon: "slash",
              title: "Contact Blocked",
              message: `${vip.name} has been blocked`,
              color: "#EF4444",
            });
            router.back();
          },
        },
      ]
    );
  };

  const handleMute = () => {
    updateVIPContact(vip.id, { accessLevel: "Muted" });
    showBanner({
      icon: "volume-x",
      title: "Fan Muted",
      message: `${vip.name}'s messages are now hidden from inbox`,
      color: "#F97316",
    });
  };

  const unusedTags = PRESET_TAGS.filter((t) => !currentTags.includes(t));

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 32 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <View style={[styles.bigAvatar, { backgroundColor: levelMeta.color + "22" }]}>
          <Text style={[styles.bigAvatarText, { color: levelMeta.color }]}>
            {vip.name[0]}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.foreground }]}>{vip.name}</Text>
          <Text style={[styles.profileHandle, { color: colors.mutedForeground }]}>
            {vip.handle}
          </Text>
          {vip.phone && (
            <Text style={[styles.profilePhone, { color: colors.mutedForeground }]}>
              {vip.phone}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.levelPill,
            { backgroundColor: levelMeta.color + "22", borderColor: levelMeta.color + "44" },
          ]}
        >
          <Feather name={levelMeta.icon as any} size={13} color={levelMeta.color} />
          <Text style={[styles.levelPillText, { color: levelMeta.color }]}>
            {currentLevel}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNum, { color: colors.primary }]}>{vip.messages}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Messages</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNum, { color: "#F59E0B" }]}>
            {vip.firstSeen ?? vip.since}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Member Since</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNum, { color: colors.success }]}>
            {vip.source ?? "FanMail"}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Source</Text>
        </View>
      </View>

      {/* Access Level */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        BACKSTAGE ACCESS
      </Text>
      <View style={[styles.accessCard, { backgroundColor: colors.card }]}>
        {ACCESS_LEVELS.map((lvl) => {
          const active = currentLevel === lvl.level;
          return (
            <Pressable
              key={lvl.level}
              onPress={() => handleAccessLevelChange(lvl.level)}
              style={({ pressed }) => [
                styles.accessRow,
                {
                  backgroundColor: active ? lvl.color + "14" : "transparent",
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <View style={[styles.accessIcon, { backgroundColor: lvl.color + "22" }]}>
                <Feather name={lvl.icon as any} size={15} color={lvl.color} />
              </View>
              <View style={styles.accessText}>
                <Text style={[styles.accessLevel, { color: active ? lvl.color : colors.foreground }]}>
                  {lvl.level}
                </Text>
                <Text style={[styles.accessDesc, { color: colors.mutedForeground }]}>
                  {lvl.desc}
                </Text>
              </View>
              {active && <Feather name="check" size={16} color={lvl.color} />}
            </Pressable>
          );
        })}
      </View>

      {/* Private Notes */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        PRIVATE NOTES
      </Text>
      <View style={[styles.notesCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.notesHint, { color: colors.mutedForeground }]}>
          Only you can see these notes. Great for things like "great caller" or "potential mod."
        </Text>
        <TextInput
          value={noteText}
          onChangeText={(t) => {
            setNoteText(t);
            setNoteDirty(true);
          }}
          placeholder='e.g. "Great on-air energy. Potential mod candidate."'
          placeholderTextColor={colors.border}
          multiline
          style={[
            styles.noteInput,
            {
              color: colors.foreground,
              backgroundColor: colors.muted,
              borderColor: noteDirty ? colors.primary + "66" : colors.border,
            },
          ]}
        />
        {noteDirty && (
          <Pressable
            onPress={handleSaveNote}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="save" size={15} color="#fff" />
            <Text style={styles.saveBtnText}>Save Note</Text>
          </Pressable>
        )}
      </View>

      {/* Tags */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>TAGS</Text>
      <View style={[styles.tagsCard, { backgroundColor: colors.card }]}>
        {currentTags.length > 0 && (
          <View style={styles.tagRow}>
            {currentTags.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => handleToggleTag(tag)}
                style={[styles.tagActive, { backgroundColor: colors.primary + "22" }]}
              >
                <Text style={[styles.tagActiveText, { color: colors.primary }]}>{tag}</Text>
                <Feather name="x" size={11} color={colors.primary} />
              </Pressable>
            ))}
          </View>
        )}
        {unusedTags.length > 0 && (
          <>
            <Text style={[styles.addTagsLabel, { color: colors.mutedForeground }]}>
              Add tags:
            </Text>
            <View style={styles.tagRow}>
              {unusedTags.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => handleToggleTag(tag)}
                  style={[styles.tagInactive, { backgroundColor: colors.muted, borderColor: colors.border }]}
                >
                  <Feather name="plus" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.tagInactiveText, { color: colors.mutedForeground }]}>
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
        {currentTags.length === 0 && unusedTags.length === 0 && (
          <Text style={[styles.noTagsText, { color: colors.border }]}>All preset tags applied</Text>
        )}
      </View>

      {/* Message History */}
      {linkedMessages.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            MESSAGE HISTORY
          </Text>
          <View style={styles.historyList}>
            {linkedMessages.map((msg) => (
              <View key={msg.id} style={[styles.historyCard, { backgroundColor: colors.card }]}>
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyLine, { color: colors.primary }]}>
                    {msg.line === "fanmail" ? "FanMail" : msg.line === "liveline" ? "LiveLine" : "Backstage"}
                  </Text>
                  <Text style={[styles.historyTime, { color: colors.mutedForeground }]}>
                    {msg.timestamp}
                  </Text>
                </View>
                <Text style={[styles.historyContent, { color: colors.foreground }]}>
                  {msg.content}
                </Text>
                {msg.tags.length > 0 && (
                  <View style={styles.historyTags}>
                    {msg.tags.map((t) => (
                      <View
                        key={t}
                        style={[styles.historyTag, { backgroundColor: colors.muted }]}
                      >
                        <Text style={[styles.historyTagText, { color: colors.mutedForeground }]}>
                          {t}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </>
      )}

      {/* Danger Zone */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACTIONS</Text>
      <View style={[styles.dangerCard, { backgroundColor: colors.card }]}>
        {currentLevel !== "Muted" && (
          <Pressable
            onPress={handleMute}
            style={({ pressed }) => [
              styles.dangerRow,
              { opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <View style={[styles.dangerIcon, { backgroundColor: "#F9730018" }]}>
              <Feather name="volume-x" size={16} color="#F97316" />
            </View>
            <View style={styles.dangerText}>
              <Text style={[styles.dangerLabel, { color: colors.foreground }]}>
                Mute from Inbox
              </Text>
              <Text style={[styles.dangerDesc, { color: colors.mutedForeground }]}>
                Their messages stay private — hidden from your feed
              </Text>
            </View>
          </Pressable>
        )}

        <View style={[styles.dangerDivider, { backgroundColor: colors.border }]} />

        <Pressable
          onPress={handleRemoveVIP}
          style={({ pressed }) => [styles.dangerRow, { opacity: pressed ? 0.75 : 1 }]}
        >
          <View style={[styles.dangerIcon, { backgroundColor: "#EF444418" }]}>
            <Feather name="user-minus" size={16} color={colors.destructive} />
          </View>
          <View style={styles.dangerText}>
            <Text style={[styles.dangerLabel, { color: colors.destructive }]}>
              Remove Backstage Access
            </Text>
            <Text style={[styles.dangerDesc, { color: colors.mutedForeground }]}>
              They'll lose VIP status but messages are kept
            </Text>
          </View>
        </Pressable>

        <View style={[styles.dangerDivider, { backgroundColor: colors.border }]} />

        <Pressable
          onPress={handleBlock}
          style={({ pressed }) => [styles.dangerRow, { opacity: pressed ? 0.75 : 1 }]}
        >
          <View style={[styles.dangerIcon, { backgroundColor: "#EF444418" }]}>
            <Feather name="slash" size={16} color={colors.destructive} />
          </View>
          <View style={styles.dangerText}>
            <Text style={[styles.dangerLabel, { color: colors.destructive }]}>
              Block Contact
            </Text>
            <Text style={[styles.dangerDesc, { color: colors.mutedForeground }]}>
              Removes access and blocks all future messages
            </Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 10 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  notFoundText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  backLink: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  profileCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 18,
    borderRadius: 18,
  },
  bigAvatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  bigAvatarText: { fontSize: 28, fontFamily: "Inter_700Bold" },
  profileInfo: { flex: 1, gap: 3, paddingTop: 2 },
  profileName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  profileHandle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  profilePhone: { fontSize: 12, fontFamily: "Inter_400Regular" },
  levelPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  levelPillText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 8 },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 13,
    alignItems: "center",
    gap: 3,
  },
  statNum: { fontSize: 14, fontFamily: "Inter_700Bold", textAlign: "center" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginTop: 6,
  },
  accessCard: { borderRadius: 16, overflow: "hidden" },
  accessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    paddingHorizontal: 14,
  },
  accessIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  accessText: { flex: 1, gap: 1 },
  accessLevel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  accessDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  notesCard: { borderRadius: 16, padding: 14, gap: 10 },
  notesHint: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    minHeight: 88,
    textAlignVertical: "top",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  tagsCard: { borderRadius: 16, padding: 14, gap: 10 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  tagActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagActiveText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  addTagsLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  tagInactive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagInactiveText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  noTagsText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  historyList: { gap: 8 },
  historyCard: { borderRadius: 13, padding: 12, gap: 6 },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  historyLine: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  historyTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  historyContent: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  historyTags: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  historyTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  historyTagText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  dangerCard: { borderRadius: 16, overflow: "hidden" },
  dangerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  dangerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerText: { flex: 1, gap: 2 },
  dangerLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  dangerDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  dangerDivider: { height: 1, marginHorizontal: 14 },
});
