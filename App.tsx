/**
 * useHooks.com Demo App
 * Comprehensive demonstration of all useHooks library hooks
 * https://usehooks.com
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, useColorScheme } from 'react-native';
import 'react-native-gesture-handler';

import StateManagementScreen from './src/screens/StateManagementScreen';
import TimingHooksScreen from './src/screens/TimingHooksScreen';
import DeviceHooksScreen from './src/screens/DeviceHooksScreen';
import UtilityHooksScreen from './src/screens/UtilityHooksScreen';
// import ExamplesListScreen from './src/screens/ExamplesListScreen';
import TodoAppScreen from './src/screens/examples/TodoAppScreen';
import ShoppingCartScreen from './src/screens/examples/ShoppingCartScreen';
import ExamplesListScreen from './src/screens/ExamplesListScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Examples Stack Navigator
function ExamplesStack() {
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
    </Stack.Navigator>
  );
}

// Tab Navigator Component
function MainTabNavigator() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#333' : '#fff',
        },
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: isDarkMode ? '#888' : '#666',
        headerStyle: {
          backgroundColor: isDarkMode ? '#333' : '#fff',
        },
        headerTintColor: isDarkMode ? '#fff' : '#333',
        headerTitleStyle: {
          fontWeight: 'bold',
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
        name="UtilityHooks"
        component={UtilityHooksScreen}
        options={{
          title: 'Utility',
          tabBarLabel: 'Utility',
        }}
      />
      <Tab.Screen
        name="Examples"
        component={ExamplesStack}
        options={{
          title: 'Examples',
          tabBarLabel: 'Examples',
          headerShown: false, // Hide tab header since stack has its own
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
