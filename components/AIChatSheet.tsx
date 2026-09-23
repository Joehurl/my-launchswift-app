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
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sparkles, X, Send, Trash2 } from 'lucide-react-native';
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

interface AIChatSheetProps {
  visible: boolean;
  onClose: () => void;
  context: ChatContext;
  suggestedQuestions?: string[];
}

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
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
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

  // Parse markdown-like bold text
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

export function AIChatSheet({ visible, onClose, context, suggestedQuestions }: AIChatSheetProps) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(600)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const questions = suggestedQuestions ?? getSuggestedQuestions(context.section);
  const storageKey = `@launchswift_chat_${context.section}`;

  // Load chat history
  useEffect(() => {
    if (!visible) return;
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as ChatMessage[];
          setMessages(parsed);
          console.log(`[AIChat] Loaded ${parsed.length} messages from storage for section: ${context.section}`);
        } else {
          const welcome: ChatMessage = {
            id: 'welcome',
            role: 'assistant',
            content: getWelcomeMessage(context),
            timestamp: new Date().toISOString(),
          };
          setMessages([welcome]);
        }
      } catch {
        const welcome: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: getWelcomeMessage(context),
          timestamp: new Date().toISOString(),
        };
        setMessages([welcome]);
      }
    };
    load();
  }, [visible, context.section]);

  // Animate in/out
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 600, duration: 250, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  // Save messages
  useEffect(() => {
    if (messages.length > 1) {
      AsyncStorage.setItem(storageKey, JSON.stringify(messages)).catch(() => {});
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

    console.log(`[AIChat] User sent message in section ${context.section}: "${trimmed.substring(0, 50)}"`);

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
      const response = await getAIResponse(trimmed, context);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      console.log(`[AIChat] Assistant responded, length: ${response.length}`);
    } catch (e) {
      console.error('[AIChat] Error getting response:', e);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I had trouble generating a response. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [context, isTyping]);

  const handleClearChat = useCallback(async () => {
    console.log(`[AIChat] Clear chat pressed for section: ${context.section}`);
    await AsyncStorage.removeItem(storageKey);
    const welcome: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(context),
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
  }, [context, storageKey]);

  const handleSend = useCallback(() => {
    console.log('[AIChat] Send button pressed');
    sendMessage(inputText);
  }, [inputText, sendMessage]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Sparkles size={16} color={COLORS.primary} strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.headerTitle}>LaunchSwift AI</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {context.section === 'general' ? 'App Store Expert' : `${context.section.replace(/-/g, ' ')} section`}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleClearChat} style={styles.headerButton} accessibilityLabel="Clear chat">
              <Trash2 size={16} color={COLORS.textTertiary} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.headerButton} accessibilityLabel="Close">
              <X size={18} color={COLORS.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
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
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
          </ScrollView>

          {/* Suggested questions */}
          {messages.length <= 1 && !isTyping && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsRow}
              style={styles.suggestionsScroll}
            >
              {questions.map((q, i) => (
                <AnimatedPressable
                  key={i}
                  onPress={() => {
                    console.log(`[AIChat] Suggested question tapped: "${q}"`);
                    sendMessage(q);
                  }}
                  style={styles.suggestionChip}
                >
                  <Text style={styles.suggestionText} numberOfLines={2}>{q}</Text>
                </AnimatedPressable>
              ))}
            </ScrollView>
          )}

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ask anything about this section..."
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
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerButton: {
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
    paddingVertical: 12,
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
    width: 24,
    height: 24,
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
  suggestionsScroll: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  suggestionsRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: 200,
  },
  suggestionText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 100,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
