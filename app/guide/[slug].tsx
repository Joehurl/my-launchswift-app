import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';

interface ArticleSection {
  type: 'heading' | 'body' | 'tip' | 'warning' | 'list';
  content: string;
  items?: string[];
}

interface Article {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  icon: string;
  sections: ArticleSection[];
}

const ARTICLES: Record<string, Article> = {
  'getting-started': {
    slug: 'getting-started',
    title: 'Getting Started with App Store Connect',
    category: 'Getting Started',
    readTime: '5 min',
    icon: '🚀',
    sections: [
      { type: 'heading', content: 'What is App Store Connect?' },
      { type: 'body', content: 'App Store Connect is Apple\'s web-based portal for managing your apps on the App Store. It\'s where you submit apps for review, manage pricing, view analytics, respond to reviews, and manage your developer team.' },
      { type: 'heading', content: 'Prerequisites' },
      { type: 'list', content: '', items: ['Apple Developer Program membership ($99/year)', 'Xcode installed on your Mac', 'A valid app bundle with a unique bundle identifier', 'App icons in all required sizes', 'At least one screenshot per required device size'] },
      { type: 'heading', content: 'Setting Up Certificates & Provisioning' },
      { type: 'body', content: 'Before submitting, you need a Distribution Certificate and an App Store Provisioning Profile. In Xcode, go to Preferences → Accounts, add your Apple ID, and use "Manage Certificates" to create a distribution certificate.' },
      { type: 'tip', content: 'Use Xcode\'s automatic signing for the simplest setup. Go to your target\'s Signing & Capabilities tab and check "Automatically manage signing".' },
      { type: 'heading', content: 'Creating Your App Record' },
      { type: 'body', content: 'In App Store Connect, click the "+" button to create a new app. You\'ll need your bundle ID (must match Xcode exactly), a unique SKU for your records, and your primary language.' },
      { type: 'heading', content: 'Uploading Your Build' },
      { type: 'body', content: 'Archive your app in Xcode (Product → Archive), then use the Organizer to distribute it to App Store Connect. Your build will appear in TestFlight and can be selected for App Store submission.' },
      { type: 'warning', content: 'Make sure your build number is higher than any previously uploaded build. App Store Connect rejects duplicate build numbers.' },
    ],
  },
  'writing-descriptions': {
    slug: 'writing-descriptions',
    title: 'Writing App Descriptions That Convert',
    category: 'Metadata',
    readTime: '4 min',
    icon: '✍️',
    sections: [
      { type: 'heading', content: 'The First 3 Lines Are Everything' },
      { type: 'body', content: 'Most users never tap "More" to expand the description. Your first 3 lines (about 255 characters) must hook the reader immediately. Lead with your strongest value proposition.' },
      { type: 'heading', content: 'Structure for Scanability' },
      { type: 'body', content: 'Use ALL CAPS headers, bullet points with •, and short paragraphs. App Store descriptions don\'t support markdown, so use visual formatting tricks to create hierarchy.' },
      { type: 'tip', content: 'Start with a one-sentence power statement: "The fastest way to [do X] on iPhone." Then expand with features and social proof.' },
      { type: 'heading', content: 'Keywords Strategy' },
      { type: 'body', content: 'You have 100 characters for keywords. Don\'t repeat words already in your title or subtitle — Apple indexes those automatically. Focus on synonyms, related terms, and competitor names (where allowed).' },
      { type: 'list', content: 'Keyword tips:', items: ['Use commas without spaces to maximize character count', 'Include common misspellings of your app name', 'Think about what your users search for, not what you call features', 'Update keywords regularly based on Search Ads data', 'Avoid generic terms like "app", "free", "best"'] },
      { type: 'heading', content: 'Promotional Text' },
      { type: 'body', content: 'The 170-character promotional text appears above your description and can be updated without a new app review. Use it for time-sensitive promotions, new feature announcements, or seasonal messaging.' },
      { type: 'warning', content: 'Never include pricing information in your description. App Store guidelines prohibit mentioning specific prices in metadata.' },
    ],
  },
  'screenshot-requirements': {
    slug: 'screenshot-requirements',
    title: 'Screenshot Requirements & Best Practices',
    category: 'Screenshots',
    readTime: '6 min',
    icon: '📸',
    sections: [
      { type: 'heading', content: 'Required Device Sizes' },
      { type: 'list', content: '', items: ['iPhone 6.9" (1320 × 2868 px) — Required', 'iPhone 6.5" (1242 × 2688 px) — Required', 'iPhone 5.5" (1242 × 2208 px) — Optional but recommended', 'iPad Pro 13" (2048 × 2732 px) — Required for iPad apps', 'iPad Pro 11" (1668 × 2388 px) — Required for iPad apps'] },
      { type: 'tip', content: 'If you upload 6.9" screenshots, they\'ll be used for all smaller iPhone sizes automatically. You only need to upload 6.5" separately if you want different screenshots for that size.' },
      { type: 'heading', content: 'Technical Requirements' },
      { type: 'list', content: '', items: ['PNG or JPEG format', 'No alpha channel (transparency)', 'RGB color space', 'Minimum 72 DPI', 'No rounded corners or device frames required by Apple', 'Up to 10 screenshots per device size'] },
      { type: 'heading', content: 'Design Best Practices' },
      { type: 'body', content: 'Your first screenshot is the most important — it appears in search results. Use it to show your app\'s core value immediately. Consider adding a short caption overlay to explain what\'s shown.' },
      { type: 'list', content: 'What makes great screenshots:', items: ['Show real app UI, not marketing illustrations', 'Use captions to explain features (keep them short)', 'Show a progression: problem → solution → result', 'Use consistent visual style across all screenshots', 'Test on actual device sizes to check text readability'] },
      { type: 'warning', content: 'Screenshots showing Apple hardware (iPhone, iPad) must use official Apple device frames or no device frame at all. Using third-party device mockups that look like Apple products can cause rejection.' },
      { type: 'heading', content: 'App Preview Videos' },
      { type: 'body', content: 'App Preview videos (15-30 seconds) autoplay in search results and can dramatically increase conversion. They must show actual app footage — no marketing animations or live-action footage.' },
    ],
  },
  'review-process': {
    slug: 'review-process',
    title: 'Navigating the App Review Process',
    category: 'Review Process',
    readTime: '7 min',
    icon: '🔍',
    sections: [
      { type: 'heading', content: 'How Long Does Review Take?' },
      { type: 'body', content: 'Most apps are reviewed within 24-48 hours. Apple\'s review times vary based on volume and complexity. You can check current average review times at developer.apple.com/news/.' },
      { type: 'heading', content: 'What Reviewers Check' },
      { type: 'list', content: '', items: ['App completeness — no placeholder content or broken features', 'Metadata accuracy — screenshots and description match the actual app', 'Privacy compliance — permissions are justified and privacy policy is accurate', 'Business model compliance — IAPs use Apple\'s system', 'Content guidelines — age rating matches actual content', 'Performance — app doesn\'t crash or have major bugs'] },
      { type: 'tip', content: 'Include detailed review notes explaining any non-obvious features, especially if your app requires a login or has a complex onboarding flow.' },
      { type: 'heading', content: 'If Your App Gets Rejected' },
      { type: 'body', content: 'Rejections come with a specific guideline number and explanation. Read it carefully — most rejections are fixable. You can reply to the reviewer directly in App Store Connect to ask for clarification before resubmitting.' },
      { type: 'heading', content: 'Expedited Review' },
      { type: 'body', content: 'Apple offers expedited review for critical bug fixes or time-sensitive releases (e.g., tied to a major event). Request it through App Store Connect with a clear explanation of why it\'s urgent.' },
      { type: 'heading', content: 'The Appeals Process' },
      { type: 'body', content: 'If you believe a rejection was incorrect, you can appeal to the App Review Board. Provide specific guideline references and evidence that your app complies. Appeals typically take 1-2 weeks.' },
      { type: 'warning', content: 'Don\'t resubmit without addressing the rejection reason. Multiple rejections for the same issue can result in your app being flagged for additional scrutiny.' },
    ],
  },
  'testflight-setup': {
    slug: 'testflight-setup',
    title: 'Setting Up TestFlight Beta Testing',
    category: 'TestFlight',
    readTime: '5 min',
    icon: '🧪',
    sections: [
      { type: 'heading', content: 'Internal vs External Testing' },
      { type: 'body', content: 'Internal testing is for up to 100 members of your App Store Connect team. Builds are available immediately after processing. External testing allows up to 10,000 testers and requires a brief Beta App Review (usually 1-2 days).' },
      { type: 'heading', content: 'Setting Up Beta Groups' },
      { type: 'body', content: 'Create beta groups to organize testers. You can have multiple groups with different builds — useful for A/B testing or staged rollouts. Each group can have its own set of testers and build assignments.' },
      { type: 'tip', content: 'Create an "Internal" group for your team and a "Public Beta" group for external testers. This lets you test builds internally before releasing to the wider beta audience.' },
      { type: 'heading', content: 'Inviting Testers' },
      { type: 'list', content: 'Three ways to invite testers:', items: ['Email invitation — send directly from App Store Connect', 'Public link — shareable URL that anyone can use to join', 'Redemption codes — one-time use codes for controlled distribution'] },
      { type: 'heading', content: 'Build Notes' },
      { type: 'body', content: 'Always include build notes explaining what changed and what to test. Good build notes increase tester engagement and the quality of feedback you receive.' },
      { type: 'heading', content: 'Collecting Feedback' },
      { type: 'body', content: 'TestFlight automatically collects crash reports. Testers can also send feedback with screenshots directly from the TestFlight app. Set up a feedback email to receive these reports.' },
      { type: 'warning', content: 'External TestFlight builds expire after 90 days. Plan your beta timeline accordingly and upload new builds before expiration to keep testers engaged.' },
    ],
  },
  'rejection-reasons': {
    slug: 'rejection-reasons',
    title: 'Common Rejection Reasons & How to Avoid Them',
    category: 'Common Rejections',
    readTime: '8 min',
    icon: '⚠️',
    sections: [
      { type: 'heading', content: '1. Guideline 2.1 — App Completeness' },
      { type: 'body', content: 'Your app must be complete and functional. Remove all placeholder content, "coming soon" features, and broken links before submitting.' },
      { type: 'heading', content: '2. Guideline 4.0 — Design' },
      { type: 'body', content: 'Apps must follow iOS Human Interface Guidelines. Common issues: non-standard navigation patterns, UI that mimics other platforms, or interfaces that don\'t work well on all supported screen sizes.' },
      { type: 'heading', content: '3. Guideline 5.1.1 — Data Collection & Storage' },
      { type: 'body', content: 'Your privacy policy must accurately describe all data you collect. Only request permissions you actually use, and explain why in the permission request dialog.' },
      { type: 'tip', content: 'Add NSUsageDescription strings for every permission in your Info.plist. Vague descriptions like "We need camera access" will be rejected. Be specific: "Camera access is needed to scan QR codes."' },
      { type: 'heading', content: '4. Guideline 3.1.1 — In-App Purchases' },
      { type: 'body', content: 'All digital goods and services must use Apple\'s IAP system. You cannot link to external payment methods or mention that cheaper prices are available elsewhere.' },
      { type: 'heading', content: '5. Guideline 1.1 — Objectionable Content' },
      { type: 'body', content: 'Ensure your age rating accurately reflects your content. If your app allows user-generated content, you must have a moderation system and a way for users to report inappropriate content.' },
      { type: 'heading', content: '6. Guideline 2.3 — Accurate Metadata' },
      { type: 'body', content: 'Screenshots must show the actual app UI. Descriptions must accurately describe what the app does. Don\'t include competitor names or misleading claims.' },
      { type: 'heading', content: '7. Guideline 4.2 — Minimum Functionality' },
      { type: 'body', content: 'Apps must provide enough value to justify their existence on the App Store. Simple web wrappers, apps with very limited functionality, or apps that duplicate built-in iOS features without adding value are often rejected.' },
      { type: 'heading', content: '8. Guideline 2.5.4 — Hardware Compatibility' },
      { type: 'body', content: 'If your app requires specific hardware (camera, GPS, etc.), declare it in your Info.plist with UIRequiredDeviceCapabilities. Don\'t claim to support devices your app doesn\'t actually work on.' },
      { type: 'warning', content: 'The most common rejection is Guideline 2.1 (App Completeness). Always test your app thoroughly on a real device before submitting, including edge cases and error states.' },
      { type: 'heading', content: 'Pro Tips for Avoiding Rejection' },
      { type: 'list', content: '', items: ['Test on the oldest iOS version you support', 'Test with a fresh account (no existing data)', 'Check all external links work', 'Verify all IAPs are configured in App Store Connect', 'Include detailed review notes for complex features', 'Test in airplane mode to handle offline states gracefully'] },
    ],
  },
};

