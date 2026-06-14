import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
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
import { useShowLine } from "@/context/ShowLineContext";
import { useColors } from "@/hooks/useColors";
import type { AutoReplies } from "@/types";

const TEMPLATE_INFO: Record<
  keyof AutoReplies,
  { label: string; desc: string; color: string; icon: string }
> = {
  fanmail: {
    label: "FanMail",
    desc: "Sent when fans message your general line",
    color: "#8B5CF6",
    icon: "mail",
  },
  livelineOpen: {
    label: "LiveLine (Open)",
    desc: "Sent during an active live session",
    color: "#EF4444",
    icon: "radio",
  },
  livelineClosed: {
    label: "LiveLine (Closed)",
    desc: "Sent when live session is inactive",
    color: "#6B7280",
    icon: "radio",
  },
  backstage: {
    label: "Backstage Line",
    desc: "Sent to VIP superfans",
    color: "#F59E0B",
    icon: "star",
  },
  collab: {
    label: "Collab Line",
    desc: "Sent to business inquiry senders",
    color: "#3B82F6",
    icon: "briefcase",
  },
};

const KEYS: (keyof AutoReplies)[] = [
  "fanmail",
  "livelineOpen",
  "livelineClosed",
  "backstage",
  "collab",
];

export default function AutoReplyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { autoReplies, updateAutoReply } = useShowLine();
  const { showBanner } = useBanner();
  const [editing, setEditing] = useState<keyof AutoReplies | null>(null);
  const [draft, setDraft] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const startEdit = (key: keyof AutoReplies) => {
    setEditing(key);
    setDraft(autoReplies[key]);
  };

  const saveEdit = () => {
    if (!editing) return;
    if (!draft.trim()) {
      Alert.alert("Empty Template", "Auto-reply cannot be empty.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateAutoReply(editing, draft.trim());
    showBanner({
      icon: "check-circle",
      title: "Auto-Reply Saved",
      message: `${TEMPLATE_INFO[editing].label} template updated`,
      color: "#10B981",
    });
    setEditing(null);
    setDraft("");
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft("");
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.intro}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Auto-Reply Templates</Text>
        <Text style={[styles.pageDesc, { color: colors.mutedForeground }]}>
          Each line sends its own auto-reply when someone messages you. Edit templates below.
        </Text>
      </View>

      {KEYS.map((key) => {
        const info = TEMPLATE_INFO[key];
        const isEditing = editing === key;

        return (
          <View
            key={key}
            style={[
              styles.templateCard,
              {
                backgroundColor: colors.card,
                borderColor: isEditing ? info.color + "88" : colors.border,
                borderWidth: isEditing ? 1.5 : 0,
              },
            ]}
          >
            <View style={styles.templateHeader}>
              <View style={[styles.templateIcon, { backgroundColor: info.color + "22" }]}>
                <Feather name={info.icon as any} size={16} color={info.color} />
              </View>
              <View style={styles.templateMeta}>
                <Text style={[styles.templateLabel, { color: colors.foreground }]}>
                  {info.label}
                </Text>
                <Text style={[styles.templateDesc, { color: colors.mutedForeground }]}>
                  {info.desc}
                </Text>
              </View>
              {!isEditing && (
                <Pressable
                  onPress={() => startEdit(key)}
                  style={[styles.editBtn, { backgroundColor: colors.muted }]}
                >
                  <Feather name="edit-2" size={14} color={colors.mutedForeground} />
                </Pressable>
              )}
            </View>

            {isEditing ? (
              <>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  style={[
                    styles.editor,
                    {
                      color: colors.foreground,
                      backgroundColor: colors.muted,
                      borderColor: info.color + "44",
                    },
                  ]}
                  multiline
                  autoFocus
                  placeholderTextColor={colors.mutedForeground}
                  placeholder="Enter auto-reply message..."
                />
                <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
                  {draft.length} / 280 chars
                </Text>
                <View style={styles.editActions}>
                  <Pressable
                    onPress={cancelEdit}
                    style={[styles.cancelBtn, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={saveEdit}
                    style={[styles.saveBtn, { backgroundColor: info.color }]}
                  >
                    <Feather name="check" size={16} color="#fff" />
                    <Text style={styles.saveText}>Save</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <Text style={[styles.templateText, { color: colors.foreground }]}>
                {autoReplies[key]}
              </Text>
            )}
          </View>
        );
      })}

      <View style={[styles.note, { backgroundColor: colors.muted }]}>
        <Feather name="info" size={14} color={colors.mutedForeground} />
        <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
          Auto-replies are sent once per conversation. They won't spam repeat messages.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  intro: { gap: 6, marginBottom: 4 },
  pageTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  pageDesc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  templateCard: { borderRadius: 16, padding: 16, gap: 12 },
  templateHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  templateIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  templateMeta: { flex: 1, gap: 2 },
  templateLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  templateDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  templateText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  editor: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    minHeight: 80,
    maxHeight: 160,
    textAlignVertical: "top",
    borderWidth: 1,
  },
  charCount: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right" },
  editActions: { flexDirection: "row", gap: 8 },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cancelText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  saveBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  note: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: "flex-start",
  },
  noteText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
