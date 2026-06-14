import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatusPill } from "@/components/StatusPill";
import { useBanner } from "@/context/BannerContext";
import { useMessages } from "@/context/MessagesContext";
import { useSessionHistory } from "@/context/SessionHistoryContext";
import { useShowLine } from "@/context/ShowLineContext";
import { type SimFrequency, useSimulation } from "@/context/SimulationContext";
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
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: colors.card, opacity: pressed ? 0.85 : 1 },
      ]}
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
  const { lineStatuses, creatorType, clearBlockedContacts, resetVIPProfiles, vipContacts } =
    useShowLine();
  const { resetMessages, unblockAll } = useMessages();
  const { enabled, frequency, setEnabled, setFrequency } = useSimulation();
  const { sessions, clearHistory } = useSessionHistory();
  const { showBanner } = useBanner();

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

  const FREQ_OPTIONS: { id: SimFrequency; label: string; sublabel: string }[] = [
    { id: "low", label: "Low", sublabel: "~45s" },
    { id: "normal", label: "Normal", sublabel: "~20s" },
    { id: "high", label: "High", sublabel: "~8s" },
  ];

  const handleResetData = () => {
    Alert.alert(
      "Reset Mock Data",
      "This restores all fan messages, VIP profiles, notes, and session history to demo state. Line settings and onboarding are kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: () => {
            resetMessages();
            clearHistory();
            resetVIPProfiles();
            showBanner({
              icon: "refresh-cw",
              title: "Mock Data Reset",
              message: "Messages, VIP profiles, and session history restored",
              color: "#10B981",
            });
          },
        },
      ]
    );
  };

  const handleClearBlocked = () => {
    Alert.alert(
      "Clear Blocked Contacts",
      "This will unblock all contacts. VIP notes and access levels are not affected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: () => {
            clearBlockedContacts();
            unblockAll();
            showBanner({
              icon: "check-circle",
              title: "Blocked Contacts Cleared",
              message: "All contacts have been unblocked",
              color: "#10B981",
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 },
      ]}
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
        <View
          style={[
            styles.planBadge,
            { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" },
          ]}
        >
          <Text style={[styles.planText, { color: colors.primary }]}>Starter</Text>
        </View>
      </View>

      {/* Lines status */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>YOUR LINES</Text>
      <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
        {(
          [
            { label: "FanMail", key: "fanmail" as const },
            { label: "LiveLine", key: "liveline" as const },
            { label: "Backstage", key: "backstage" as const },
            { label: "Collab", key: "collab" as const },
          ] as const
        ).map((l, i, arr) => (
          <React.Fragment key={l.key}>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.foreground }]}>{l.label}</Text>
              <StatusPill status={lineStatuses[l.key]} size="sm" />
            </View>
            {i < arr.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Manage */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>MANAGE</Text>

      <MenuItem
        icon="star"
        label="Backstage Line"
        desc={`${vipContacts.length} VIP fan${vipContacts.length !== 1 ? "s" : ""}`}
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
        icon="film"
        label="Post-Show Recaps"
        desc={
          sessions.length > 0
            ? `${sessions.length} session${sessions.length !== 1 ? "s" : ""} saved`
            : "No sessions yet"
        }
        accentColor="#8B5CF6"
        onPress={() => router.push("/sessions")}
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

      {/* Account */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>

      <MenuItem
        icon="trending-up"
        label="Upgrade Plan"
        desc="Unlock LiveLine, Backstage & more"
        accentColor="#8B5CF6"
        badge="PRO"
        onPress={() => router.push("/upgrade")}
      />

      {/* Demo Mode */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>DEMO MODE</Text>

      <View style={[styles.demoCard, { backgroundColor: colors.card }]}>
        {/* Enable toggle */}
        <View style={styles.demoToggleRow}>
          <View style={styles.demoToggleText}>
            <View style={styles.demoTitleRow}>
              <View
                style={[
                  styles.demoDot,
                  { backgroundColor: enabled ? "#10B981" : colors.border },
                ]}
              />
              <Text style={[styles.demoTitle, { color: colors.foreground }]}>
                Simulate Messages
              </Text>
            </View>
            <Text style={[styles.demoDesc, { color: colors.mutedForeground }]}>
              Auto-generates fan messages for testing
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={(v) => {
              setEnabled(v);
              showBanner({
                icon: "zap",
                title: v ? "Simulation Enabled" : "Simulation Disabled",
                message: v
                  ? "New fan messages will arrive periodically"
                  : "Message simulation paused",
                color: "#8B5CF6",
              });
            }}
            trackColor={{ false: colors.border, true: colors.primary + "88" }}
            thumbColor={enabled ? colors.primary : colors.mutedForeground}
          />
        </View>

        {/* Frequency selector */}
        {enabled && (
          <>
            <View style={[styles.demoDivider, { backgroundColor: colors.border }]} />
            <View style={styles.freqSection}>
              <Text style={[styles.freqLabel, { color: colors.mutedForeground }]}>
                Message Frequency
              </Text>
              <View style={styles.freqBtns}>
                {FREQ_OPTIONS.map((f) => {
                  const active = frequency === f.id;
                  return (
                    <Pressable
                      key={f.id}
                      onPress={() => setFrequency(f.id)}
                      style={[
                        styles.freqBtn,
                        {
                          backgroundColor: active ? colors.primary : colors.muted,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.freqBtnText,
                          { color: active ? "#fff" : colors.mutedForeground },
                        ]}
                      >
                        {f.label}
                      </Text>
                      <Text
                        style={[
                          styles.freqBtnSub,
                          { color: active ? "rgba(255,255,255,0.7)" : colors.border },
                        ]}
                      >
                        {f.sublabel}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        )}

        <View style={[styles.demoDivider, { backgroundColor: colors.border }]} />

        {/* Reset mock data */}
        <Pressable
          onPress={handleResetData}
          style={({ pressed }) => [styles.demoAction, { opacity: pressed ? 0.7 : 1 }]}
        >
          <View style={[styles.demoActionIcon, { backgroundColor: "#10B98120" }]}>
            <Feather name="refresh-cw" size={16} color="#10B981" />
          </View>
          <View style={styles.demoActionText}>
            <Text style={[styles.demoActionLabel, { color: colors.foreground }]}>
              Reset Mock Data
            </Text>
            <Text style={[styles.demoActionDesc, { color: colors.mutedForeground }]}>
              Restore messages, VIP profiles, and session history
            </Text>
          </View>
        </Pressable>

        <View style={[styles.demoDivider, { backgroundColor: colors.border }]} />

        {/* Clear blocked */}
        <Pressable
          onPress={handleClearBlocked}
          style={({ pressed }) => [styles.demoAction, { opacity: pressed ? 0.7 : 1 }]}
        >
          <View style={[styles.demoActionIcon, { backgroundColor: "#EF444420" }]}>
            <Feather name="slash" size={16} color={colors.destructive} />
          </View>
          <View style={styles.demoActionText}>
            <Text style={[styles.demoActionLabel, { color: colors.foreground }]}>
              Clear Blocked Contacts
            </Text>
            <Text style={[styles.demoActionDesc, { color: colors.mutedForeground }]}>
              Unblock everyone — VIP notes are kept
            </Text>
          </View>
        </Pressable>
      </View>

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
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  planText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginTop: 6,
  },
  statusCard: { borderRadius: 16, overflow: "hidden", marginBottom: 4 },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    paddingHorizontal: 16,
  },
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
  demoCard: { borderRadius: 16, padding: 16, gap: 0 },
  demoToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  demoToggleText: { flex: 1, gap: 3 },
  demoTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  demoDot: { width: 8, height: 8, borderRadius: 4 },
  demoTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  demoDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  demoDivider: { height: 1, marginVertical: 14 },
  freqSection: { gap: 10 },
  freqLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  freqBtns: { flexDirection: "row", gap: 8 },
  freqBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    gap: 2,
  },
  freqBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  freqBtnSub: { fontSize: 10, fontFamily: "Inter_400Regular" },
  demoAction: { flexDirection: "row", alignItems: "center", gap: 12 },
  demoActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  demoActionText: { flex: 1, gap: 2 },
  demoActionLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  demoActionDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  footer: { gap: 4, alignItems: "center", paddingTop: 16 },
  footerText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
