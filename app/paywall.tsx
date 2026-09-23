/**
 * Paywall Screen — LaunchSwift dark theme
 *
 * Shows subscription options and handles purchases.
 * On web, displays features and prompts user to download the app.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { PurchasesPackage } from "react-native-purchases";
import { Zap, Bot, BarChart2, Headphones, Check, X } from "lucide-react-native";

import { useSubscription } from "@/contexts/SubscriptionContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const FEATURES = [
  {
    Icon: Zap,
    title: "Unlimited Projects",
    description: "Create and manage as many apps as you need",
    color: "#F7C948",
  },
  {
    Icon: Bot,
    title: "AI Assistant",
    description: "AI-powered help for your development workflow",
    color: "#2F81F7",
  },
  {
    Icon: BarChart2,
    title: "Advanced Analytics",
    description: "Track progress and insights across all projects",
    color: "#3FB950",
  },
  {
    Icon: Headphones,
    title: "Priority Support",
    description: "Faster responses and dedicated developer support",
    color: "#A371F7",
  },
];

export default function PaywallScreen() {
  const router = useRouter();

  const {
    packages,
    loading,
    isSubscribed,
    isWeb,
    purchasePackage,
    restorePurchases,
    mockWebPurchase,
    mockNativePurchase,
  } = useSubscription();

  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(packages[0] || null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [webMockState, setWebMockState] = useState<"idle" | "processing">("idle");
  const [webMockDialogState, setWebMockDialogState] = useState<
    "hidden" | "selecting" | "failed"
  >("hidden");

  React.useEffect(() => {
    if (packages.length > 0 && !selectedPackage) {
      setSelectedPackage(packages[0]);
    }
  }, [packages, selectedPackage]);

  // Derived display values — computed before any early returns so hook order is stable
  const subscribeLabel = selectedPackage
    ? selectedPackage.product.priceString
      ? `Subscribe for ${selectedPackage.product.priceString}`
      : "Subscribe"
    : "Select a plan";

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    console.log("[Paywall] Purchase button pressed:", selectedPackage.identifier);
    try {
      setPurchasing(true);
      const success = await purchasePackage(selectedPackage);
      if (success) {
        console.log("[Paywall] Purchase successful");
        Alert.alert("Welcome to Pro!", "You now have full access to LaunchSwift.", [
          { text: "Let's go!", onPress: () => router.replace("/(tabs)/(projects)") },
        ]);
      }
    } catch (error: any) {
      console.log("[Paywall] Purchase failed:", error.message);
      Alert.alert("Purchase Failed", error.message || "Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    console.log("[Paywall] Restore purchases pressed");
    try {
      setRestoring(true);
      const restored = await restorePurchases();
      if (restored) {
        console.log("[Paywall] Restore successful");
        Alert.alert("Restored!", "Your subscription has been restored.", [
          { text: "OK", onPress: () => router.replace("/(tabs)/(projects)") },
        ]);
      } else {
        Alert.alert("No Purchases Found", "We couldn't find any previous purchases.");
      }
    } catch (error: any) {
      console.log("[Paywall] Restore failed:", error.message);
      Alert.alert("Restore Failed", error.message || "Please try again.");
    } finally {
      setRestoring(false);
    }
  };

  const handleClose = () => {
    console.log("[Paywall] Close button pressed");
    router.replace("/(tabs)/(projects)");
  };

  const handleManageSubscription = () => {
    console.log("[Paywall] Manage Subscription pressed");
    Linking.openURL("https://apps.apple.com/account/subscriptions");
  };

  const handleWebMockPurchase = async () => {
    if (!selectedPackage) return;
    console.log("[Paywall] Web mock purchase initiated");
    setWebMockState("processing");
    await new Promise((resolve) => setTimeout(resolve, 400));
    setWebMockState("idle");
    setWebMockDialogState("selecting");
  };

  // Already subscribed
  if (isSubscribed) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={18} color="#8B949E" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.subscribedContent}>
            <View style={styles.proIconContainer}>
              <LinearGradient
                colors={["#2F81F7", "#1A5FBF"]}
                style={styles.proIconGradient}
              >
                <Zap size={36} color="#fff" strokeWidth={2} />
              </LinearGradient>
            </View>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO MEMBER</Text>
            </View>
            <Text style={styles.subscribedTitle}>You're All Set!</Text>
            <Text style={styles.subscribedSubtitle}>
              Full access to all LaunchSwift features
            </Text>

            <View style={styles.featuresCard}>
              <Text style={styles.featuresCardLabel}>UNLOCKED FEATURES</Text>
              {FEATURES.slice(0, 3).map((feature, index) => {
                const { Icon } = feature;
                return (
                  <View key={index} style={styles.featureCheckRow}>
                    <View style={[styles.checkCircle, { backgroundColor: feature.color + "22" }]}>
                      <Check size={14} color={feature.color} strokeWidth={2.5} />
                    </View>
                    <Text style={styles.featureCheckText}>{feature.title}</Text>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity style={styles.exploreButton} onPress={handleClose}>
              <Text style={styles.exploreButtonText}>Start Building</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.manageButton} onPress={handleManageSubscription}>
              <Text style={styles.manageButtonText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" color="#2F81F7" />
            <Text style={styles.loadingText}>Loading plans...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={["#2F81F7", "#1A5FBF"]}
              style={styles.headerIconContainer}
            >
              <Zap size={28} color="#fff" strokeWidth={2} />
            </LinearGradient>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>LAUNCHSWIFT PRO</Text>
            </View>
            <Text style={styles.title}>Unlock Full Access</Text>
            <Text style={styles.subtitle}>
              Everything you need to ship your app to the App Store
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresCardLabel}>WHAT YOU'LL GET</Text>
            {FEATURES.map((feature, index) => {
              const { Icon } = feature;
              return (
                <View key={index} style={styles.featureRow}>
                  <View
                    style={[
                      styles.featureIconContainer,
                      { backgroundColor: feature.color + "18" },
                    ]}
                  >
                    <Icon size={20} color={feature.color} strokeWidth={2} />
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Package Selection */}
          {packages.length > 0 && (
            <View style={styles.packagesContainer}>
              <Text style={styles.packagesLabel}>CHOOSE YOUR PLAN</Text>
              {packages.map((pkg) => {
                const isSelected = selectedPackage?.identifier === pkg.identifier;
                return (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={[
                      styles.packageCard,
                      isSelected && styles.packageCardSelected,
                    ]}
                    onPress={() => {
                      console.log("[Paywall] Package selected:", pkg.identifier);
                      setSelectedPackage(pkg);
                    }}
                    activeOpacity={0.8}
                  >
                    {isSelected && <View style={styles.selectedTopBar} />}
                    <View style={styles.packageHeader}>
                      <Text style={[styles.packageTitle, isSelected && styles.packageTitleSelected]}>
                        {pkg.product.title}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkmarkCircle}>
                          <Check size={12} color="#fff" strokeWidth={3} />
                        </View>
                      )}
                    </View>
                    {pkg.product.priceString ? (
                      <Text style={[styles.packagePrice, isSelected && styles.packagePriceSelected]}>
                        {pkg.product.priceString}
                      </Text>
                    ) : null}
                    {pkg.product.description ? (
                      <Text style={styles.packageDescription}>
                        {pkg.product.description}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* No packages — Expo Go notice */}
          {!isWeb && packages.length === 0 && !loading && (
            <View style={styles.noPackagesContainer}>
              <Text style={styles.noPackagesText}>
                Purchases are not available in standard Expo Go.
              </Text>
              <Text style={[styles.noPackagesText, { marginTop: 8, opacity: 0.6 }]}>
                Use a development build or production build to test purchases.
              </Text>
              {__DEV__ && (
                <TouchableOpacity
                  style={styles.devMockButton}
                  onPress={async () => {
                    console.log("[Paywall] Dev: simulate purchase pressed");
                    await mockNativePurchase();
                    router.replace("/(tabs)/(projects)");
                  }}
                >
                  <Text style={styles.devMockButtonText}>Dev: Simulate Purchase</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {isWeb ? (
            <>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!selectedPackage || webMockState === "processing") &&
                    styles.buttonDisabled,
                ]}
                onPress={handleWebMockPurchase}
                disabled={!selectedPackage || webMockState === "processing"}
              >
                {webMockState === "processing" ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>{subscribeLabel}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleRestore}
                disabled={restoring}
              >
                {restoring ? (
                  <ActivityIndicator size="small" color="#8B949E" />
                ) : (
                  <Text style={styles.secondaryButtonText}>Restore Purchases</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.legalText}>
                Preview mode — purchases available in the mobile app
              </Text>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!selectedPackage || purchasing) && styles.buttonDisabled,
                ]}
                onPress={handlePurchase}
                disabled={!selectedPackage || purchasing}
              >
                {purchasing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>{subscribeLabel}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleRestore}
                disabled={restoring}
              >
                {restoring ? (
                  <ActivityIndicator size="small" color="#8B949E" />
                ) : (
                  <Text style={styles.secondaryButtonText}>Restore Purchases</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.legalText}>
                Payment will be charged to your{" "}
                {Platform.OS === "ios" ? "Apple ID" : "Google Play"} account at $4.99/month.
                Subscription automatically renews unless canceled at least 24 hours
                before the end of the current period.{" "}
                <Text style={styles.legalLink} onPress={handleManageSubscription}>
                  Manage Subscription
                </Text>
              </Text>
            </>
          )}
        </View>
      </SafeAreaView>

      {/* Web Mock Dialog */}
      {isWeb && webMockDialogState !== "hidden" && (
        <View style={styles.webDialogOverlay}>
          <View style={styles.webDialogBox}>
            {webMockDialogState === "selecting" && (
              <>
                <Text style={styles.webDialogTitle}>Test Purchase</Text>
                <Text style={styles.webDialogBody}>
                  {`⚠️ This is a test purchase for development only.\n\nPackage: ${selectedPackage?.identifier}\nPrice: ${selectedPackage?.product.priceString || "N/A"}`}
                </Text>
                <View style={styles.webDialogDivider} />
                <TouchableOpacity
                  style={styles.webDialogButton}
                  onPress={() => setWebMockDialogState("failed")}
                >
                  <Text style={[styles.webDialogButtonText, { color: "#F85149" }]}>
                    Test Failed Purchase
                  </Text>
                </TouchableOpacity>
                <View style={styles.webDialogDivider} />
                <TouchableOpacity
                  style={styles.webDialogButton}
                  onPress={() => {
                    setWebMockDialogState("hidden");
                    mockWebPurchase();
                    router.replace("/(tabs)/(projects)");
                  }}
                >
                  <Text style={[styles.webDialogButtonText, { color: "#2F81F7" }]}>
                    Test Valid Purchase
                  </Text>
                </TouchableOpacity>
                <View style={styles.webDialogDivider} />
                <TouchableOpacity
                  style={styles.webDialogButton}
                  onPress={() => setWebMockDialogState("hidden")}
                >
                  <Text style={[styles.webDialogButtonText, { color: "#8B949E" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {webMockDialogState === "failed" && (
              <>
                <Text style={styles.webDialogTitle}>Purchase Failed</Text>
                <Text style={styles.webDialogBody}>
                  Test purchase failure: no real transaction occurred.
                </Text>
                <View style={styles.webDialogDivider} />
                <TouchableOpacity
                  style={styles.webDialogButton}
                  onPress={() => setWebMockDialogState("hidden")}
                >
                  <Text style={[styles.webDialogButtonText, { color: "#2F81F7" }]}>
                    OK
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1117",
  },
  safeArea: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: "#8B949E",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#161B22",
    borderWidth: 1,
    borderColor: "rgba(240,246,252,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  proBadge: {
    backgroundColor: "rgba(47,129,247,0.15)",
    borderWidth: 1,
    borderColor: "rgba(47,129,247,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2F81F7",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#E6EDF3",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#8B949E",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    maxWidth: 280,
  },

  // Features card
  featuresCard: {
    backgroundColor: "#161B22",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(240,246,252,0.08)",
  },
  featuresCardLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#484F58",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E6EDF3",
  },
  featureDescription: {
    fontSize: 13,
    color: "#8B949E",
    marginTop: 2,
    lineHeight: 18,
  },

  // Packages
  packagesContainer: {
    gap: 10,
    marginBottom: 8,
  },
  packagesLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#484F58",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  packageCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(240,246,252,0.1)",
    backgroundColor: "#161B22",
    overflow: "hidden",
  },
  packageCardSelected: {
    borderColor: "#2F81F7",
    backgroundColor: "rgba(47,129,247,0.08)",
  },
  selectedTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#2F81F7",
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B949E",
  },
  packageTitleSelected: {
    color: "#E6EDF3",
  },
  checkmarkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2F81F7",
    justifyContent: "center",
    alignItems: "center",
  },
  packagePrice: {
    fontSize: 22,
    fontWeight: "700",
    color: "#8B949E",
    marginTop: 6,
  },
  packagePriceSelected: {
    color: "#2F81F7",
  },
  packageDescription: {
    fontSize: 13,
    color: "#484F58",
    marginTop: 4,
  },

  // No packages
  noPackagesContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#161B22",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(240,246,252,0.08)",
  },
  noPackagesText: {
    fontSize: 14,
    color: "#8B949E",
    textAlign: "center",
    lineHeight: 20,
  },
  devMockButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(47,129,247,0.3)",
    borderStyle: "dashed",
    alignItems: "center",
  },
  devMockButtonText: {
    color: "#2F81F7",
    fontSize: 13,
  },

  // Bottom actions
  bottomActions: {
    padding: 20,
    paddingBottom: 8,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(240,246,252,0.06)",
    backgroundColor: "#0D1117",
  },
  primaryButton: {
    backgroundColor: "#2F81F7",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  secondaryButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    color: "#8B949E",
  },
  legalText: {
    fontSize: 11,
    color: "#484F58",
    textAlign: "center",
    lineHeight: 16,
    paddingBottom: 4,
  },

  // Web mock dialog
  webDialogOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  webDialogBox: {
    backgroundColor: "#161B22",
    borderRadius: 14,
    width: "85%",
    maxWidth: 400,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(240,246,252,0.1)",
  },
  webDialogTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#E6EDF3",
    textAlign: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  webDialogBody: {
    fontSize: 13,
    color: "#8B949E",
    textAlign: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
    lineHeight: 18,
  },
  webDialogDivider: {
    height: 1,
    backgroundColor: "rgba(240,246,252,0.06)",
  },
  webDialogButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  webDialogButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },

  // Subscribed state
  subscribedContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  proIconContainer: {
    marginBottom: 20,
  },
  proIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  subscribedTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#E6EDF3",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subscribedSubtitle: {
    fontSize: 15,
    color: "#8B949E",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  featureCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  featureCheckText: {
    fontSize: 15,
    color: "#E6EDF3",
    fontWeight: "500",
  },
  exploreButton: {
    width: "100%",
    backgroundColor: "#2F81F7",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  manageButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  manageButtonText: {
    fontSize: 14,
    color: "#8B949E",
    textDecorationLine: "underline",
  },
  legalLink: {
    color: "#2F81F7",
    textDecorationLine: "underline",
  },
});