function ArticleBlock({ section }: { section: ArticleSection }) {
  if (section.type === 'heading') {
    return <Text style={styles.heading}>{section.content}</Text>;
  }
  if (section.type === 'body') {
    return <Text style={styles.body} selectable>{section.content}</Text>;
  }
  if (section.type === 'tip') {
    return (
      <View style={styles.tipCard}>
        <Text style={styles.tipLabel}>💡 Tip</Text>
        <Text style={styles.tipText} selectable>{section.content}</Text>
      </View>
    );
  }
  if (section.type === 'warning') {
    return (
      <View style={styles.warningCard}>
        <Text style={styles.warningLabel}>⚠️ Watch out</Text>
        <Text style={styles.warningText} selectable>{section.content}</Text>
      </View>
    );
  }
  if (section.type === 'list') {
    return (
      <View style={styles.listBlock}>
        {section.content ? <Text style={styles.listTitle}>{section.content}</Text> : null}
        {section.items?.map((item, i) => (
          <View key={i} style={styles.listItem}>
            <View style={styles.listBullet} />
            <Text style={styles.listItemText} selectable>{item}</Text>
          </View>
        ))}
      </View>
    );
  }
  return null;
}

export default function GuideArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = ARTICLES[slug];
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('[GuideArticle] Article opened:', slug);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  if (!article) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Article not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: article.category }} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Article Header */}
          <View style={styles.articleHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.articleIcon}>{article.icon}</Text>
            </View>
            <View style={[styles.categoryBadge]}>
              <Text style={styles.categoryText}>{article.category}</Text>
            </View>
            <Text style={styles.articleTitle}>{article.title}</Text>
            <View style={styles.metaRow}>
              <Clock size={13} color={COLORS.textTertiary} strokeWidth={2} />
              <Text style={styles.readTime}>{article.readTime} read</Text>
            </View>
          </View>

          {/* Article Content */}
          <View style={styles.content}>
            {article.sections.map((section, i) => (
              <ArticleBlock key={i} section={section} />
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 60 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  notFoundText: { fontSize: 17, color: COLORS.textSecondary },
  articleHeader: {
    padding: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    gap: 10,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  articleIcon: { fontSize: 26 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: { fontSize: 11, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  articleTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, letterSpacing: -0.4, lineHeight: 28 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  readTime: { fontSize: 13, color: COLORS.textTertiary },
  content: { padding: 24, gap: 16 },
  heading: { fontSize: 18, fontWeight: '700', color: COLORS.text, letterSpacing: -0.3, marginTop: 8 },
  body: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 24 },
  tipCard: {
    backgroundColor: COLORS.accentMuted,
    borderRadius: 12,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  tipLabel: { fontSize: 13, fontWeight: '700', color: COLORS.accent },
  tipText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  warningCard: {
    backgroundColor: COLORS.warningMuted,
    borderRadius: 12,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  warningLabel: { fontSize: 13, fontWeight: '700', color: COLORS.warning },
  warningText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  listBlock: { gap: 8 },
  listTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  listBullet: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.primary, marginTop: 9 },
  listItemText: { flex: 1, fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
});
