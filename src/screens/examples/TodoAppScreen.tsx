import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  Modal,
} from 'react-native';
import {
  useList,
  useToggle,
  useCounter,
  useDebounce,
} from '@uidotdev/usehooks';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  createdAt: number;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

const TodoAppScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';

  // Main todo list management
  const [todos, { push: addTodo, removeAt: removeTodo, set: setTodos }] =
    useList<Todo>([
      {
        id: '1',
        text: 'Complete React Native project',
        completed: false,
        priority: 'high',
        category: 'work',
        createdAt: Date.now() - 86400000,
        tags: ['development', 'urgent'],
      },
      {
        id: '2',
        text: 'Buy groceries',
        completed: true,
        priority: 'medium',
        category: 'personal',
        createdAt: Date.now() - 172800000,
        tags: ['shopping'],
      },
      {
        id: '3',
        text: 'Learn useHooks patterns',
        completed: false,
        priority: 'medium',
        category: 'learning',
        createdAt: Date.now() - 3600000,
        tags: ['education', 'hooks'],
      },
    ]);

  // Categories management
  const [categories] = useState<Category[]>([
    { id: 'all', name: 'All', color: '#666', count: 0 },
    { id: 'work', name: 'Work', color: '#1976d2', count: 0 },
    { id: 'personal', name: 'Personal', color: '#4caf50', count: 0 },
    { id: 'learning', name: 'Learning', color: '#ff9800', count: 0 },
    { id: 'health', name: 'Health', color: '#e91e63', count: 0 },
  ]);

  // UI State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState<
    'all' | 'low' | 'medium' | 'high'
  >('all');
  const [showCompleted, toggleShowCompleted] = useToggle(true);
  const [isAddModalVisible, toggleAddModal] = useToggle(false);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'alphabetical'>(
    'date',
  );

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Form state for new todo
  const [newTodo, setNewTodo] = useState({
    text: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'personal',
    tags: '',
    dueDate: '',
  });

  // Statistics - Fixed to recalculate properly
  const totalTodos = todos.length;
  const completedCount = todos.filter(todo => todo.completed).length;
  const pendingCount = totalTodos - completedCount;

  // Fix: Calculate completion rate dynamically
  const completionRate = useMemo(() => {
    return totalTodos > 0 ? Math.round((completedCount / totalTodos) * 100) : 0;
  }, [completedCount, totalTodos]);

  // Progress tracking
  const [productivityScore, { increment: incrementScore, reset: resetScore }] =
    useCounter(85);

  // Filter and sort todos
  const filteredAndSortedTodos = useCallback(() => {
    let filtered = todos.filter(todo => {
      // Category filter
      if (selectedCategory !== 'all' && todo.category !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && todo.priority !== selectedPriority) {
        return false;
      }

      // Completed filter
      if (!showCompleted && todo.completed) {
        return false;
      }

      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        return (
          todo.text.toLowerCase().includes(searchLower) ||
          todo.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          todo.category.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    // Sort todos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        case 'date':
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return filtered;
  }, [
    todos,
    selectedCategory,
    selectedPriority,
    showCompleted,
    debouncedSearch,
    sortBy,
  ]);

  const toggleTodo = useCallback(
    (todoId: string) => {
      const todoIndex = todos.findIndex(todo => todo.id === todoId);
      if (todoIndex >= 0) {
        const updatedTodos = [...todos];
        const wasCompleted = updatedTodos[todoIndex].completed;
        updatedTodos[todoIndex] = {
          ...updatedTodos[todoIndex],
          completed: !updatedTodos[todoIndex].completed,
        };
        setTodos(updatedTodos);

        // Update productivity score - Fix: Check if completing (not uncompleting)
        if (!wasCompleted && updatedTodos[todoIndex].completed) {
          incrementScore();
        }
      }
    },
    [todos, setTodos, incrementScore],
  );

  const deleteTodo = useCallback(
    (todoId: string) => {
      const todoIndex = todos.findIndex(todo => todo.id === todoId);
      if (todoIndex >= 0) {
        Alert.alert(
          'Delete Todo',
          'Are you sure you want to delete this todo?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                removeTodo(todoIndex);
                console.log('Todo deleted, remaining todos:', todos.length - 1);
              },
            },
          ],
        );
      }
    },
    [todos, removeTodo],
  );

  // Fix: Improved addNewTodo function
  const addNewTodo = useCallback(() => {
    if (!newTodo.text.trim()) {
      Alert.alert('Error', 'Please enter a todo text');
      return;
    }

    const todo: Todo = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      text: newTodo.text.trim(),
      completed: false,
      priority: newTodo.priority,
      category: newTodo.category,
      createdAt: Date.now(),
      tags: newTodo.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
      dueDate: newTodo.dueDate || undefined,
    };

    console.log('Adding new todo:', todo);
    console.log('Current todos count:', todos.length);

    // Fix: Use a more reliable way to add todo
    setTodos([...todos, todo]);

    // Reset form
    setNewTodo({
      text: '',
      priority: 'medium',
      category: 'personal',
      tags: '',
      dueDate: '',
    });

    // Close modal
    toggleAddModal();

    console.log('Todo added successfully');
  }, [newTodo, todos, setTodos, toggleAddModal]);

  // Add a clear all todos function for testing
  const clearAllTodos = useCallback(() => {
    Alert.alert(
      'Clear All Todos',
      'Are you sure you want to delete all todos?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setTodos([]);
            resetScore();
            console.log('All todos cleared');
          },
        },
      ],
    );
  }, [setTodos, resetScore]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#666';
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#666';
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header with Statistics */}
      <View style={[styles.header, isDarkMode && styles.darkCard]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            Advanced Todo App
          </Text>

          {/* Add Clear All button for testing */}
          {totalTodos > 0 && (
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={clearAllTodos}
            >
              <Text style={styles.clearAllButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, isDarkMode && styles.darkText]}>
              {totalTodos}
            </Text>
            <Text
              style={[styles.statLabel, isDarkMode && styles.darkDescription]}
            >
              Total
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#4caf50' }]}>
              {completedCount}
            </Text>
            <Text
              style={[styles.statLabel, isDarkMode && styles.darkDescription]}
            >
              Done
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#ff9800' }]}>
              {pendingCount}
            </Text>
            <Text
              style={[styles.statLabel, isDarkMode && styles.darkDescription]}
            >
              Pending
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#1976d2' }]}>
              {productivityScore}
            </Text>
            <Text
              style={[styles.statLabel, isDarkMode && styles.darkDescription]}
            >
              Score
            </Text>
          </View>
        </View>

        {totalTodos > 0 && (
          <>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${completionRate}%` }]}
              />
            </View>
            <Text
              style={[
                styles.progressText,
                isDarkMode && styles.darkDescription,
              ]}
            >
              {completionRate}% Completed
            </Text>
          </>
        )}

        {totalTodos === 0 && (
          <View style={styles.emptyStatsState}>
            <Text
              style={[
                styles.emptyStatsText,
                isDarkMode && styles.darkDescription,
              ]}
            >
              No todos yet. Add your first todo below! 🚀
            </Text>
          </View>
        )}
      </View>

      {/* Search and Filters - Only show if there are todos */}
      {totalTodos > 0 && (
        <View style={[styles.filtersContainer, isDarkMode && styles.darkCard]}>
          <TextInput
            style={[styles.searchInput, isDarkMode && styles.darkInput]}
            placeholder="Search todos, tags, or categories..."
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  { borderColor: category.color },
                  selectedCategory === category.id && {
                    backgroundColor: category.color,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    {
                      color:
                        selectedCategory === category.id
                          ? '#fff'
                          : category.color,
                    },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Priority and Sort Controls */}
          <View style={styles.controlsRow}>
            <View style={styles.priorityFilter}>
              <Text style={[styles.filterLabel, isDarkMode && styles.darkText]}>
                Priority:
              </Text>
              {(['all', 'high', 'medium', 'low'] as const).map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    selectedPriority === priority &&
                      styles.selectedPriorityButton,
                  ]}
                  onPress={() => setSelectedPriority(priority)}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      selectedPriority === priority &&
                        styles.selectedPriorityText,
                    ]}
                  >
                    {priority}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                showCompleted && styles.toggleButtonActive,
              ]}
              onPress={() => toggleShowCompleted()}
            >
              <Text style={styles.toggleButtonText}>
                {showCompleted ? 'Hide' : 'Show'} Completed
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Todo List */}
      <ScrollView style={styles.todoList}>
        {filteredAndSortedTodos().map((todo, index) => (
          <View
            key={todo.id}
            style={[styles.todoItem, isDarkMode && styles.darkTodoItem]}
          >
            <TouchableOpacity
              style={styles.todoContent}
              onPress={() => toggleTodo(todo.id)}
            >
              <View style={styles.todoHeader}>
                <View
                  style={[
                    styles.checkbox,
                    todo.completed && styles.checkboxCompleted,
                  ]}
                >
                  {todo.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>

                <Text
                  style={[
                    styles.todoText,
                    isDarkMode && styles.darkText,
                    todo.completed && styles.completedText,
                  ]}
                >
                  {todo.text}
                </Text>

                <View
                  style={[
                    styles.priorityIndicator,
                    { backgroundColor: getPriorityColor(todo.priority) },
                  ]}
                />
              </View>

              <View style={styles.todoMeta}>
                <View
                  style={[
                    styles.categoryTag,
                    { backgroundColor: getCategoryColor(todo.category) },
                  ]}
                >
                  <Text style={styles.categoryTagText}>
                    {categories.find(cat => cat.id === todo.category)?.name}
                  </Text>
                </View>

                {todo.tags.map((tag, tagIndex) => (
                  <View key={tagIndex} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}

                <Text
                  style={[
                    styles.dateText,
                    isDarkMode && styles.darkDescription,
                  ]}
                >
                  {new Date(todo.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTodo(todo.id)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        {totalTodos > 0 && filteredAndSortedTodos().length === 0 && (
          <View style={styles.emptyState}>
            <Text
              style={[
                styles.emptyStateText,
                isDarkMode && styles.darkDescription,
              ]}
            >
              {debouncedSearch
                ? 'No todos match your search'
                : 'No todos found with current filters'}
            </Text>
          </View>
        )}

        {totalTodos === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📝</Text>
            <Text
              style={[
                styles.emptyStateText,
                isDarkMode && styles.darkDescription,
              ]}
            >
              Your todo list is empty
            </Text>
            <Text
              style={[
                styles.emptyStateSubtext,
                isDarkMode && styles.darkDescription,
              ]}
            >
              Tap the "Add Todo" button below to get started!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Todo Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => toggleAddModal()}
      >
        <Text style={styles.addButtonText}>+ Add Todo</Text>
      </TouchableOpacity>

      {/* Add Todo Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => toggleAddModal()}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              Add New Todo
            </Text>

            <TextInput
              style={[styles.modalInput, isDarkMode && styles.darkInput]}
              placeholder="What needs to be done?"
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
              value={newTodo.text}
              onChangeText={text => setNewTodo(prev => ({ ...prev, text }))}
              multiline
              autoFocus
            />

            <View style={styles.modalRow}>
              <Text style={[styles.modalLabel, isDarkMode && styles.darkText]}>
                Priority:
              </Text>
              <View style={styles.modalPriorityContainer}>
                {(['low', 'medium', 'high'] as const).map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.modalPriorityButton,
                      { borderColor: getPriorityColor(priority) },
                      newTodo.priority === priority && {
                        backgroundColor: getPriorityColor(priority),
                      },
                    ]}
                    onPress={() => setNewTodo(prev => ({ ...prev, priority }))}
                  >
                    <Text
                      style={[
                        styles.modalPriorityText,
                        {
                          color:
                            newTodo.priority === priority
                              ? '#fff'
                              : getPriorityColor(priority),
                        },
                      ]}
                    >
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalRow}>
              <Text style={[styles.modalLabel, isDarkMode && styles.darkText]}>
                Category:
              </Text>
              <View style={styles.modalCategoryContainer}>
                {categories
                  .filter(cat => cat.id !== 'all')
                  .map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.modalCategoryButton,
                        { borderColor: category.color },
                        newTodo.category === category.id && {
                          backgroundColor: category.color,
                        },
                      ]}
                      onPress={() =>
                        setNewTodo(prev => ({ ...prev, category: category.id }))
                      }
                    >
                      <Text
                        style={[
                          styles.modalCategoryText,
                          {
                            color:
                              newTodo.category === category.id
                                ? '#fff'
                                : category.color,
                          },
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>

            <TextInput
              style={[styles.modalInput, isDarkMode && styles.darkInput]}
              placeholder="Tags (comma separated)"
              placeholderTextColor={isDarkMode ? '#888' : '#666'}
              value={newTodo.tags}
              onChangeText={tags => setNewTodo(prev => ({ ...prev, tags }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  toggleAddModal();
                  // Reset form when canceling
                  setNewTodo({
                    text: '',
                    priority: 'medium',
                    category: 'personal',
                    tags: '',
                    dueDate: '',
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  !newTodo.text.trim() && styles.disabledButton,
                ]}
                onPress={addNewTodo}
                disabled={!newTodo.text.trim()}
              >
                <Text style={styles.saveButtonText}>Add Todo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 10,
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  clearAllButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearAllButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyStatsState: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyStatsText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  categoryFilter: {
    marginBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityFilter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  priorityButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  selectedPriorityButton: {
    backgroundColor: '#1976d2',
  },
  priorityButtonText: {
    fontSize: 12,
    color: '#666',
  },
  selectedPriorityText: {
    color: '#fff',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
  },
  toggleButtonActive: {
    backgroundColor: '#1976d2',
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  todoList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  todoItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  darkTodoItem: {
    backgroundColor: '#2a2a2a',
  },
  todoContent: {
    flex: 1,
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  todoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginLeft: 32,
  },
  categoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  categoryTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    color: '#1976d2',
    fontSize: 10,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 'auto',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#1976d2',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  modalRow: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalPriorityContainer: {
    flexDirection: 'row',
  },
  modalPriorityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
    marginRight: 8,
  },
  modalPriorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalCategoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalCategoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  modalCategoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#4caf50',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  darkInput: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  darkText: {
    color: '#fff',
  },
  darkDescription: {
    color: '#888',
  },
});

export default TodoAppScreen;
