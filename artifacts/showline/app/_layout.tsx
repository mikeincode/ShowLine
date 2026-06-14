import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { BannerHost } from "@/components/BannerHost";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SimulationEngine } from "@/components/SimulationEngine";
import { BannerProvider } from "@/context/BannerContext";
import { LiveLineProvider } from "@/context/LiveLineContext";
import { MessagesProvider } from "@/context/MessagesContext";
import { SessionHistoryProvider } from "@/context/SessionHistoryContext";
import { ShowLineProvider, useShowLine } from "@/context/ShowLineContext";
import { SimulationProvider } from "@/context/SimulationContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const MODAL_HEADER = (title: string) => ({
  presentation: "modal" as const,
  headerTitle: title,
  headerStyle: { backgroundColor: "#0D0D14" },
  headerTintColor: "#F0F0FF",
  headerTitleStyle: { fontFamily: "Inter_600SemiBold", color: "#F0F0FF" },
});

const CARD_HEADER = (title: string) => ({
  presentation: "card" as const,
  headerTitle: title,
  headerStyle: { backgroundColor: "#0D0D14" },
  headerTintColor: "#F0F0FF",
  headerTitleStyle: { fontFamily: "Inter_600SemiBold", color: "#F0F0FF" },
});

function RootLayoutNav() {
  const { isLoaded, onboardingCompleted } = useShowLine();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [isLoaded, onboardingCompleted]);

  if (!isLoaded) return null;

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="backstage" options={MODAL_HEADER("Backstage Line")} />
        <Stack.Screen name="collab" options={MODAL_HEADER("Collab Line")} />
        <Stack.Screen name="autoreply" options={MODAL_HEADER("Auto-Reply Settings")} />
        <Stack.Screen name="upgrade" options={MODAL_HEADER("Upgrade")} />
        <Stack.Screen name="safety" options={MODAL_HEADER("Safety Controls")} />
        <Stack.Screen name="sessions" options={CARD_HEADER("Post-Show Recaps")} />
        <Stack.Screen name="session/[id]" options={CARD_HEADER("Session Recap")} />
        <Stack.Screen name="vip/[id]" options={CARD_HEADER("Fan Profile")} />
      </Stack>
      <SimulationEngine />
      <BannerHost />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <ShowLineProvider>
                <MessagesProvider>
                  <LiveLineProvider>
                    <SimulationProvider>
                      <BannerProvider>
                        <SessionHistoryProvider>
                          <RootLayoutNav />
                        </SessionHistoryProvider>
                      </BannerProvider>
                    </SimulationProvider>
                  </LiveLineProvider>
                </MessagesProvider>
              </ShowLineProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
