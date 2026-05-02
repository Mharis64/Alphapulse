import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Heatmap: '🌍', News: '📰', Watchlist: '⭐', Settings: '⚙️',
  };
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icons[label]}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1A1917',
        tabBarInactiveTintColor: '#B4B2A9',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen name="index"     options={{ title: 'Heatmap',   headerShown: false, tabBarIcon: ({ focused }) => <TabIcon label="Heatmap"   focused={focused} /> }} />
      <Tabs.Screen name="news"      options={{ title: 'News',      headerShown: false, tabBarIcon: ({ focused }) => <TabIcon label="News"      focused={focused} /> }} />
      <Tabs.Screen name="watchlist" options={{ title: 'Watchlist', headerShown: false, tabBarIcon: ({ focused }) => <TabIcon label="Watchlist" focused={focused} /> }} />
      <Tabs.Screen name="settings"  options={{ title: 'Settings',  headerShown: false, tabBarIcon: ({ focused }) => <TabIcon label="Settings"  focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
    height: 60,
  },
  tabLabel: { fontSize: 11, fontWeight: '500' },
});