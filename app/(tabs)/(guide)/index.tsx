import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Clock, ChevronRight, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/Colors';
import { AnimatedPressable } from '@/components/AnimatedPressable';

interface GuideArticle {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  icon: string;
  categoryColor: string;
}

const ARTICLES: GuideArticle[] = [
  { slug: 'getting-started', title: 'Getting Started with App Store Connect', category: 'Getting Started', readTime: '5 min', icon: '🚀', categoryColor: COLORS.primary },
  { slug: 'writing-descriptions', title: 'Writing App Descriptions That Convert', category: 'Metadata', readTime: '4 min', icon: '✍️', categoryColor: COLORS.accent },
  { slug: 'screenshot-requirements', title: 'Screenshot Requirements & Best Practices', category: 'Screenshots', readTime: '6 min', icon: '📸', categoryColor: COLORS.warning },
  { slug: 'review-process', title: 'Navigating the App Review Process', category: 'Review Process', readTime: '7 min', icon: '🔍', categoryColor: '#A371F7' },
  { slug: 'testflight-setup', title: 'Setting Up TestFlight Beta Testing', category: 'TestFlight', readTime: '5 min', icon: '🧪', categoryColor: '#39D353' },
  { slug: 'rejection-reasons', title: 'Common Rejection Reasons & How to Avoid Them', category: 'Common Rejections', readTime: '8 min', icon: '⚠️', categoryColor: COLORS.danger },
];

const CATEGORIES = ['All', 'Getting Started', 'Metadata', 'Screenshots', 'Review Process', 'TestFlight', 'Common Rejections'];

function ArticleCard({ article, index, onPress }: { article: GuideArticle; index: number; onPress: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <AnimatedPressable onPress={onPress} style={styles.articleCard}>
        <View style={[styles.articleIcon, { backgroundColor: article.categoryColor + '20' }]}>
          <Text style={styles.articleEmoji}>{article.icon}</Text>
        </View>
        <View style={styles.articleContent}>
          <View style={[styles.categoryBadge, { backgroundColor: article.categoryColor + '20' }]}>
            <Text style={[styles.categoryText, { color: article.categoryColor }]}>{article.category}</Text>
          </View>
          <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
          <View style={styles.articleMeta}>
            <Clock size={12} color={COLORS.textTertiary} strokeWidth={2} />
            <Text style={styles.readTime}>{article.readTime} read</Text>
          </View>
        </View>
        <ChevronRight size={16} color={COLORS.textTertiary} strokeWidth={2} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function GuideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = ARTICLES.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleArticlePress = (article: GuideArticle) => {
    console.log(`[Guide] Article pressed: ${article.title}`);
    router.push(`/guide/${article.slug}`);
  };

  const handleAboutPress = () => {
    console.log('[Guide] About button pressed');
    router.push('/about');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Submission Guide</Text>
            <Text style={styles.headerSubtitle}>Everything you need to know</Text>
          </View>
          <TouchableOpacity onPress={handleAboutPress} style={styles.infoButton} accessibilityLabel="About LaunchSwift">
            <Info size={20} color={COLORS.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={16} color={COLORS.textTertiary} strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles..."
          placeholderTextColor={COLORS.textTertiary}
          value={search}
          onChangeText={text => {
            console.log('[Guide] Search query:', text);
            setSearch(text);
          }}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
        style={styles.categoriesScroll}
      >
        {CATEGORIES.map(cat => (
          <AnimatedPressable
            key={cat}
            onPress={() => {
              console.log('[Guide] Category selected:', cat);
              setActiveCategory(cat);
            }}
            style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
          >
            <Text style={[styles.categoryChipText, activeCategory === cat && styles.categoryChipTextActive]}>
              {cat}
            </Text>
          </AnimatedPressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No articles found</Text>
          </View>
        ) : (
          filtered.map((article, index) => (
            <ArticleCard
              key={article.slug}
              article={article}
              index={index}
              onPress={() => handleArticlePress(article)}
            />
          ))
        )}
        <Text style={styles.copyright}>© 2025 Joseph Hurley · LaunchSwift™</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  infoButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  categoriesScroll: {
    marginBottom: 8,
  },
  categoriesRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 10,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  articleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleEmoji: {
    fontSize: 22,
  },
  articleContent: {
    flex: 1,
    gap: 5,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTime: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  noResults: {
    paddingTop: 60,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  copyright: {
    color: COLORS.textTertiary,
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
