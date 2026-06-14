import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBanner } from "@/context/BannerContext";
import { useShowLine } from "@/context/ShowLineContext";
import { useColors } from "@/hooks/useColors";

const POLICIES = [
  {
    icon: "shield",
    title: "No Anonymous Spam",
    desc: "ShowLine is not a tool for anonymous spam. All senders are tracked and repeat violators are permanently banned.",
  },
  {
    icon: "alert-octagon",
    title: "No Harassment",
    desc: "Harassment, threats, or targeted abuse of any creator is strictly prohibited and will result in account removal.",
  },
  {
    icon: "lock",
    title: "No Verification Code Abuse",
    desc: "You may not use ShowLine numbers to receive verification codes, bypass 2FA, or circumvent other services.",
  },
  {
    icon: "slash",
    title: "No Illegal Use",
    desc: "ShowLine may not be used for illegal activities of any kind, including fraud, phishing, or impersonation.",
  },
];

export default function SafetyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { blockedContacts, removeBlocked } = useShowLine();
  const { showBanner } = useBanner();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const handleUnblock = (id: string, name: string) => {
    Alert.alert("Unblock Contact", `Allow ${name} to message you again?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unblock",
        onPress: () => {
          removeBlocked(id);
          showBanner({
            icon: "check-circle",
            title: "Contact Unblocked",
            message: `${name} can message you again`,
            color: "#10B981",
          });
        },
      },
    ]);
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
      <View style={styles.header}>
        <View style={[styles.shieldWrap, { backgroundColor: colors.success + "22" }]}>
          <Feather name="shield" size={28} color={colors.success} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.foreground }]}>Safety Controls</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            ShowLine is a professional creator tool. Here's how we keep it safe.
          </Text>
        </View>
      </View>

      {/* Blocked list */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          BLOCKED CONTACTS
        </Text>
        {blockedContacts.length === 0 ? (
          <View style={[styles.emptyBlock, { backgroundColor: colors.card }]}>
            <Feather name="check-circle" size={24} color={colors.success} />
            <Text style={[styles.emptyBlockText, { color: colors.mutedForeground }]}>
              No blocked contacts
            </Text>
          </View>
        ) : (
          blockedContacts.map((b) => (
            <View key={b.id} style={[styles.blockedCard, { backgroundColor: colors.card }]}>
              <View style={[styles.blockedAvatar, { backgroundColor: "#EF444422" }]}>
                <Text style={[styles.blockedAvatarText, { color: colors.destructive }]}>
                  {b.name[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.blockedInfo}>
                <Text style={[styles.blockedName, { color: colors.foreground }]}>{b.name}</Text>
                {b.handle && (
                  <Text style={[styles.blockedHandle, { color: colors.mutedForeground }]}>
                    {b.handle}
                  </Text>
                )}
                {b.reason && (
                  <Text style={[styles.blockedReason, { color: colors.mutedForeground }]}>
                    {b.reason}
                  </Text>
                )}
                <Text style={[styles.blockedAt, { color: colors.border }]}>
                  Blocked {b.blockedAt}
                </Text>
              </View>
              <Pressable
                onPress={() => handleUnblock(b.id, b.name)}
                style={[styles.unblockBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.unblockText, { color: colors.mutedForeground }]}>Unblock</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      {/* Usage policies */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          USAGE POLICIES
        </Text>
        {POLICIES.map((p) => (
          <View key={p.title} style={[styles.policyCard, { backgroundColor: colors.card }]}>
            <View style={[styles.policyIcon, { backgroundColor: "#EF444420" }]}>
              <Feather name={p.icon as any} size={18} color={colors.destructive} />
            </View>
            <View style={styles.policyText}>
              <Text style={[styles.policyTitle, { color: colors.foreground }]}>{p.title}</Text>
              <Text style={[styles.policyDesc, { color: colors.mutedForeground }]}>{p.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View
        style={[styles.reportBox, { backgroundColor: "#EF444411", borderColor: "#EF444433" }]}
      >
        <Feather name="flag" size={16} color={colors.destructive} />
        <View style={styles.reportText}>
          <Text style={[styles.reportTitle, { color: colors.destructive }]}>Report Abuse</Text>
          <Text style={[styles.reportDesc, { color: colors.mutedForeground }]}>
            If you believe someone is misusing ShowLine, you can report them from any message using
            the Block action. Severe cases can be escalated to our trust & safety team.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },
  header: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  shieldWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, gap: 4 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  emptyBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
  },
  emptyBlockText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  blockedCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  blockedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  blockedAvatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  blockedInfo: { flex: 1, gap: 2 },
  blockedName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  blockedHandle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  blockedReason: { fontSize: 12, fontFamily: "Inter_400Regular" },
  blockedAt: { fontSize: 11, fontFamily: "Inter_400Regular" },
  unblockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  unblockText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  policyCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    alignItems: "flex-start",
  },
  policyIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  policyText: { flex: 1, gap: 4 },
  policyTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  policyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  reportBox: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  reportText: { flex: 1, gap: 4 },
  reportTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reportDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
