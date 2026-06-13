import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { StatusPill } from "@/components/StatusPill";
import { useColors } from "@/hooks/useColors";
import type { LineStatus } from "@/types";

interface LineCardProps {
  name: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof Feather>["name"];
  accentColor: string;
  status: LineStatus;
  unreadCount: number;
  lastMessage?: string;
  onPress: () => void;
  primaryActionLabel: string;
  primaryActionIcon: React.ComponentProps<typeof Feather>["name"];
  onPrimaryAction: () => void;
  secondaryActionLabel?: string;
  secondaryActionIcon?: React.ComponentProps<typeof Feather>["name"];
  onSecondaryAction?: () => void;
}

export function LineCard({
  name,
  subtitle,
  iconName,
  accentColor,
  status,
  unreadCount,
  lastMessage,
  onPress,
  primaryActionLabel,
  primaryActionIcon,
  onPrimaryAction,
  secondaryActionLabel,
  secondaryActionIcon,
  onSecondaryAction,
}: LineCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: colors.card, opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={[styles.iconBar, { borderLeftColor: accentColor }]}>
        <View style={[styles.iconWrap, { backgroundColor: accentColor + "22" }]}>
          <Feather name={iconName} size={20} color={accentColor} />
        </View>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: colors.foreground }]}>{name}</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
        </View>
        <View style={styles.rightTop}>
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: accentColor }]}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statusRow}>
        <StatusPill status={status} size="sm" />
        {lastMessage && (
          <Text style={[styles.preview, { color: colors.mutedForeground }]} numberOfLines={1}>
            {lastMessage}
          </Text>
        )}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.actions}>
        <Pressable
          onPress={onPrimaryAction}
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: accentColor + "18", opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name={primaryActionIcon} size={14} color={accentColor} />
          <Text style={[styles.actionText, { color: accentColor }]}>{primaryActionLabel}</Text>
        </Pressable>
        {secondaryActionLabel && onSecondaryAction && secondaryActionIcon && (
          <Pressable
            onPress={onSecondaryAction}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: colors.muted, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name={secondaryActionIcon} size={14} color={colors.mutedForeground} />
            <Text style={[styles.actionText, { color: colors.mutedForeground }]}>
              {secondaryActionLabel}
            </Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  iconBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderLeftWidth: 3,
    paddingLeft: 12,
    borderRadius: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  rightTop: {
    alignItems: "flex-end",
    gap: 4,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  preview: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
