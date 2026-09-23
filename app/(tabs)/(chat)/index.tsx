import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sparkles, Send, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/Colors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import {
  ChatMessage,
  ChatContext,
  getAIResponse,
  getWelcomeMessage,
  getSuggestedQuestions,
} from '@/utils/aiChat';

const CHAT_STORAGE_KEY = '@launchswift_chat_general';

const CONTEXT: ChatContext = {
  section: 'general',
  projectName: 'App Store Submission',
};

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start();
    a2.start();
    a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={typingStyles.container}>
      <View style={typingStyles.bubble}>
        <View style={typingStyles.sparkleWrap}>
          <Sparkles size={12} color={COLORS.primary} strokeWidth={2} />
        </View>
        <View style={typingStyles.dots}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View key={i} style={[typingStyles.dot, { opacity: dot }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const typingStyles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 4 },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  sparkleWrap: { opacity: 0.8 },
  dots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.textSecondary },
});

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={i} style={{ fontWeight: '700', color: isUser ? '#fff' : COLORS.text }}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return (
        <Text key={i} style={{ color: isUser ? '#fff' : COLORS.text }}>
          {part}
        </Text>
      );
    });
  };

  return (
    <Animated.View
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowAssistant,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {!isUser && (
        <View style={styles.assistantIcon}>
          <Sparkles size={12} color={COLORS.primary} strokeWidth={2} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant]}>
          {renderContent(message.content)}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function AIChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const suggestions = getSuggestedQuestions('general');

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as ChatMessage[];
          setMessages(parsed);
          console.log(`[AIChatTab] Loaded ${parsed.length} messages from storage`);
        } else {
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: getWelcomeMessage(CONTEXT),
            timestamp: new Date().toISOString(),
          }]);
        }
      } catch {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: getWelcomeMessage(CONTEXT),
          timestamp: new Date().toISOString(),
        }]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages)).catch(() => {});
    }
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    console.log(`[AIChatTab] User sent message: "${trimmed.substring(0, 50)}"`);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await getAIResponse(trimmed, CONTEXT);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      console.log(`[AIChatTab] Assistant responded, length: ${response.length}`);
    } catch (e) {
      console.error('[AIChatTab] Error getting response:', e);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I had trouble generating a response. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping]);

  const handleClearChat = useCallback(async () => {
    console.log('[AIChatTab] Clear chat pressed');
    await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(CONTEXT),
      timestamp: new Date().toISOString(),
    }]);
  }, []);

  const handleSend = useCallback(() => {
    console.log('[AIChatTab] Send button pressed');
    sendMessage(inputText);
  }, [inputText, sendMessage]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Sparkles size={18} color={COLORS.primary} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>App Store submission expert</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleClearChat} style={styles.clearButton} accessibilityLabel="Clear chat">
          <Trash2 size={16} color={COLORS.textTertiary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={[styles.messagesContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}

          {/* Suggested questions — show when only welcome message */}
          {messages.length <= 1 && !isTyping && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsLabel}>Suggested questions</Text>
              <View style={styles.suggestionsGrid}>
                {suggestions.map((q, i) => (
                  <AnimatedPressable
                    key={i}
                    onPress={() => {
                      console.log(`[AIChatTab] Suggested question tapped: "${q}"`);
                      sendMessage(q);
                    }}
                    style={styles.suggestionCard}
                  >
                    <Text style={styles.suggestionText}>{q}</Text>
                  </AnimatedPressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={styles.input}
            placeholder="Ask anything about App Store submission..."
            placeholderTextColor={COLORS.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <AnimatedPressable
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping}
            style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendButtonDisabled]}
          >
            <Send size={18} color="#fff" strokeWidth={2} />
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
  },
  keyboardView: {
    flex: 1,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    gap: 8,
  },
  messageRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  assistantIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: COLORS.surfaceSecondary,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: '#fff',
  },
  bubbleTextAssistant: {
    color: COLORS.text,
  },
  suggestionsSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  suggestionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  suggestionsGrid: {
    gap: 8,
  },
  suggestionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: COLORS.background,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
