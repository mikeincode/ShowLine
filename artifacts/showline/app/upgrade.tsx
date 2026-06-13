import { Feather } from "@expo/vector-icons";
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

import { useColors } from "@/hooks/useColors";

interface Tier {
  name: string;
  price: string;
  tagline: string;
  color: string;
  features: string[];
  highlight?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Starter",
    price: "Free",
    tagline: "Perfect for getting started",
    color: "#6B7280",
    features: [
      "FanMail inbox",
      "1 public creator line",
      "Basic auto-reply",
      "ShowLine creator number (shared)",
      "Up to 100 messages/month",
    ],
  },
  {
    name: "Pro",
    price: "$19 / mo",
    tagline: "For growing creators",
    color: "#8B5CF6",
    highlight: true,
    features: [
      "Everything in Starter",
      "LiveLine — real-time call-ins",
      "Backstage Line — VIP superfans",
      "Saved replies & templates",
      "Dedicated creator number",
      "Unlimited messages",
      "Message tagging & filtering",
    ],
  },
  {
    name: "Studio",
    price: "$49 / mo",
    tagline: "For full-time creators & teams",
    color: "#F59E0B",
    features: [
      "Everything in Pro",
      "Multiple lines & numbers",
      "Moderator tools",
      "Analytics dashboard",
      "Priority support",
      "Custom auto-reply flows",
      "Team access (up to 3 seats)",
    ],
  },
];

export default function UpgradeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Upgrade ShowLine</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Unlock your full creator phone system. Pick the plan that fits your audience.
        </Text>
      </View>

      <View style={[styles.currentBadge, { backgroundColor: colors.card }]}>
        <View style={[styles.currentDot, { backgroundColor: colors.success }]} />
        <Text style={[styles.currentText, { color: colors.foreground }]}>
          You're on the <Text style={{ fontFamily: "Inter_700Bold" }}>Starter</Text> plan
        </Text>
      </View>

      {TIERS.map((tier) => (
        <View
          key={tier.name}
          style={[
            styles.tierCard,
            {
              backgroundColor: colors.card,
              borderColor: tier.highlight ? tier.color : colors.border,
              borderWidth: tier.highlight ? 2 : 1,
            },
          ]}
        >
          {tier.highlight && (
            <View style={[styles.popularBadge, { backgroundColor: tier.color }]}>
              <Text style={styles.popularText}>MOST POPULAR</Text>
            </View>
          )}

          <View style={styles.tierHeader}>
            <View>
              <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
              <Text style={[styles.tierTagline, { color: colors.mutedForeground }]}>{tier.tagline}</Text>
            </View>
            <View style={styles.priceWrap}>
              <Text style={[styles.price, { color: colors.foreground }]}>{tier.price}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.features}>
            {tier.features.map((f) => (
              <View key={f} style={styles.feature}>
                <Feather name="check" size={14} color={tier.color} />
                <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={[
              styles.ctaBtn,
              {
                backgroundColor:
                  tier.name === "Starter" ? colors.muted : tier.color + "22",
                borderColor: tier.name === "Starter" ? colors.border : tier.color,
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.ctaText,
                { color: tier.name === "Starter" ? colors.mutedForeground : tier.color },
              ]}
            >
              {tier.name === "Starter" ? "Current Plan" : "Coming Soon"}
            </Text>
            {tier.name !== "Starter" && (
              <Feather name="clock" size={14} color={tier.color} />
            )}
          </Pressable>
        </View>
      ))}

      <View style={[styles.comingSoonNote, { backgroundColor: colors.muted }]}>
        <Feather name="info" size={16} color={colors.primary} />
        <View style={styles.noteText}>
          <Text style={[styles.noteTitle, { color: colors.foreground }]}>Payments Coming Soon</Text>
          <Text style={[styles.noteDesc, { color: colors.mutedForeground }]}>
            Paid tiers will launch alongside real phone number integration. You'll be notified when
            Pro and Studio are available.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 14 },
  header: { gap: 8, marginBottom: 4 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  currentDot: { width: 8, height: 8, borderRadius: 4 },
  currentText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  tierCard: { borderRadius: 18, padding: 20, gap: 14, overflow: "hidden" },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomLeftRadius: 12,
  },
  popularText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },
  tierHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  tierName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  tierTagline: { fontSize: 13, fontFamily: "Inter_400Regular" },
  priceWrap: { alignItems: "flex-end" },
  price: { fontSize: 20, fontFamily: "Inter_700Bold" },
  divider: { height: 1 },
  features: { gap: 10 },
  feature: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  featureText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  comingSoonNote: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 14, alignItems: "flex-start" },
  noteText: { flex: 1, gap: 4 },
  noteTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  noteDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
