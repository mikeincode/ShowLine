import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBanner } from "@/context/BannerContext";
import { useColors } from "@/hooks/useColors";

export function BannerHost() {
  const { current, dismissCurrent } = useBanner();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (dismissRef.current) {
      clearTimeout(dismissRef.current);
      dismissRef.current = null;
    }

    if (current) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      dismissRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -120,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => dismissCurrent());
      }, current.duration ?? 3500);
    } else {
      translateY.setValue(-120);
      opacity.setValue(0);
    }

    return () => {
      if (dismissRef.current) clearTimeout(dismissRef.current);
    };
  }, [current]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const accentColor = current?.color ?? colors.primary;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }], opacity, pointerEvents: current ? "box-none" : "none" },
      ]}
    >
      <Pressable
        onPress={() => {
          if (dismissRef.current) clearTimeout(dismissRef.current);
          Animated.parallel([
            Animated.timing(translateY, { toValue: -120, duration: 200, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
          ]).start(() => dismissCurrent());
        }}
        style={[
          styles.banner,
          {
            marginTop: topPad + 8,
            backgroundColor: "#1A1A28EE",
            borderColor: accentColor + "55",
            borderLeftColor: accentColor,
          },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: accentColor + "22" }]}>
          <Feather name={current?.icon as any ?? "bell"} size={16} color={accentColor} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {current?.title}
          </Text>
          {current?.message ? (
            <Text style={[styles.message, { color: colors.mutedForeground }]} numberOfLines={1}>
              {current.message}
            </Text>
          ) : null}
        </View>
        <Feather name="x" size={14} color={colors.mutedForeground} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 3,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  message: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
