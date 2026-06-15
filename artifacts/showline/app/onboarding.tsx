import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useShowLine } from "@/context/ShowLineContext";
import { useColors } from "@/hooks/useColors";
import type { CreatorType, UseCase } from "@/types";

const ALL_CREATOR_TYPES: { id: CreatorType; label: string; icon: string }[] = [
  { id: "podcaster", label: "Podcaster", icon: "mic" },
  { id: "streamer", label: "Streamer", icon: "video" },
  { id: "tiktokyoutube", label: "TikTok / YouTube", icon: "youtube" },
  { id: "musician", label: "Musician", icon: "music" },
  { id: "liveseller", label: "Live Seller", icon: "shopping-bag" },
  { id: "coach", label: "Coach / Educator", icon: "book-open" },
  { id: "other", label: "Other Creator", icon: "star" },
];
const CREATOR_TYPES = Array.from(new Map(ALL_CREATOR_TYPES.map((c) => [c.id, c])).values());

const ALL_USE_CASES: { id: UseCase; label: string; desc: string; icon: string }[] = [
  { id: "live_callins", label: "Live Call-Ins", desc: "Take live questions during streams", icon: "phone-incoming" },
  { id: "fan_questions", label: "Fan Questions", desc: "Collect questions from your audience", icon: "help-circle" },
  { id: "topic_ideas", label: "Topic Ideas", desc: "Let fans pitch content ideas", icon: "zap" },
  { id: "vip_fans", label: "VIP Superfans", desc: "Give your top fans a private channel", icon: "award" },
  { id: "collabs", label: "Collabs & Brands", desc: "Separate business inquiries from fan mail", icon: "briefcase" },
];
const USE_CASES = Array.from(new Map(ALL_USE_CASES.map((u) => [u.id, u])).values());

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { completeOnboarding } = useShowLine();

  const [step, setStep] = useState(0);
  const [creatorType, setCreatorType] = useState<CreatorType | null>(null);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const topInset = Platform.OS === "web" ? 67 : 0;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const animateStep = (next: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setStep(next), 150);
  };

  const toggleUseCase = (id: UseCase) => {
    Haptics.selectionAsync();
    setUseCases((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    if (!creatorType) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeOnboarding(creatorType, useCases);
    router.replace("/");
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background, paddingTop: topInset }]}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <Feather name="phone" size={22} color={colors.primary} />
            <Text style={[styles.logo, { color: colors.foreground }]}>ShowLine</Text>
          </View>
          <View style={styles.stepDots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i <= step ? colors.primary : colors.border },
                ]}
              />
            ))}
          </View>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {step === 0 && (
            <View style={styles.step}>
              <View style={[styles.heroIcon, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="phone" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.foreground }]}>
                Your creator{"\n"}fan phone system
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                ShowLine gives you a dedicated line for fan messages, live call-ins, VIP access,
                and business inquiries — all without exposing your personal number.
              </Text>
              <View style={styles.features}>
                {[
                  { icon: "mail", label: "FanMail — your fan message hub" },
                  { icon: "radio", label: "LiveLine — real-time audience engagement" },
                  { icon: "star", label: "Backstage Line — VIP superfan access" },
                  { icon: "briefcase", label: "Collab Line — business inquiries only" },
                ].map((f) => (
                  <View key={f.label} style={styles.feature}>
                    <Feather name={f.icon as any} size={16} color={colors.primary} />
                    <Text style={[styles.featureText, { color: colors.foreground }]}>{f.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {step === 1 && (
            <View style={styles.step}>
              <Text style={[styles.title, { color: colors.foreground }]}>
                What kind of{"\n"}creator are you?
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                This helps us personalize your ShowLine setup.
              </Text>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.optionsScroll}>
                <View style={styles.grid}>
                  {CREATOR_TYPES.map((ct) => {
                    const selected = creatorType === ct.id;
                    return (
                      <Pressable
                        key={ct.id}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setCreatorType(ct.id);
                        }}
                        style={[
                          styles.optionCard,
                          {
                            backgroundColor: selected ? colors.primary + "22" : colors.card,
                            borderColor: selected ? colors.primary : colors.border,
                            borderWidth: selected ? 1.5 : 1,
                          },
                        ]}
                      >
                        <Feather
                          name={ct.icon as any}
                          size={20}
                          color={selected ? colors.primary : colors.mutedForeground}
                        />
                        <Text
                          style={[
                            styles.optionLabel,
                            { color: selected ? colors.primary : colors.foreground },
                          ]}
                        >
                          {ct.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {step === 2 && (
            <View style={styles.step}>
              <Text style={[styles.title, { color: colors.foreground }]}>
                What do you want{"\n"}to use ShowLine for?
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                Pick everything that applies. You can always change this later.
              </Text>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.optionsScroll}>
                <View style={styles.useCaseList}>
                  {USE_CASES.map((uc) => {
                    const selected = useCases.includes(uc.id);
                    return (
                      <Pressable
                        key={uc.id}
                        onPress={() => toggleUseCase(uc.id)}
                        style={[
                          styles.ucCard,
                          {
                            backgroundColor: selected ? colors.primary + "18" : colors.card,
                            borderColor: selected ? colors.primary : colors.border,
                            borderWidth: selected ? 1.5 : 1,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.ucIcon,
                            { backgroundColor: selected ? colors.primary + "30" : colors.muted },
                          ]}
                        >
                          <Feather
                            name={uc.icon as any}
                            size={18}
                            color={selected ? colors.primary : colors.mutedForeground}
                          />
                        </View>
                        <View style={styles.ucText}>
                          <Text
                            style={[
                              styles.ucLabel,
                              { color: selected ? colors.primary : colors.foreground },
                            ]}
                          >
                            {uc.label}
                          </Text>
                          <Text style={[styles.ucDesc, { color: colors.mutedForeground }]}>
                            {uc.desc}
                          </Text>
                        </View>
                        {selected && (
                          <Feather name="check-circle" size={20} color={colors.primary} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}
        </Animated.View>

        <View style={[styles.footer, { paddingBottom: bottomInset + 16 }]}>
          {step > 0 && (
            <Pressable
              onPress={() => animateStep(step - 1)}
              style={[styles.backBtn, { borderColor: colors.border }]}
            >
              <Feather name="arrow-left" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              if (step < 2) {
                if (step === 1 && !creatorType) return;
                animateStep(step + 1);
              } else {
                handleComplete();
              }
            }}
            style={[
              styles.nextBtn,
              {
                backgroundColor:
                  step === 1 && !creatorType ? colors.muted : colors.primary,
                flex: 1,
              },
            ]}
          >
            <Text style={styles.nextText}>
              {step === 0 ? "Get Started" : step === 2 ? "Set Up ShowLine" : "Continue"}
            </Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  stepDots: { flexDirection: "row", gap: 6 },
  dot: { width: 24, height: 4, borderRadius: 2 },
  content: { flex: 1 },
  step: { flex: 1, gap: 16 },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -1, lineHeight: 38 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  features: { gap: 10, marginTop: 8 },
  feature: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  optionsScroll: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  optionCard: {
    width: "47%",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    gap: 8,
  },
  optionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  useCaseList: { gap: 10 },
  ucCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  ucIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ucText: { flex: 1, gap: 2 },
  ucLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  ucDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  footer: { flexDirection: "row", gap: 10, marginTop: 16 },
  backBtn: {
    width: 48,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 14,
    gap: 8,
  },
  nextText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
