import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const isDarkMode = useColorScheme() === 'dark';

  const categories = [
    {
      title: 'State Management Hooks',
      description: 'Counter, Toggle, LocalStorage, ObjectState, List, etc.',
      route: 'StateManagement',
      hooks: [
        'useCounter',
        'useToggle',
        'useLocalStorage',
        'useObjectState',
        'useList',
        'useMap',
        'useSet',
        'useQueue',
      ],
    },
    {
      title: 'Timing Hooks',
      description: 'Interval, Timeout, Countdown, Debounce, Throttle',
      route: 'TimingHooks',
      hooks: [
        'useInterval',
        'useTimeout',
        'useCountdown',
        'useDebounce',
        'useThrottle',
        'useRandomInterval',
      ],
    },
    {
      title: 'Device & Network Hooks',
      description: 'Network state, Orientation, Battery, Geolocation',
      route: 'DeviceHooks',
      hooks: [
        'useNetworkState',
        'useOrientation',
        'useBattery',
        'useGeolocation',
        'useMediaQuery',
        'useWindowSize',
      ],
    },
    {
      title: 'Utility Hooks',
      description: 'Previous values, Render count, Copy to clipboard',
      route: 'UtilityHooks',
      hooks: [
        'usePrevious',
        'useRenderCount',
        'useIsFirstRender',
        'useCopyToClipboard',
        'useLogger',
        'useDefault',
      ],
    },
    {
      title: 'Real-World Examples',
      description: 'Practical applications and use cases',
      route: 'Examples',
      hooks: [
        'Shopping Cart',
        'Form Validation',
        'Data Fetching',
        'Live Chat',
        'Game Score',
      ],
    },
  ];

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          useHooks.com Demo
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
          A comprehensive demonstration of modern, server-safe React hooks
        </Text>
        <Text
          style={[styles.description, isDarkMode && styles.darkDescription]}
        >
          Explore 40+ hooks from the ui.dev team with interactive examples and
          real-world use cases.
        </Text>
      </View>

      <View style={styles.categoriesContainer}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.categoryCard, isDarkMode && styles.darkCard]}
            onPress={() => navigation.navigate(category.route as never)}
            activeOpacity={0.7}
          >
            <Text style={[styles.categoryTitle, isDarkMode && styles.darkText]}>
              {category.title}
            </Text>
            <Text
              style={[
                styles.categoryDescription,
                isDarkMode && styles.darkDescription,
              ]}
            >
              {category.description}
            </Text>
            <View style={styles.hooksContainer}>
              {category.hooks.map((hook, hookIndex) => (
                <View
                  key={hookIndex}
                  style={[styles.hookTag, isDarkMode && styles.darkHookTag]}
                >
                  <Text
                    style={[
                      styles.hookTagText,
                      isDarkMode && styles.darkHookTagText,
                    ]}
                  >
                    {hook}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, isDarkMode && styles.darkDescription]}>
          📚 Learn more at usehooks.com
        </Text>
        <Text style={[styles.footerText, isDarkMode && styles.darkDescription]}>
          🔧 Built with React Native & TypeScript
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  categoriesContainer: {
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  hooksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hookTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 4,
    marginBottom: 4,
  },
  darkHookTag: {
    backgroundColor: '#1976d2',
  },
  hookTagText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  darkHookTagText: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  darkText: {
    color: '#fff',
  },
  darkSubtitle: {
    color: '#ccc',
  },
  darkDescription: {
    color: '#888',
  },
});

export default HomeScreen;
