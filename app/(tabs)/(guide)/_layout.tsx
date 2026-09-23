import { Stack } from 'expo-router';
import { COLORS } from '@/constants/Colors';

export default function GuideLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.primary,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Submission Guide', headerLargeTitle: true }} />
    </Stack>
  );
}
