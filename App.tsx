/**
 * useHooks.com Demo App
 * Comprehensive demonstration of all useHooks library hooks
 * https://usehooks.com
 *
 * @format
 */

import React, { useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, useColorScheme } from 'react-native';
import 'react-native-gesture-handler';

// Existing screens
import StateManagementScreen from './src/screens/StateManagementScreen';
import TimingHooksScreen from './src/screens/TimingHooksScreen';
import UtilityHooksScreen from './src/screens/UtilityHooksScreen';
import DeviceHooksScreen from './src/screens/DeviceHooksScreen';

// New screens
import DataFetchingHooksScreen from './src/screens/DataFetchingHooksScreen';

// Example screens
import TodoAppScreen from './src/screens/examples/TodoAppScreen';
import ShoppingCartScreen from './src/screens/examples/ShoppingCartScreen';
import SmartFormValidationScreen from './src/screens/examples/SmartFormValidationScreen';
import AdvancedUseFetchScreen from './src/screens/examples/AdvancedUseFetchScreen';
import ExamplesListScreen from './src/screens/ExamplesListScreen';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

// Examples Stack Navigator
function ExamplesStack({
  setTabBarVisible,
}: {
  setTabBarVisible: (visible: boolean) => void;
}) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? '#333' : '#fff',
        },
        headerTintColor: isDarkMode ? '#fff' : '#333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      screenListeners={{
        state: e => {
          // Hide tabs when navigating to individual example screens
          const state = e.data.state;
          if (state) {
            const currentRoute = state.routes[state.index];
            const isOnExamplesList = currentRoute.name === 'ExamplesList';
            setTabBarVisible(isOnExamplesList);
          }
        },
      }}
    >
      <Stack.Screen
        name="ExamplesList"
        component={ExamplesListScreen}
        options={{ title: 'Real-World Examples' }}
      />
      <Stack.Screen
        name="TodoApp"
        component={TodoAppScreen}
        options={{ title: 'Advanced Todo App' }}
      />
      <Stack.Screen
        name="ShoppingCart"
        component={ShoppingCartScreen}
        options={{ title: 'Smart Shopping Cart' }}
      />
      <Stack.Screen
        name="SmartFormValidation"
        component={SmartFormValidationScreen}
        options={{ title: 'Smart Form Validation' }}
      />
      <Stack.Screen
        name="AdvancedUseFetch"
        component={AdvancedUseFetchScreen}
        options={{ title: 'Advanced useFetch Demo' }}
      />
    </Stack.Navigator>
  );
}

// Tab Navigator Component
function MainTabNavigator() {
  const isDarkMode = useColorScheme() === 'dark';
  const [tabBarVisible, setTabBarVisible] = useState(true);

  const ExamplesWithTabControl = useCallback(() => {
    return <ExamplesStack setTabBarVisible={setTabBarVisible} />;
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarStyle: tabBarVisible
          ? {
              backgroundColor: isDarkMode ? '#111' : '#fff',
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
            }
          : { display: 'none' },
        tabBarIndicatorStyle: {
          backgroundColor: '#1976d2',
          height: 3,
        },
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: isDarkMode ? '#888' : '#666',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          width: 85,
        },
      }}
    >
      <Tab.Screen
        name="StateManagement"
        component={StateManagementScreen}
        options={{
          title: 'State',
          tabBarLabel: 'State',
        }}
      />
      <Tab.Screen
        name="TimingHooks"
        component={TimingHooksScreen}
        options={{
          title: 'Timing',
          tabBarLabel: 'Timing',
        }}
      />
      <Tab.Screen
        name="DeviceHooks"
        component={DeviceHooksScreen}
        options={{
          title: 'Device',
          tabBarLabel: 'Device',
        }}
      />
      <Tab.Screen
        name="DataFetching"
        component={DataFetchingHooksScreen}
        options={{
          title: 'Data',
          tabBarLabel: 'Data',
        }}
      />

      <Tab.Screen
        name="UtilityHooks"
        component={UtilityHooksScreen}
        options={{
          title: 'Utility',
          tabBarLabel: 'Utility',
        }}
      />
      <Tab.Screen
        name="Examples"
        component={ExamplesWithTabControl}
        options={{
          title: 'Examples',
          tabBarLabel: 'Examples',
        }}
      />
    </Tab.Navigator>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <MainTabNavigator />
    </NavigationContainer>
  );
}

export default App;
