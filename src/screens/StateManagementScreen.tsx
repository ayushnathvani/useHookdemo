import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  useColorScheme,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useCounter,
  useToggle,
  useList,
  useQueue,
  useDefault,
} from '@uidotdev/usehooks';

// Custom useLocalStorage hook implementation for React Native
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load value from AsyncStorage on mount
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const item = await AsyncStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load from storage',
        );
        console.warn(`Error loading ${key} from AsyncStorage:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredValue();
  }, [key]);

  const setValue = useCallback(
    async (value: T | ((val: T) => T)) => {
      try {
        setError(null);
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to save to storage',
        );
        console.warn(`Error saving ${key} to AsyncStorage:`, err);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(async () => {
    try {
      setError(null);
      setStoredValue(initialValue);
      await AsyncStorage.removeItem(key);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to remove from storage',
      );
      console.warn(`Error removing ${key} from AsyncStorage:`, err);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue, { isLoading, error }] as const;
}
const useBoolean = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(prev => !prev), []);

  return [value, { setTrue, setFalse, toggle, setValue }] as const;
};

// Custom useObjectState hook implementation
const useObjectState = <T extends Record<string, any>>(initialState: T) => {
  const [state, setState] = useState(initialState);

  const updateState = useCallback(
    (updates: Partial<T> | ((prev: T) => Partial<T>)) => {
      setState(prev => {
        if (typeof updates === 'function') {
          return { ...prev, ...updates(prev) };
        }
        return { ...prev, ...updates };
      });
    },
    [],
  );

  const resetState = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  const setProperty = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      updateState({ [key as string]: value } as unknown as Partial<T>);
    },
    [updateState],
  );

  const mergeState = useCallback((newState: T) => {
    setState(newState);
  }, []);

  return [state, { updateState, resetState, setProperty, mergeState }] as const;
};

const StateManagementScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <CounterDemo isDarkMode={isDarkMode} />
      <ToggleDemo isDarkMode={isDarkMode} />
      <BooleanDemo isDarkMode={isDarkMode} />
      <LocalStorageDemo isDarkMode={isDarkMode} />
      <ObjectStateDemo isDarkMode={isDarkMode} />
      <ListDemo isDarkMode={isDarkMode} />
      <MapDemo isDarkMode={isDarkMode} />
      <SetDemo isDarkMode={isDarkMode} />
      <QueueDemo isDarkMode={isDarkMode} />
      <DefaultDemo isDarkMode={isDarkMode} />
    </ScrollView>
  );
};

const CounterDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [count, { increment, decrement, set, reset }] = useCounter(10, {
    min: 0,
    max: 100,
  });

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useCounter
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Manage a counter with min/max limits and convenient methods
      </Text>

      <View style={styles.counterContainer}>
        <Text style={[styles.counterValue, isDarkMode && styles.darkText]}>
          {count}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={decrement}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={increment}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => set(50)}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Set 50
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={reset}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Shopping cart quantities, pagination, rating systems
      </Text>
    </View>
  );
};

const ToggleDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [isOn, toggle] = useToggle(false);
  const [isEnabled, toggleEnabled] = useToggle(true);

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useToggle
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Toggle boolean values with a simple function
      </Text>

      <View style={styles.toggleContainer}>
        <View style={styles.toggleItem}>
          <Text style={[styles.toggleLabel, isDarkMode && styles.darkText]}>
            Light Switch: {isOn ? 'ON' : 'OFF'}
          </Text>
          <Switch value={isOn} onValueChange={toggle} />
        </View>

        <View style={styles.toggleItem}>
          <Text style={[styles.toggleLabel, isDarkMode && styles.darkText]}>
            Notifications: {isEnabled ? 'Enabled' : 'Disabled'}
          </Text>
          <Switch value={isEnabled} onValueChange={toggleEnabled} />
        </View>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Feature flags, settings toggles, modal visibility
      </Text>
    </View>
  );
};

const BooleanDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [
    isModalVisible,
    { setTrue: showModal, setFalse: hideModal, toggle: toggleModal },
  ] = useBoolean(false);
  const [
    isLoading,
    { setTrue: startLoading, setFalse: stopLoading, toggle: toggleLoading },
  ] = useBoolean(false);
  const [
    hasPermission,
    {
      setTrue: grantPermission,
      setFalse: revokePermission,
      toggle: togglePermission,
    },
  ] = useBoolean(true);

  const simulateAsyncOperation = () => {
    startLoading();
    setTimeout(() => {
      stopLoading();
      showModal();
    }, 2000);
  };

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useBoolean
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Manage boolean state with semantic helper methods
      </Text>

      <View style={styles.booleanContainer}>
        <View style={styles.booleanItem}>
          <Text style={[styles.booleanLabel, isDarkMode && styles.darkText]}>
            Modal: {isModalVisible ? 'Visible' : 'Hidden'}
          </Text>
          <View style={styles.booleanButtons}>
            <TouchableOpacity
              style={[
                styles.smallButton,
                isModalVisible && styles.activeButton,
              ]}
              onPress={showModal}
            >
              <Text
                style={[
                  styles.smallButtonText,
                  isModalVisible && styles.activeButtonText,
                ]}
              >
                Show
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.smallButton,
                !isModalVisible && styles.activeButton,
              ]}
              onPress={hideModal}
            >
              <Text
                style={[
                  styles.smallButtonText,
                  !isModalVisible && styles.activeButtonText,
                ]}
              >
                Hide
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton, styles.secondaryButton]}
              onPress={toggleModal}
            >
              <Text
                style={[styles.smallButtonText, styles.secondaryButtonText]}
              >
                Toggle
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.booleanItem}>
          <Text style={[styles.booleanLabel, isDarkMode && styles.darkText]}>
            Loading: {isLoading ? 'Yes' : 'No'}
          </Text>
          <View style={styles.booleanButtons}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={simulateAsyncOperation}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                {isLoading ? 'Loading...' : 'Start Operation'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton]}
              onPress={toggleLoading}
            >
              <Text style={styles.smallButtonText}>Toggle</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.booleanItem}>
          <Text style={[styles.booleanLabel, isDarkMode && styles.darkText]}>
            Permission: {hasPermission ? 'Granted' : 'Denied'}
          </Text>
          <View style={styles.booleanButtons}>
            <TouchableOpacity
              style={[styles.smallButton, hasPermission && styles.activeButton]}
              onPress={grantPermission}
            >
              <Text
                style={[
                  styles.smallButtonText,
                  hasPermission && styles.activeButtonText,
                ]}
              >
                Grant
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.smallButton,
                !hasPermission && styles.activeButton,
              ]}
              onPress={revokePermission}
            >
              <Text
                style={[
                  styles.smallButtonText,
                  !hasPermission && styles.activeButtonText,
                ]}
              >
                Revoke
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton, styles.secondaryButton]}
              onPress={togglePermission}
            >
              <Text
                style={[styles.smallButtonText, styles.secondaryButtonText]}
              >
                Toggle
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Modal visibility, feature toggles, UI state management,
        permission states
      </Text>
    </View>
  );
};

const LocalStorageDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [name, setName] = useState('');
  const [storedName, setStoredName, removeStoredName, { isLoading, error }] =
    useLocalStorage('user-name', '');

  const saveName = async () => {
    if (name.trim()) {
      await setStoredName(name.trim());
      Alert.alert('Saved!', `Name "${name.trim()}" saved to AsyncStorage`);
      setName('');
    }
  };

  const clearStorage = async () => {
    await removeStoredName();
    Alert.alert('Cleared!', 'Storage cleared');
  };

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useLocalStorage
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Persist state in AsyncStorage with automatic loading and error handling
      </Text>

      {isLoading && (
        <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
          Loading from storage...
        </Text>
      )}

      {error && (
        <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
          Error: {error}
        </Text>
      )}

      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholder="Enter your name"
        placeholderTextColor={isDarkMode ? '#888' : '#666'}
        value={name}
        onChangeText={setName}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, !name.trim() && styles.disabledButton]}
          onPress={saveName}
          disabled={!name.trim()}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={clearStorage}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      {storedName && !isLoading && (
        <View style={styles.storedContainer}>
          <Text style={[styles.storedLabel, isDarkMode && styles.darkText]}>
            Stored in AsyncStorage:
          </Text>
          <Text style={[styles.storedValue, isDarkMode && styles.darkText]}>
            {storedName}
          </Text>
        </View>
      )}

      {!storedName && !isLoading && (
        <Text style={[styles.emptyState, isDarkMode && styles.darkDescription]}>
          No data in storage
        </Text>
      )}

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: User preferences, theme settings, form drafts, offline data
        persistence
      </Text>
    </View>
  );
};

const ObjectStateDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [user, { updateState, resetState, setProperty }] = useObjectState({
    name: 'Ayush',
    email: 'ayush@example.com',
    age: 22,
    isAdmin: false,
    preferences: {
      theme: 'light' as 'light' | 'dark',
      notifications: true,
      language: 'en',
    },
  });

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useObjectState
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Manage complex object state with partial updates and nested properties
      </Text>

      <View style={styles.objectDisplay}>
        <Text style={[styles.objectText, isDarkMode && styles.darkText]}>
          Name: {user.name}
        </Text>
        <Text style={[styles.objectText, isDarkMode && styles.darkText]}>
          Email: {user.email}
        </Text>
        <Text style={[styles.objectText, isDarkMode && styles.darkText]}>
          Age: {user.age}
        </Text>
        <Text style={[styles.objectText, isDarkMode && styles.darkText]}>
          Admin: {user.isAdmin ? 'Yes' : 'No'}
        </Text>
        <Text style={[styles.objectText, isDarkMode && styles.darkText]}>
          Theme: {user.preferences.theme}
        </Text>
        <Text style={[styles.objectText, isDarkMode && styles.darkText]}>
          Notifications: {user.preferences.notifications ? 'On' : 'Off'}
        </Text>
      </View>

      <View style={styles.objectControls}>
        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, styles.flex1, isDarkMode && styles.darkInput]}
            value={newName}
            onChangeText={setNewName}
            placeholder="Enter new name"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (newName.trim()) {
                setProperty('name', newName.trim());
                setNewName('');
              }
            }}
          >
            <Text style={styles.buttonText}>Update Name</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, styles.flex1, isDarkMode && styles.darkInput]}
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="Enter new email"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (newEmail.trim()) {
                setProperty('email', newEmail.trim());
                setNewEmail('');
              }
            }}
          >
            <Text style={styles.buttonText}>Update Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setProperty('age', user.age + 1)}
          >
            <Text style={styles.buttonText}>Age +1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setProperty('isAdmin', !user.isAdmin)}
          >
            <Text style={styles.buttonText}>Toggle Admin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              updateState({
                preferences: {
                  ...user.preferences,
                  theme: user.preferences.theme === 'light' ? 'dark' : 'light',
                },
              })
            }
          >
            <Text style={styles.buttonText}>Toggle Theme</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              updateState({
                preferences: {
                  ...user.preferences,
                  notifications: !user.preferences.notifications,
                },
              })
            }
          >
            <Text style={styles.buttonText}>Toggle Notifications</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() =>
              updateState(prev => ({
                age: prev.age + 5,
                name: `${prev.name} (Updated)`,
                preferences: {
                  ...prev.preferences,
                  language: prev.preferences.language === 'en' ? 'es' : 'en',
                },
              }))
            }
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Batch Update
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={resetState}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Reset All
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: User profiles, form management, settings, complex state
        updates
      </Text>
    </View>
  );
};

const ListDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [items, { push, removeAt, clear }] = useList([
    'Apple',
    'Banana',
    'Orange',
  ]);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      push(newItem.trim());
      setNewItem('');
    }
  };

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useList
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Manage arrays with convenient methods
      </Text>

      <View style={styles.listContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={[styles.listItemText, isDarkMode && styles.darkText]}>
              {item}
            </Text>
            <TouchableOpacity onPress={() => removeAt(index)}>
              <Text style={styles.removeButton}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.addItemContainer}>
        <TextInput
          style={[styles.input, styles.flex1, isDarkMode && styles.darkInput]}
          placeholder="Add new item"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          value={newItem}
          onChangeText={setNewItem}
        />
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={clear}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          Clear All
        </Text>
      </TouchableOpacity>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Todo lists, shopping carts, tag management
      </Text>
    </View>
  );
};

const MapDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [mapData, setMapData] = useState(
    new Map([
      ['React', '18.2.0'],
      ['TypeScript', '5.0.4'],
    ]),
  );

  const addItem = (key: string, value: string) => {
    setMapData(prev => new Map(prev.set(key, value)));
  };

  const removeItem = (key: string) => {
    setMapData(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  };

  const clearMap = () => {
    setMapData(new Map());
  };

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        Map State (useState)
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Manage Map data structure with reactive updates
      </Text>

      <View style={styles.mapContainer}>
        {Array.from(mapData.entries()).map(([key, value]) => (
          <View key={key} style={styles.mapItem}>
            <Text style={[styles.mapText, isDarkMode && styles.darkText]}>
              {key}: {value}
            </Text>
            <TouchableOpacity onPress={() => removeItem(key)}>
              <Text style={styles.removeButton}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => addItem('Vue', '3.3.0')}
        >
          <Text style={styles.buttonText}>Add Vue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={clearMap}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Configuration mapping, caching, key-value stores
      </Text>
    </View>
  );
};

const SetDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [setData, setSetData] = useState(new Set(['red', 'green', 'blue']));

  const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];

  const toggleColor = (color: string) => {
    setSetData(prev => {
      const newSet = new Set(prev);
      if (newSet.has(color)) {
        newSet.delete(color);
      } else {
        newSet.add(color);
      }
      return newSet;
    });
  };

  const clearSet = () => {
    setSetData(new Set());
  };

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        Set State (useState)
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Manage Set data structure with unique values
      </Text>

      <View style={styles.setContainer}>
        <Text style={[styles.setLabel, isDarkMode && styles.darkText]}>
          Selected colors:
        </Text>
        <View style={styles.setItems}>
          {Array.from(setData).map(color => (
            <View
              key={color}
              style={[styles.colorTag, { backgroundColor: color }]}
            >
              <Text style={styles.colorText}>{color}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.colorPicker}>
        {colors.map(color => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              setData.has(color) && styles.selectedColor,
            ]}
            onPress={() => toggleColor(color)}
          >
            <Text style={styles.colorButtonText}>{color}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={clearSet}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          Clear All
        </Text>
      </TouchableOpacity>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Tag selection, unique filters, permissions
      </Text>
    </View>
  );
};

const QueueDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const { add, remove, clear, first, last, size, queue } = useQueue([
    'Task 1',
    'Task 2',
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      add(newTask.trim());
      setNewTask('');
    }
  };

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useQueue
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Manage FIFO (First In, First Out) queue operations
      </Text>

      <View style={styles.queueInfo}>
        <Text style={[styles.queueText, isDarkMode && styles.darkText]}>
          Size: {size}
        </Text>
        <Text style={[styles.queueText, isDarkMode && styles.darkText]}>
          First: {first || 'None'}
        </Text>
        <Text style={[styles.queueText, isDarkMode && styles.darkText]}>
          Last: {last || 'None'}
        </Text>
      </View>

      <View style={styles.queueContainer}>
        {queue.map((task, index) => (
          <View key={index} style={styles.queueItem}>
            <Text style={[styles.queueItemText, isDarkMode && styles.darkText]}>
              {index + 1}. {task}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.addItemContainer}>
        <TextInput
          style={[styles.input, styles.flex1, isDarkMode && styles.darkInput]}
          placeholder="Add new task"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          value={newTask}
          onChangeText={setNewTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.buttonText}>Enqueue</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={remove}>
          <Text style={styles.buttonText}>Dequeue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={clear}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Task processing, breadcrumb navigation, undo/redo
      </Text>
    </View>
  );
};

const DefaultDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [value, setValue] = useDefault('', 'Default Value');
  const [number, setNumber] = useDefault(0, 42);

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useDefault
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Provide default values when state is empty or falsy
      </Text>

      <View style={styles.defaultContainer}>
        <Text style={[styles.defaultLabel, isDarkMode && styles.darkText]}>
          Text: "{value}" (shows default when empty)
        </Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Type something..."
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          value={value}
          onChangeText={setValue}
        />

        <Text style={[styles.defaultLabel, isDarkMode && styles.darkText]}>
          Number: {number} (shows 42 when 0)
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setNumber(number + 1)}
          >
            <Text style={styles.buttonText}>+1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setNumber(0)}>
            <Text style={styles.buttonText}>Reset to 0</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Form placeholders, fallback values, empty states
      </Text>
    </View>
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
  demoCard: {
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
  demoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  demoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  useCase: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 12,
    lineHeight: 18,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  counterValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#666',
  },
  secondaryButtonText: {
    color: '#fff',
  },
  toggleContainer: {
    marginBottom: 8,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  darkInput: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  storedValue: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
    textAlign: 'center',
  },
  objectDisplay: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  objectText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  listContainer: {
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginBottom: 4,
  },
  listItemText: {
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    fontSize: 18,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flex1: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  addButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapContainer: {
    marginBottom: 12,
  },
  mapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    marginBottom: 4,
  },
  mapText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  setContainer: {
    marginBottom: 12,
  },
  setLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  setItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  colorTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  colorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  colorButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 4,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#333',
  },
  colorButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  queueInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  queueText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  queueContainer: {
    marginBottom: 12,
  },
  queueItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff3e0',
    borderRadius: 6,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#ff9800',
  },
  queueItemText: {
    fontSize: 14,
    color: '#333',
  },
  defaultContainer: {
    marginBottom: 8,
  },
  defaultLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  booleanContainer: {
    marginBottom: 12,
  },
  booleanItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  booleanLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  booleanButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  smallButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  smallButtonText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: '#2196f3',
  },
  activeButtonText: {
    color: '#fff',
  },
  objectControls: {
    marginBottom: 12,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  darkText: {
    color: '#fff',
  },
  darkDescription: {
    color: '#888',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: '#ffebee',
    borderRadius: 6,
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  storedContainer: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  storedLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  emptyState: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default StateManagementScreen;
