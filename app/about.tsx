import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Rocket, ChevronRight, X } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { AnimatedPressable } from '@/components/AnimatedPressable';

const COPYRIGHT_TEXT = `COPYRIGHT NOTICE

LaunchSwift™
Copyright © 2025 Joseph Hurley
All Rights Reserved.

This application, including all content, design, code, features, and intellectual property contained herein, is the exclusive property of Joseph Hurley.

TRADEMARK
"LaunchSwift" and the LaunchSwift logo are trademarks of Joseph Hurley. Unauthorized use is prohibited.

INTELLECTUAL PROPERTY
All source code, algorithms, user interface designs, graphics, text, and other materials in this application are protected by United States and international copyright laws.

RESTRICTIONS
You may not copy, modify, distribute, sell, or lease any part of this application or its content without express written permission from Joseph Hurley.

AI ASSISTANCE DISCLOSURE
This application uses artificial intelligence to provide App Store submission guidance. AI-generated content is provided for informational purposes only and does not constitute legal or professional advice.

For licensing inquiries, contact:
launchswift@josephhurley.com`;

const TERMS_TEXT = `TERMS OF USE

Last updated: January 1, 2025

By downloading or using LaunchSwift, you agree to these Terms of Use. Please read them carefully.

1. ACCEPTANCE OF TERMS
By accessing or using LaunchSwift ("the App"), you agree to be bound by these Terms of Use and all applicable laws and regulations.

2. USE LICENSE
Joseph Hurley grants you a limited, non-exclusive, non-transferable license to use LaunchSwift for personal, non-commercial purposes on Apple devices you own or control.

3. RESTRICTIONS
You may not:
• Copy, modify, or distribute the App
• Reverse engineer or attempt to extract source code
• Use the App for any unlawful purpose
• Transfer your license to another person

4. AI-GENERATED CONTENT
LaunchSwift uses artificial intelligence to provide App Store submission guidance. This content is for informational purposes only. Joseph Hurley makes no warranties about the accuracy, completeness, or suitability of AI-generated advice. Always verify important information with Apple's official documentation.

5. DISCLAIMER OF WARRANTIES
The App is provided "as is" without warranty of any kind. Joseph Hurley disclaims all warranties, express or implied, including merchantability and fitness for a particular purpose.

6. LIMITATION OF LIABILITY
Joseph Hurley shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App.

7. CHANGES TO TERMS
Joseph Hurley reserves the right to modify these terms at any time. Continued use of the App constitutes acceptance of updated terms.

8. CONTACT
For questions about these Terms, contact: launchswift@josephhurley.com

© 2025 Joseph Hurley. All rights reserved.`;

const PRIVACY_TEXT = `PRIVACY POLICY

Last updated: January 1, 2025

Joseph Hurley ("we," "us," or "our") operates LaunchSwift. This Privacy Policy explains how we handle information when you use our App.

1. INFORMATION WE COLLECT

LOCAL STORAGE ONLY (stays on your device):
LaunchSwift stores all project data locally on your device. This data never leaves your device and is not transmitted to our servers.

Data stored locally includes:
• App project information you enter (names, bundle IDs, metadata)
• Section completion status and form data
• AI chat history
• App Store credentials (stored in iOS Keychain via SecureStore)
• Onboarding preferences

PURCHASE DATA (RevenueCat):
LaunchSwift uses RevenueCat to process in-app purchases and subscriptions. RevenueCat may collect:
• Purchase history and subscription status
• Device identifiers for purchase verification
• Transaction receipts from Apple

RevenueCat's privacy policy: https://www.revenuecat.com/privacy

2. INFORMATION WE DO NOT COLLECT
• We do not collect your name, email, or personal information
• We do not use analytics or behavioral tracking SDKs
• We do not transmit project data or credentials to any server
• We do not use advertising networks or sell data
• We do not share personal data with third parties (except RevenueCat for purchase processing)

3. AI CHAT FEATURE
The AI chat feature in LaunchSwift uses a built-in local response engine. Your chat messages are processed entirely on-device and are never sent to any external AI service or server.

4. CREDENTIALS SECURITY
Your App Store Connect credentials are stored using iOS Keychain (expo-secure-store), which provides hardware-level encryption on your device. We never transmit, access, or store your credentials on any server.

5. DATA RETENTION
All locally stored data remains on your device until you delete the app. Deleting the app removes all locally stored data. Purchase records are managed by Apple and RevenueCat per their respective policies.

6. YOUR RIGHTS
You may delete all app data by uninstalling LaunchSwift. For purchase-related data, contact RevenueCat at privacy@revenuecat.com.

7. CHILDREN'S PRIVACY
LaunchSwift is not directed to children under 13. We do not knowingly collect information from children under 13.

8. CHANGES TO THIS POLICY
We may update this Privacy Policy from time to time. We will notify you of changes by updating the "Last updated" date at the top of this policy. Continued use of the app after changes constitutes acceptance.

9. CONTACT US
If you have questions about this Privacy Policy, contact us at:
launchswift@josephhurley.com

© 2025 Joseph Hurley. All rights reserved.
LaunchSwift™ — com.josephhurley.launchswift`;

