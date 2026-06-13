import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

import { StatusPill } from "@/components/StatusPill";
import { useShowLine } from "@/context/ShowLineContext";
import { useColors } from "@/hooks/useColors";

interface MenuItemProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  desc: string;
  accentColor: string;
  badge?: string;
  onPress: () => void;
}

function MenuItem({ icon, label, desc, accentColor, badge, onPress }: MenuItemProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.item, { backgroundColor: colors.card, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={[styles.itemIcon, { backgroundColor: accentColor + "22" }]}>
        <Feather name={icon} size={20} color={accentColor} />
      </View>
      <View style={styles.itemText}>
        <Text style={[styles.itemLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.itemDesc, { color: colors.mutedForeground }]}>{desc}</Text>
      </View>
      {badge && (
        <View style={[styles.badge, { backgroundColor: accentColor }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function MoreScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lineStatuses, creatorType } = useShowLine();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 0;

  const CREATOR_LABELS: Record<string, string> = {
    podcaster: "Podcaster",
    streamer: "Streamer",
    tiktokyoutube: "TikTok / YouTube",
    musician: "Musician",
    liveseller: "Live Seller",
    coach: "Coach / Educator",
    other: "Creator",
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile */}
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <View style={[styles.profileAvatar, { backgroundColor: colors.primary + "22" }]}>
          <Feather name="user" size={28} color={colors.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.foreground }]}>Your ShowLine</Text>
          <Text style={[styles.profileType, { color: colors.mutedForeground }]}>
            {CREATOR_LABELS[creatorType ?? "other"] ?? "Creator"}
          </Text>
          <Text style={[styles.profileNum, { color: colors.primary }]}>(555) 014-SHOW</Text>
        </View>
        <View style={[styles.planBadge, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
          <Text style={[styles.planText, { color: colors.primary }]}>Starter</Text>
        </View>
      </View>

      {/* Lines status */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>YOUR LINES</Text>
      <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
        {[
          { label: "FanMail", key: "fanmail" as const },
          { label: "LiveLine", key: "liveline" as const },
          { label: "Backstage", key: "backstage" as const },
          { label: "Collab", key: "collab" as const },
        ].map((l, i, arr) => (
          <React.Fragment key={l.key}>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.foreground }]}>{l.label}</Text>
              <StatusPill status={lineStatuses[l.key]} size="sm" />
            </View>
            {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
          </React.Fragment>
        ))}
      </View>

      {/* Settings */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>MANAGE</Text>

      <MenuItem
        icon="star"
        label="Backstage Line"
        desc="VIP superfan-only inbox"
        accentColor="#F59E0B"
        onPress={() => router.push("/backstage")}
      />
      <MenuItem
        icon="briefcase"
        label="Collab Line"
        desc="Business inquiries & sponsors"
        accentColor="#3B82F6"
        onPress={() => router.push("/collab")}
      />
      <MenuItem
        icon="zap"
        label="Auto-Reply Settings"
        desc="Manage auto-reply templates"
        accentColor="#8B5CF6"
        onPress={() => router.push("/autoreply")}
      />
      <MenuItem
        icon="shield"
        label="Safety Controls"
        desc="Blocked contacts & policies"
        accentColor="#10B981"
        onPress={() => router.push("/safety")}
      />

      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>

      <MenuItem
        icon="trending-up"
        label="Upgrade Plan"
        desc="Unlock LiveLine, Backstage & more"
        accentColor="#8B5CF6"
        badge="PRO"
        onPress={() => router.push("/upgrade")}
      />

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          ShowLine v1.0 — Creator Fan Phone System
        </Text>
        <Text style={[styles.footerText, { color: colors.border }]}>
          Real phone number integration coming soon
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 10 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 14,
    marginBottom: 8,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 17, fontFamily: "Inter_700Bold" },
  profileType: { fontSize: 12, fontFamily: "Inter_400Regular" },
  profileNum: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  planBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  planText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, marginTop: 6 },
  statusCard: { borderRadius: 16, overflow: "hidden", marginBottom: 4 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, paddingHorizontal: 16 },
  statusLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  divider: { height: 1, marginHorizontal: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: { flex: 1, gap: 2 },
  itemLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  itemDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  footer: { gap: 4, alignItems: "center", paddingTop: 16 },
  footerText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
