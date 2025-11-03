import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  useColorScheme,
} from 'react-native';

const useFetch = (url: string | null) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, error, loading };
};

// useAsync hook for handling generic async operations
const useAsync = <T = any,>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate = true,
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  const [lastCallTime, setLastCallTime] = useState<number>(0);

  const execute = useCallback(
    async (...args: any[]): Promise<T | undefined> => {
      setLoading(true);
      setError(null);
      setLastCallTime(Date.now());

      try {
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error('An unknown error occurred');
        setError(errorObj);
        throw errorObj;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setLastCallTime(0);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    lastCallTime,
  };
};

// useAsyncFn hook for manual async function triggering
const useAsyncFn = <T = any,>(
  asyncFunction: (...args: any[]) => Promise<T>,
) => {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
    lastCallTime: number;
  }>({
    data: null,
    loading: false,
    error: null,
    lastCallTime: 0,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | undefined> => {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        lastCallTime: Date.now(),
      }));

      try {
        const result = await asyncFunction(...args);
        setState(prev => ({ ...prev, data: result, loading: false }));
        return result;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error('An unknown error occurred');
        setState(prev => ({ ...prev, error: errorObj, loading: false }));
        throw errorObj;
      }
    },
    [asyncFunction],
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastCallTime: 0,
    });
  }, []);

  return [state, { execute, reset }] as const;
};

