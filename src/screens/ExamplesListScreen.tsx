import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ExamplesListScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();

  const examples = [
    {
      id: 'shopping-cart',
      title: ' Shopping Cart',
      description:
        'Complete e-commerce cart with useList, useCounter, and local state management',
      hooks: ['useList', 'useCounter', 'useState'],
      features: [
        'Add/Remove items',
        'Quantity management',
        'Price calculation',
        'Cart persistence',
      ],
    },

    {
      id: 'smart-form',
      title: ' Smart Form Validation',
      description:
        'Advanced form with validation, change tracking, and user experience optimizations',
      hooks: ['useState', 'usePrevious', 'useEffect'],
      features: [
        'Real-time validation',
        'Change tracking',
        'Error handling',
        'Success states',
      ],
    },

    {
      id: 'todo-app',
      title: ' Advanced Todo App',
      description:
        'Feature-rich todo application with categories, priorities, and filters',
      // difficulty: 'Intermediate',
      hooks: ['useList', 'useToggle', 'useState', 'useLocalStorage'],
      features: [
        'Categories',
        'Priority levels',
        'Due dates',
        'Filtering & search',
      ],
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return '#4caf50';
      case 'Intermediate':
        return '#ff9800';
      case 'Advanced':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const handleExamplePress = (exampleId: string) => {
    switch (exampleId) {
      case 'todo-app':
        (navigation as any).navigate('TodoApp');
        break;
      case 'shopping-cart':
        (navigation as any).navigate('ShoppingCart');
        break;
      case 'smart-form':
        (navigation as any).navigate('SmartFormValidation');
        break;
      default:
        // For now, show alert for other examples
        Alert.alert(
          'Coming Soon',
          `${exampleId} example will be available soon!`,
        );
    }
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Real-World Examples
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkDescription]}>
          Comprehensive demonstrations of useHooks in practical applications
        </Text>
      </View> */}

      {examples.map(example => (
        <TouchableOpacity
          key={example.id}
          style={[styles.exampleCard, isDarkMode && styles.darkCard]}
          onPress={() => handleExamplePress(example.id)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.exampleTitle, isDarkMode && styles.darkText]}>
              {example.title}
            </Text>
            <View>
              <Text style={styles.difficultyText}>{example.difficulty}</Text>
            </View>
          </View>

          <Text
            style={[styles.description, isDarkMode && styles.darkDescription]}
          >
            {example.description}
          </Text>

          <View style={styles.hooksSection}>
            <Text style={[styles.sectionLabel, isDarkMode && styles.darkText]}>
              Hooks Used:
            </Text>
            <View style={styles.hooksList}>
              {example.hooks.map((hook, index) => (
                <View key={index} style={styles.hookTag}>
                  <Text style={styles.hookText}>{hook}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.featuresSection}>
            <Text style={[styles.sectionLabel, isDarkMode && styles.darkText]}>
              Key Features:
            </Text>
            <View style={styles.featuresList}>
              {example.features.map((feature, index) => (
                <Text
                  key={index}
                  style={[
                    styles.featureItem,
                    isDarkMode && styles.darkDescription,
                  ]}
                >
                  • {feature}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text
              style={[
                styles.tapToExplore,
                isDarkMode && styles.darkDescription,
              ]}
            >
              Tap to explore →
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.footer}>
        <Text style={[styles.footerText, isDarkMode && styles.darkDescription]}>
          Each example demonstrates real-world usage patterns and best practices
          for React hooks.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  exampleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exampleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  hooksSection: {
    marginBottom: 16,
  },
  featuresSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  hooksList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hookTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  hookText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
  },
  featuresList: {
    marginLeft: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    alignItems: 'center',
  },
  tapToExplore: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  footer: {
    marginTop: 16,
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  darkText: {
    color: '#fff',
  },
  darkDescription: {
    color: '#888',
  },
});

export default ExamplesListScreen;
