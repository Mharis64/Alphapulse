import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SentimentProvider } from '../hooks/useSentimentStore';
import { initFirebase } from '../services/firebase';

export default function RootLayout() {
  useEffect(() => {
    initFirebase();
  }, []);

  return (
    <SentimentProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="asset-detail"
          options={{
            headerShown: true,
            title: 'Asset Detail',
            headerBackTitle: 'Back',
            headerStyle: { backgroundColor: '#F8F7F4' },
            headerTitleStyle: { fontSize: 16, fontWeight: '600', color: '#1A1917' },
            headerShadowVisible: false,
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </SentimentProvider>
  );
}
