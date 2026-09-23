import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { useSubscriptionGuard } from '@/hooks/useSubscriptionGuard';

export default function TabLayout() {
  useSubscriptionGuard();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(projects)">
        <Icon sf="square.stack.3d.up" />
        <Label>Projects</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(chat)">
        <Icon sf="message.badge.waveform" />
        <Label>AI Chat</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(guide)">
        <Icon sf="book.pages" />
        <Label>Guide</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