// Enhanced useFetch hook with CRUD operations
const useListFetch = (initialUrl: string | null) => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(Array.isArray(result) ? result : [result]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (url: string, newItem: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(prev => [...prev, result]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (url: string, updatedItem: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(prev =>
        prev.map(item => (item.id === updatedItem.id ? result : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (url: string, itemId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setData(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialUrl) {
      fetchData(initialUrl);
    }
  }, [initialUrl]);

  return {
    data,
    error,
    loading,
    fetchData,
    addItem,
    updateItem,
    deleteItem,
    setData,
  };
};

const CRUDListDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const {
    data: todos,
    error,
    loading,
    addItem,
    updateItem,
    deleteItem,
    setData,
  } = useListFetch('https://jsonplaceholder.typicode.com/todos?_limit=5');

  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) return;

    const newTodo = {
      title: newTodoTitle.trim(),
      completed: false,
      userId: 1,
    };

    // For demo purposes, we'll simulate the API response
    const simulatedResponse = {
      ...newTodo,
      id: Math.max(...todos.map(t => t.id), 0) + 1,
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setData(prev => [...prev, simulatedResponse]);
    setNewTodoTitle('');
  };

  const handleUpdateTodo = async (todo: any) => {
    if (!editingTitle.trim()) return;

    const updatedTodo = {
      ...todo,
      title: editingTitle.trim(),
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setData(prev =>
      prev.map(item => (item.id === todo.id ? updatedTodo : item)),
    );

    setEditingId(null);
    setEditingTitle('');
  };

  const handleDeleteTodo = async (todoId: number) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setData(prev => prev.filter(item => item.id !== todoId));
  };

  const handleToggleComplete = async (todo: any) => {
    const updatedTodo = {
      ...todo,
      completed: !todo.completed,
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    setData(prev =>
      prev.map(item => (item.id === todo.id ? updatedTodo : item)),
    );
  };

  const startEditing = (todo: any) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        CRUD List with useFetch
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Interactive todo list demonstrating Create, Read, Update, Delete
        operations with loading states
      </Text>

      {/* Add New Todo */}
      <View style={styles.addTodoContainer}>
        <TextInput
          style={[
            styles.input,
            styles.todoInput,
            isDarkMode && styles.darkInput,
          ]}
          value={newTodoTitle}
          onChangeText={setNewTodoTitle}
          placeholder="Enter new todo..."
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          onSubmitEditing={handleAddTodo}
        />
        <TouchableOpacity
          style={[
            styles.button,
            styles.addButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleAddTodo}
          disabled={loading || !newTodoTitle.trim()}
        >
          <Text style={styles.buttonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1976d2" />
          <Text
            style={[styles.loadingText, isDarkMode && styles.darkDescription]}
          >
            Processing...
          </Text>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View
          style={[
            styles.errorContainer,
            isDarkMode && styles.darkErrorContainer,
          ]}
        >
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {/* Todo List */}
      <View style={styles.todoListContainer}>
        <Text style={[styles.listHeader, isDarkMode && styles.darkText]}>
          Todo List ({todos.length} items)
        </Text>

        {todos.length === 0 ? (
          <Text
            style={[styles.emptyList, isDarkMode && styles.darkDescription]}
          >
            No todos yet. Add one above!
          </Text>
        ) : (
          todos.map(todo => (
            <View
              key={todo.id}
              style={[styles.todoItem, isDarkMode && styles.darkTodoItem]}
            >
              {/* Todo Content */}
              <View style={styles.todoContent}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => handleToggleComplete(todo)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      todo.completed && styles.checkedBox,
                      isDarkMode && styles.darkCheckbox,
                      todo.completed && isDarkMode && styles.darkCheckedBox,
                    ]}
                  >
                    {todo.completed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>

                <View style={styles.todoTextContainer}>
                  {editingId === todo.id ? (
                    <TextInput
                      style={[
                        styles.editInput,
                        isDarkMode && styles.darkEditInput,
                      ]}
                      value={editingTitle}
                      onChangeText={setEditingTitle}
                      onSubmitEditing={() => handleUpdateTodo(todo)}
                      autoFocus
                    />
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.todoTitle,
                          isDarkMode && styles.darkText,
                          todo.completed && styles.completedText,
                        ]}
                      >
                        {todo.title}
                      </Text>
                      <Text
                        style={[
                          styles.todoId,
                          isDarkMode && styles.darkDescription,
                        ]}
                      >
                        ID: {todo.id}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.todoActions}>
                {editingId === todo.id ? (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.saveButton]}
                      onPress={() => handleUpdateTodo(todo)}
                    >
                      <Text style={styles.actionButtonText}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={cancelEditing}
                    >
                      <Text style={styles.actionButtonText}>✕</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => startEditing(todo)}
                    >
                      <Text style={styles.actionButtonText}>✎</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteTodo(todo.id)}
                    >
                      <Text style={styles.actionButtonText}>🗑</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Statistics */}
      <View
        style={[styles.statsContainer, isDarkMode && styles.darkStatsContainer]}
      >
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDarkMode && styles.darkText]}>
            Total:
          </Text>
          <Text style={[styles.statValue, isDarkMode && styles.darkText]}>
            {todos.length}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDarkMode && styles.darkText]}>
            Completed:
          </Text>
          <Text style={[styles.statValue, styles.completedStat]}>
            {todos.filter(t => t.completed).length}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDarkMode && styles.darkText]}>
            Pending:
          </Text>
          <Text style={[styles.statValue, styles.pendingStat]}>
            {todos.filter(t => !t.completed).length}
          </Text>
        </View>
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Todo apps, data management, real-time updates, CRUD
        operations, state synchronization
      </Text>
    </View>
  );
};

// Custom implementation of useContinuousRetry
const useContinuousRetry = (
  callback: () => Promise<any>,
  interval: number = 2000,
  maxRetries: number = 5,
) => {
  const [attempts, setAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retry = async () => {
    if (attempts >= maxRetries) {
      setError('Max retries reached');
      return;
    }

    setIsRetrying(true);
    setAttempts(prev => prev + 1);

    try {
      await callback();
      setSuccess(true);
      setIsRetrying(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Retry failed');

      if (attempts < maxRetries - 1) {
        setTimeout(() => {
          retry();
        }, interval);
      } else {
        setIsRetrying(false);
      }
    }
  };

  const reset = () => {
    setAttempts(0);
    setIsRetrying(false);
    setSuccess(false);
    setError(null);
  };

  return { retry, reset, attempts, isRetrying, success, error, maxRetries };
};

const DataFetchingHooksScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <FetchDemo isDarkMode={isDarkMode} />
      <AsyncDemo isDarkMode={isDarkMode} />
      <AsyncFnDemo isDarkMode={isDarkMode} />
      <CRUDListDemo isDarkMode={isDarkMode} />
      <ContinuousRetryDemo isDarkMode={isDarkMode} />
      {/* <AsyncDataDemo isDarkMode={isDarkMode} /> */}
      {/* <CacheDemo isDarkMode={isDarkMode} /> */}
    </ScrollView>
  );
};

const FetchDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [pokemonId, setPokemonId] = useState(1);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const { data, error, loading } = useFetch(currentUrl);

  const fetchPokemon = () => {
    setCurrentUrl(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
  };

  const nextPokemon = () => {
    const newId = pokemonId + 1;
    setPokemonId(newId);
    setCurrentUrl(`https://pokeapi.co/api/v2/pokemon/${newId}`);
  };

  const prevPokemon = () => {
    const newId = Math.max(1, pokemonId - 1);
    setPokemonId(newId);
    setCurrentUrl(`https://pokeapi.co/api/v2/pokemon/${newId}`);
  };

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useFetch
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Fetch data with accurate states, caching, and no stale responses
      </Text>

      <View style={styles.fetchControls}>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={pokemonId.toString()}
          onChangeText={text => setPokemonId(parseInt(text, 10) || 1)}
          placeholder="Pokemon ID"
          placeholderTextColor={isDarkMode ? '#888' : '#666'}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={fetchPokemon}>
          <Text style={styles.buttonText}>Fetch Pokemon</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.button, styles.navButton]}
          onPress={prevPokemon}
          disabled={pokemonId <= 1}
        >
          <Text style={styles.buttonText}>← Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.navButton]}
          onPress={nextPokemon}
        >
          <Text style={styles.buttonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text
            style={[styles.loadingText, isDarkMode && styles.darkDescription]}
          >
            Fetching Pokemon data...
          </Text>
        </View>
      )}

      {error && (
        <View
          style={[
            styles.errorContainer,
            isDarkMode && styles.darkErrorContainer,
          ]}
        >
          <Text style={styles.errorText}>❌ Error: {error}</Text>
        </View>
      )}

      {data && !loading && (
        <View
          style={[styles.pokemonCard, isDarkMode && styles.darkPokemonCard]}
        >
          <Image
            source={{ uri: data.sprites?.front_default }}
            style={styles.pokemonImage}
            resizeMode="contain"
          />
          <Text style={[styles.pokemonName, isDarkMode && styles.darkText]}>
            {data.name?.charAt(0).toUpperCase() + data.name?.slice(1)}
          </Text>
          <Text
            style={[styles.pokemonId, isDarkMode && styles.darkDescription]}
          >
            #{data.id}
          </Text>
          <View style={styles.pokemonTypes}>
            {data.types?.map((type: any, index: number) => (
              <View key={index} style={styles.typeTag}>
                <Text style={styles.typeText}>{type.type.name}</Text>
              </View>
            ))}
          </View>
          <Text
            style={[styles.pokemonStats, isDarkMode && styles.darkDescription]}
          >
            Height: {data.height / 10}m | Weight: {data.weight / 10}kg
          </Text>
        </View>
      )}

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: API calls, data loading, error handling, caching strategies
      </Text>
    </View>
  );
};

const AsyncDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  // Mock async function that simulates API calls
  const fetchUserData = async (userId: number): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

    if (userId === 404) {
      throw new Error('User not found');
    }

    return {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      avatar: `https://robohash.org/${userId}?size=100x100`,
      joinDate: new Date().toLocaleDateString(),
      isActive: Math.random() > 0.3,
    };
  };

  const [userId, setUserId] = useState(1);
  const {
    data: user,
    loading,
    error,
    execute,
    reset,
    lastCallTime,
  } = useAsync(fetchUserData, false);

  const loadUser = () => {
    execute(userId);
  };

  const loadRandomUser = () => {
    const randomId = Math.floor(Math.random() * 10) + 1;
    setUserId(randomId);
    execute(randomId);
  };

  const loadErrorUser = () => {
    setUserId(404);
    execute(404);
  };

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useAsync
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Handle async operations with loading, error, and data states. Automatic
        execution on mount.
      </Text>

      <View style={styles.asyncControls}>
        <View style={styles.inputRow}>
          <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>
            User ID:
          </Text>
          <TextInput
            style={[styles.userIdInput, isDarkMode && styles.darkInput]}
            value={userId.toString()}
            onChangeText={text => setUserId(parseInt(text, 10) || 1)}
            keyboardType="numeric"
            placeholder="Enter user ID"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={loadUser}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : 'Load User'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={loadRandomUser}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Random User
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={loadErrorUser}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Error Test</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={reset}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View
          style={[
            styles.loadingContainer,
            isDarkMode && styles.darkLoadingContainer,
          ]}
        >
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            Fetching user data...
          </Text>
        </View>
      )}

      {error && (
        <View
          style={[
            styles.errorContainer,
            isDarkMode && styles.darkErrorContainer,
          ]}
        >
          <Text style={styles.errorText}>❌ Error: {error.message}</Text>
        </View>
      )}

      {user && !loading && (
        <View style={[styles.userCard, isDarkMode && styles.darkUserCard]}>
          <Image
            source={{ uri: user.avatar }}
            style={styles.userAvatar}
            resizeMode="contain"
          />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, isDarkMode && styles.darkText]}>
              {user.name}
            </Text>
            <Text
              style={[styles.userEmail, isDarkMode && styles.darkDescription]}
            >
              {user.email}
            </Text>
            <Text
              style={[styles.userDetail, isDarkMode && styles.darkDescription]}
            >
              ID: {user.id} | Joined: {user.joinDate}
            </Text>
            <View
              style={[
                styles.statusBadge,
                user.isActive ? styles.activeBadge : styles.inactiveBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {lastCallTime > 0 && (
        <Text
          style={[styles.timestampText, isDarkMode && styles.darkDescription]}
        >
          Last call: {new Date(lastCallTime).toLocaleTimeString()}
        </Text>
      )}

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: User profiles, API calls with automatic execution, data
        loading with state management
      </Text>
    </View>
  );
};

const AsyncFnDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  // Mock async functions for different operations
  const loginUser = async (
    username: string,
    password: string,
  ): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (username === 'admin' && password === 'password') {
      return {
        token: 'abc123',
        user: { id: 1, username: 'admin', role: 'administrator' },
        message: 'Login successful',
      };
    }

    throw new Error('Invalid credentials');
  };

  const submitForm = async (formData: any): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!formData.name || !formData.email) {
      throw new Error('Name and email are required');
    }

    return {
      id: Math.floor(Math.random() * 1000),
      ...formData,
      createdAt: new Date().toISOString(),
      message: 'Form submitted successfully',
    };
  };

  const [loginState, { execute: executeLogin, reset: resetLogin }] =
    useAsyncFn(loginUser);
  const [submitState, { execute: executeSubmit, reset: resetSubmit }] =
    useAsyncFn(submitForm);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');

  const handleLogin = () => {
    executeLogin(username, password);
  };

  const handleSubmit = () => {
    executeSubmit({ name: formName, email: formEmail });
  };

  const quickLogin = () => {
    setUsername('admin');
    setPassword('password');
    executeLogin('admin', 'password');
  };

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useAsyncFn
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Manual async function execution with individual state management for
        each operation.
      </Text>

      {/* Login Section */}
      <View style={styles.asyncSection}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          🔐 Login Demo
        </Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            value={username}
            onChangeText={setUsername}
            placeholder="Username (try 'admin')"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            value={password}
            onChangeText={setPassword}
            placeholder="Password (try 'password')"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            secureTextEntry
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, loginState.loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loginState.loading}
          >
            <Text style={styles.buttonText}>
              {loginState.loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={quickLogin}
            disabled={loginState.loading}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Quick Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={resetLogin}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        {loginState.error && (
          <View
            style={[
              styles.errorContainer,
              isDarkMode && styles.darkErrorContainer,
            ]}
          >
            <Text style={styles.errorText}>❌ {loginState.error.message}</Text>
          </View>
        )}

        {loginState.data && (
          <View
            style={[
              styles.successContainer,
              isDarkMode && styles.darkSuccessContainer,
            ]}
          >
            <Text style={styles.successText}>✅ {loginState.data.message}</Text>
            <Text
              style={[styles.tokenText, isDarkMode && styles.darkDescription]}
            >
              Token: {loginState.data.token}
            </Text>
          </View>
        )}
      </View>

      {/* Form Section */}
      <View style={styles.asyncSection}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
          📝 Form Submit Demo
        </Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            value={formName}
            onChangeText={setFormName}
            placeholder="Enter your name"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
          />
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            value={formEmail}
            onChangeText={setFormEmail}
            placeholder="Enter your email"
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              submitState.loading && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={submitState.loading}
          >
            <Text style={styles.buttonText}>
              {submitState.loading ? 'Submitting...' : 'Submit Form'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={resetSubmit}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        {submitState.error && (
          <View
            style={[
              styles.errorContainer,
              isDarkMode && styles.darkErrorContainer,
            ]}
          >
            <Text style={styles.errorText}>❌ {submitState.error.message}</Text>
          </View>
        )}

        {submitState.data && (
          <View
            style={[
              styles.successContainer,
              isDarkMode && styles.darkSuccessContainer,
            ]}
          >
            <Text style={styles.successText}>
              ✅ {submitState.data.message}
            </Text>
            <Text
              style={[
                styles.responseText,
                isDarkMode && styles.darkDescription,
              ]}
            >
              ID: {submitState.data.id} | Created:{' '}
              {new Date(submitState.data.createdAt).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Form submissions, login systems, user-triggered operations,
        independent async operations
      </Text>
    </View>
  );
};

const ContinuousRetryDemo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [failureRate, setFailureRate] = useState(70); // 70% failure rate

  const mockAsyncOperation = async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() * 100 < failureRate) {
          reject(new Error('Simulated network failure'));
        } else {
          resolve('Success! Operation completed.');
        }
      }, 1000);
    });
  };

  const { retry, reset, attempts, isRetrying, success, error, maxRetries } =
    useContinuousRetry(mockAsyncOperation, 1500, 3);

  return (
    <View style={[styles.demoCard, isDarkMode && styles.darkCard]}>
      <Text style={[styles.demoTitle, isDarkMode && styles.darkText]}>
        useContinuousRetry
      </Text>
      <Text
        style={[styles.demoDescription, isDarkMode && styles.darkDescription]}
      >
        Automates retries of a callback function until it succeeds
      </Text>

      <View style={styles.retryControls}>
        <View style={styles.failureRateControl}>
          <Text style={[styles.label, isDarkMode && styles.darkText]}>
            Failure Rate: {failureRate}%
          </Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setFailureRate(Math.max(0, failureRate - 10))}
            >
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderValue}>
              <Text style={[styles.sliderText, isDarkMode && styles.darkText]}>
                {failureRate}%
              </Text>
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setFailureRate(Math.min(100, failureRate + 10))}
            >
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isRetrying && styles.disabledButton]}
          onPress={retry}
          disabled={isRetrying || success}
        >
          <Text style={styles.buttonText}>
            {isRetrying ? 'Retrying...' : 'Start Operation'}
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

      <View style={[styles.retryStatus, isDarkMode && styles.darkRetryStatus]}>
        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, isDarkMode && styles.darkText]}>
            Attempts:
          </Text>
          <Text style={[styles.statusValue, isDarkMode && styles.darkText]}>
            {attempts} / {maxRetries}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, isDarkMode && styles.darkText]}>
            Status:
          </Text>
          <Text
            style={[
              styles.statusValue,
              isDarkMode && styles.darkText,
              success
                ? styles.successText
                : error
                ? styles.errorText
                : undefined,
            ]}
          >
            {isRetrying
              ? ' Retrying...'
              : success
              ? 'Success'
              : error
              ? ' Failed'
              : 'Ready'}
          </Text>
        </View>

        {isRetrying && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="small" color="#1976d2" />
            <Text
              style={[
                styles.progressText,
                isDarkMode && styles.darkDescription,
              ]}
            >
              Attempt {attempts} in progress...
            </Text>
          </View>
        )}

        {error && attempts >= maxRetries && (
          <Text
            style={[styles.finalError, isDarkMode && styles.darkDescription]}
          >
            All retry attempts exhausted. Final error: {error}
          </Text>
        )}

        {success && (
          <Text style={[styles.successMessage, isDarkMode && styles.darkText]}>
            🎉 Operation succeeded after {attempts} attempt(s)!
          </Text>
        )}
      </View>

      <Text style={[styles.useCase, isDarkMode && styles.darkDescription]}>
        Use case: Network requests, API calls, unreliable operations, resilient
        data fetching
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
  button: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#666',
  },
  secondaryButtonText: {
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  darkInput: {
    backgroundColor: '#3a3a3a',
    borderColor: '#555',
    color: '#fff',
  },
  fetchControls: {
    marginBottom: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  darkErrorContainer: {
    backgroundColor: '#4a2626',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    fontWeight: '500',
  },
  pokemonCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  darkPokemonCard: {
    backgroundColor: '#3a3a3a',
  },
  pokemonImage: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  pokemonName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pokemonId: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  pokemonTypes: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typeTag: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  pokemonStats: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryControls: {
    marginBottom: 16,
  },
  failureRateControl: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  sliderButton: {
    backgroundColor: '#1976d2',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sliderValue: {
    minWidth: 80,
    alignItems: 'center',
  },
  sliderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  retryStatus: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  darkRetryStatus: {
    backgroundColor: '#3a3a3a',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusValue: {
    fontSize: 14,
    color: '#333',
  },
  successText: {
    color: '#2e7d32',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  finalError: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    marginTop: 8,
  },
  usersContainer: {
    gap: 8,
    marginBottom: 12,
  },
  userCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  darkUserCard: {
    backgroundColor: '#3a3a3a',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userCompany: {
    fontSize: 12,
    color: '#888',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  quickSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  darkQuickButton: {
    backgroundColor: '#1976d2',
  },
  quickButtonText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
  requestsLog: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 100,
  },
  darkRequestsLog: {
    backgroundColor: '#3a3a3a',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  smallButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 0,
  },
  noRequests: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  requestItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingVertical: 2,
  },
  cacheHit: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  apiCall: {
    color: '#f57c00',
    fontWeight: '500',
  },
  cacheStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
  darkText: {
    color: '#fff',
  },
  darkDescription: {
    color: '#888',
  },
  // CRUD Demo Styles
  addTodoContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  todoInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 0,
  },
  todoListContainer: {
    marginBottom: 16,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyList: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  todoItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  darkTodoItem: {
    backgroundColor: '#3a3a3a',
    borderColor: '#555',
  },
  todoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  darkCheckbox: {
    borderColor: '#666',
    backgroundColor: '#555',
  },
  checkedBox: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  darkCheckedBox: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  todoTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  todoTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  todoId: {
    fontSize: 12,
    color: '#666',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#1976d2',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  darkEditInput: {
    backgroundColor: '#555',
    borderColor: '#1976d2',
    color: '#fff',
  },
  todoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#2196f3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  saveButton: {
    backgroundColor: '#4caf50',
  },
  cancelButton: {
    backgroundColor: '#ff9800',
  },
  statsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  darkStatsContainer: {
    backgroundColor: '#3a3a3a',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  completedStat: {
    color: '#4caf50',
  },
  pendingStat: {
    color: '#ff9800',
  },
  // New styles for useAsync and useAsyncFn demos
  asyncControls: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    minWidth: 70,
  },
  userIdInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  errorButton: {
    backgroundColor: '#f44336',
  },
  darkLoadingContainer: {
    backgroundColor: '#2a2a2a',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userDetail: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: '#4caf50',
  },
  inactiveBadge: {
    backgroundColor: '#f44336',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  asyncSection: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  successContainer: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  darkSuccessContainer: {
    backgroundColor: '#1b5e20',
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  responseText: {
    fontSize: 12,
    color: '#666',
  },
});

export default DataFetchingHooksScreen;
