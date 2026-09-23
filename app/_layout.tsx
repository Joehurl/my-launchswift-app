import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack, Redirect, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import { isOnboardingComplete } from "@/utils/onboardingStorage";

const DevErrorBoundary = __DEV__
  ? ErrorBoundary
  : ({ children }: { children: React.ReactNode }) => <>{children}</>;

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};


function SubscriptionRedirect() {
  const { isSubscribed, loading } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    const onOnboarding = pathname.startsWith("/onboarding");
    if (onOnboarding) return;

    let cancelled = false;
    isOnboardingComplete().then((done) => {
      if (cancelled) return;
      if (!done) return;
      const onPaywall = pathname === "/paywall";
      if (onPaywall) return;
      if (!isSubscribed) {
        router.replace("/paywall");
      }
    }).catch(() => {
      if (cancelled) return;
      const onPaywall = pathname === "/paywall";
      if (onPaywall) return;
      if (!isSubscribed) {
        router.replace("/paywall");
      }
    });
    return () => { cancelled = true; };
  }, [isSubscribed, loading, pathname]);

  return null;
}

const CustomDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    primary: "#2F81F7",
    background: "#0D1117",
    card: "#161B22",
    text: "#E6EDF3",
    border: "rgba(240,246,252,0.1)",
    notification: "#F85149",
  },
};

const CustomDefaultTheme: Theme = {
  ...DefaultTheme,
  colors: {
    primary: "#2F81F7",
    background: "#0D1117",
    card: "#161B22",
    text: "#E6EDF3",
    border: "rgba(240,246,252,0.1)",
    notification: "#F85149",
  },
};

export default function RootLayout() {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    isOnboardingComplete().then((complete) => {
      setOnboardingComplete(complete);
    });
  }, [pathname]);

  useEffect(() => {
    if (loaded && onboardingComplete !== null) {
      SplashScreen.hideAsync();
    }
  }, [loaded, onboardingComplete]);

  // Keep splash screen up while we determine onboarding state
  if (onboardingComplete === null) {
    return null;
  }

  const activeTheme = colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme;

  return (
    <SubscriptionProvider>
          <SubscriptionRedirect />
  <DevErrorBoundary>
      <StatusBar style="light" animated />
      <ThemeProvider value={activeTheme}>
        <SafeAreaProvider>
          <ProjectProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              {onboardingComplete === false && pathname !== "/auth" && pathname !== "/paywall" && pathname !== "/auth-popup" && pathname !== "/auth-callback" && <Redirect href="/onboarding" />}

              <Stack>
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="paywall" options={{ headerShown: false, presentation: "modal" }} />

                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="new-project"
                  options={{
                    presentation: "formSheet",
                    sheetGrabberVisible: true,
                    sheetAllowedDetents: [0.6, 1.0],
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="project/[id]"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "",
                  }}
                />
                <Stack.Screen
                  name="section/credentials"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "Credentials",
                  }}
                />
                <Stack.Screen
                  name="section/app-info"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "App Information",
                  }}
                />
                <Stack.Screen
                  name="section/metadata"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "Description & Metadata",
                  }}
                />
                <Stack.Screen
                  name="section/screenshots"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "Screenshots",
                  }}
                />
                <Stack.Screen
                  name="section/pricing"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "Pricing & Availability",
                  }}
                />
                <Stack.Screen
                  name="section/review-info"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "App Review Info",
                  }}
                />
                <Stack.Screen
                  name="section/privacy"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "Privacy Policy",
                  }}
                />
                <Stack.Screen
                  name="section/iap"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "In-App Purchases",
                  }}
                />
                <Stack.Screen
                  name="section/subscriptions"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "Subscriptions",
                  }}
                />
                <Stack.Screen
                  name="section/testflight"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "TestFlight Setup",
                  }}
                />
                <Stack.Screen
                  name="section/age-rating"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "Age Rating",
                  }}
                />
                <Stack.Screen
                  name="section/checklist"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "Final Checklist",
                  }}
                />
                <Stack.Screen
                  name="guide/[slug]"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "",
                  }}
                />
                <Stack.Screen
                  name="about"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: "#0D1117" },
                    headerTintColor: "#2F81F7",
                    headerShadowVisible: false,
                    title: "About LaunchSwift",
                  }}
                />
              </Stack>
              <SystemBars style="light" />
            </GestureHandlerRootView>
          </ProjectProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </DevErrorBoundary>
    </SubscriptionProvider>
  );
}