interface LegalModalProps {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
}

function LegalModal({ visible, title, content, onClose }: LegalModalProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[modalStyles.container, { paddingTop: insets.top }]}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeButton} accessibilityLabel="Close">
            <X size={20} color={COLORS.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={[modalStyles.content, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={modalStyles.text}>{content}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  closeButton: { padding: 6, borderRadius: 8 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  text: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
});

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const [copyrightVisible, setCopyrightVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  const legalItems = [
    {
      label: 'Copyright Notice',
      onPress: () => {
        console.log('[About] Copyright Notice tapped');
        setCopyrightVisible(true);
      },
    },
    {
      label: 'Terms of Use',
      onPress: () => {
        console.log('[About] Terms of Use tapped');
        setTermsVisible(true);
      },
    },
    {
      label: 'Privacy Policy',
      onPress: () => {
        console.log('[About] Privacy Policy tapped');
        setPrivacyVisible(true);
      },
    },
  ];

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* App Icon */}
        <View style={styles.heroSection}>
          <View style={styles.appIcon}>
            <Rocket size={36} color={COLORS.primary} strokeWidth={1.5} />
          </View>
          <Text style={styles.appName}>LaunchSwift</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          {__DEV__ && (
            <View style={styles.devNotice}>
              <Text style={styles.devNoticeText}>
                Replace assets/images/newly.png with your LaunchSwift icon before submitting to the App Store.
              </Text>
            </View>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>
              LaunchSwift is the ultimate App Store submission assistant for indie developers and app builders. Powered by AI, it guides you through every step of the submission process — from metadata to TestFlight.
            </Text>
            <Text style={styles.aboutText}>
              Built to save you hours of research and reduce the risk of rejection, LaunchSwift puts expert App Store knowledge at your fingertips.
            </Text>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.legalCard}>
            {legalItems.map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <View style={styles.divider} />}
                <AnimatedPressable onPress={item.onPress} style={styles.legalRow}>
                  <Text style={styles.legalLabel}>{item.label}</Text>
                  <ChevronRight size={16} color={COLORS.textTertiary} strokeWidth={2} />
                </AnimatedPressable>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Footer copyright */}
        <View style={styles.footer}>
          <Text style={styles.footerLine}>© 2025 Joseph Hurley</Text>
          <Text style={styles.footerLine}>All rights reserved.</Text>
          <Text style={styles.footerBrand}>LaunchSwift™</Text>
        </View>
      </ScrollView>

      <LegalModal
        visible={copyrightVisible}
        title="Copyright Notice"
        content={COPYRIGHT_TEXT}
        onClose={() => setCopyrightVisible(false)}
      />
      <LegalModal
        visible={termsVisible}
        title="Terms of Use"
        content={TERMS_TEXT}
        onClose={() => setTermsVisible(false)}
      />
      <LegalModal
        visible={privacyVisible}
        title="Privacy Policy"
        content={PRIVACY_TEXT}
        onClose={() => setPrivacyVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  heroSection: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  appIcon: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    marginBottom: 4,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  version: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  devNotice: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.warningMuted,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
    maxWidth: 300,
  },
  devNoticeText: {
    fontSize: 12,
    color: COLORS.warning,
    textAlign: 'center',
    lineHeight: 18,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  aboutText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  legalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  legalLabel: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 16,
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 16,
  },
  footerLine: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  footerBrand: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textTertiary,
    marginTop: 4,
  },
});
