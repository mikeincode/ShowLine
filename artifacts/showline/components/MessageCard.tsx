import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { TagBadge } from "@/components/TagBadge";
import { useBanner } from "@/context/BannerContext";
import { useColors } from "@/hooks/useColors";
import type { FanMessage } from "@/types";

interface MessageCardProps {
  message: FanMessage;
  onPin: () => void;
  onSave: () => void;
  onMakeVIP: () => void;
  onBlock: () => void;
  onReply: (text: string) => void;
  onMoveToLiveLine?: () => void;
  onMoveToCollab?: () => void;
}

export function MessageCard({
  message,
  onPin,
  onSave,
  onMakeVIP,
  onBlock,
  onReply,
  onMoveToLiveLine,
  onMoveToCollab,
}: MessageCardProps) {
  const colors = useColors();
  const { showBanner } = useBanner();
  const [expanded, setExpanded]   = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);

  const isUnread   = !message.reply && !message.isBlocked;
  const needsReply = message.tags.includes("Needs Reply") && !message.reply;

  const handleBlock = () => {
    Alert.alert(
      "Block Sender",
      `Block ${message.sender}? They won't be able to message you.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => {
            onBlock();
            showBanner({
              icon: "slash",
              title: "Contact Blocked",
              message: `${message.sender} can no longer message you`,
              color: "#EF4444",
            });
          },
        },
      ]
    );
  };

  const handleMakeVIP = () => {
    onMakeVIP();
    showBanner({
      icon: "award",
      title: "VIP Added",
      message: `${message.sender} added to your Backstage Line`,
      color: "#F59E0B",
    });
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onReply(replyText.trim());
    showBanner({
      icon: "send",
      title: "Reply Sent",
      message: `Replied to ${message.sender}`,
      color: "#8B5CF6",
    });
    setReplyText("");
    setShowReply(false);
  };

  // Card accent: VIP gets gold border; Needs Reply gets amber left accent
  const cardBorderColor = message.isVIP ? "#F59E0B44" : needsReply ? "#F59E0B33" : colors.border;
  const cardBorderWidth = message.isVIP || needsReply ? 1 : 0;

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      style={[
        styles.card,
        {
          backgroundColor: message.isPinned ? colors.muted : colors.card,
          borderColor: cardBorderColor,
          borderWidth: cardBorderWidth,
        },
      ]}
    >
      {/* Left accent bar for "Needs Reply" urgency */}
      {needsReply && (
        <View style={[styles.urgentBar, { backgroundColor: "#F59E0B" }]} />
      )}

      {/* ── Status bar (pinned / saved / unread) ──────────── */}
      {(message.isPinned || message.isSaved || isUnread) && (
        <View style={styles.statusBar}>
          {message.isPinned && (
            <View style={styles.statusPill}>
              <Feather name="bookmark" size={10} color={colors.primary} />
              <Text style={[styles.statusText, { color: colors.primary }]}>Pinned</Text>
            </View>
          )}
          {message.isSaved && (
            <View style={styles.statusPill}>
              <Feather name="star" size={10} color="#F59E0B" />
              <Text style={[styles.statusText, { color: "#F59E0B" }]}>Saved</Text>
            </View>
          )}
          {isUnread && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          )}
        </View>
      )}

      {/* ── Header: avatar + meta + timestamp ─────────────── */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {message.sender[0].toUpperCase()}
          </Text>
          {message.isVIP && (
            <View style={styles.vipDot}>
              <Text style={styles.vipDotText}>★</Text>
            </View>
          )}
        </View>

        <View style={styles.meta}>
          <View style={styles.nameRow}>
            <Text style={[styles.sender, { color: colors.foreground }]}>{message.sender}</Text>
            {message.isVIP && (
              <View style={[styles.vipBadge, { backgroundColor: "#F59E0B22" }]}>
                <Text style={styles.vipBadgeText}>VIP Fan</Text>
              </View>
            )}
          </View>
          {message.handle && (
            <Text style={[styles.handle, { color: colors.mutedForeground }]}>{message.handle}</Text>
          )}
        </View>

        <Text style={[styles.time, { color: colors.mutedForeground }]}>{message.timestamp}</Text>
      </View>

      {/* ── Message content ───────────────────────────────── */}
      <Text
        style={[styles.content, { color: colors.foreground }]}
        numberOfLines={expanded ? undefined : 2}
      >
        {message.content}
      </Text>

      {/* ── Reply preview ─────────────────────────────────── */}
      {message.reply && (
        <View style={[styles.replyPreview, { backgroundColor: colors.muted }]}>
          <Feather name="corner-down-right" size={12} color={colors.primary} />
          <Text style={[styles.replyText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {message.reply}
          </Text>
        </View>
      )}

      {/* ── Tags ──────────────────────────────────────────── */}
      {message.tags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tags}>
          <View style={styles.tagsInner}>
            {message.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── Actions (expanded) ────────────────────────────── */}
      {expanded && (
        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          <Pressable onPress={onPin} style={styles.action}>
            <Feather
              name="bookmark"
              size={16}
              color={message.isPinned ? colors.primary : colors.mutedForeground}
            />
            <Text style={[styles.actionText, { color: message.isPinned ? colors.primary : colors.mutedForeground }]}>
              {message.isPinned ? "Unpin" : "Pin"}
            </Text>
          </Pressable>

          <Pressable onPress={onSave} style={styles.action}>
            <Feather name="star" size={16} color={message.isSaved ? "#F59E0B" : colors.mutedForeground} />
            <Text style={[styles.actionText, { color: message.isSaved ? "#F59E0B" : colors.mutedForeground }]}>
              {message.isSaved ? "Saved" : "Save"}
            </Text>
          </Pressable>

          {!message.isVIP && (
            <Pressable onPress={handleMakeVIP} style={styles.action}>
              <Feather name="award" size={16} color={colors.mutedForeground} />
              <Text style={[styles.actionText, { color: colors.mutedForeground }]}>VIP</Text>
            </Pressable>
          )}

          <Pressable onPress={() => setShowReply((v) => !v)} style={styles.action}>
            <Feather name="send" size={16} color={colors.mutedForeground} />
            <Text style={[styles.actionText, { color: colors.mutedForeground }]}>Reply</Text>
          </Pressable>

          {onMoveToLiveLine && (
            <Pressable onPress={onMoveToLiveLine} style={styles.action}>
              <Feather name="radio" size={16} color={colors.mutedForeground} />
              <Text style={[styles.actionText, { color: colors.mutedForeground }]}>Live</Text>
            </Pressable>
          )}

          {onMoveToCollab && (
            <Pressable onPress={onMoveToCollab} style={styles.action}>
              <Feather name="briefcase" size={16} color={colors.mutedForeground} />
              <Text style={[styles.actionText, { color: colors.mutedForeground }]}>Collab</Text>
            </Pressable>
          )}

          <Pressable onPress={handleBlock} style={styles.action}>
            <Feather name="slash" size={16} color={colors.destructive} />
            <Text style={[styles.actionText, { color: colors.destructive }]}>Block</Text>
          </Pressable>
        </View>
      )}

      {/* ── Reply box (expanded + showReply) ──────────────── */}
      {expanded && showReply && (
        <View style={[styles.replyBox, { backgroundColor: colors.muted }]}>
          <TextInput
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Write a reply..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.replyInput, { color: colors.foreground }]}
            multiline
            autoFocus
          />
          <Pressable
            onPress={handleSendReply}
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="send" size={14} color="#fff" />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 10,
    overflow: "hidden",
  },
  urgentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginLeft: "auto",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  vipDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#F59E0B",
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  vipDotText: {
    fontSize: 8,
    color: "#000",
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  sender: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  vipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
  },
  vipBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#F59E0B",
    letterSpacing: 0.2,
  },
  handle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  content: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 8,
  },
  replyText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  tags: {
    flexGrow: 0,
  },
  tagsInner: {
    flexDirection: "row",
    gap: 6,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  replyBox: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    maxHeight: 80,
    minHeight: 36,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
